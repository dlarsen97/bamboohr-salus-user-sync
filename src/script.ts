import { getSalus } from "./salus/init";
import { getEmployeesDataset, listEmployeeTrainings, deduplicateEmployees, BambooEmployee, training, trainingDef } from "./bamboohr/init";
import { CreateCertificateV1CertificatePostBodyParam, CreateV1UserPostBodyParam } from "@api/salus";
import { writeFileSync } from "node:fs";

import trainingTypesRaw from "./bamboohr/trainingTypesBamboo.json"
import { trainingMap } from "./trainingMap";
const trainingTypes = trainingTypesRaw as Record<string, trainingDef>;

import { to_csv } from "./random/random";
import { ListEmployeeTrainingsResponse200 } from "@api/bamboohr";
import { RunLogger } from "./logger";
import assert from "node:assert";

const STACY_WITBECK_ID = 1246989

type BambooUserWithTrainings = BambooEmployee & { trainings: { training: training, trainingDef: trainingDef }[] }

type TrainingEntry = {
    payload: CreateCertificateV1CertificatePostBodyParam;
    bambooTrainingId: string;
    bambooTrainingTypeId: string;
};

function makePassword(bambUser: BambooUserWithTrainings): string {
    const first = bambUser.firstName ?? ''
    const last = bambUser.lastName ?? ''
    const dob = (bambUser.dateOfBirth ?? '').replace(/-/g, '')
    const phone = (bambUser.homePhone || bambUser.mobilePhone || bambUser.workPhone || bambUser.customField5886 || '').replace(/\D/g, '').slice(-4)
    return `${first}${last}${dob}${phone}!`
}

function bambUserToSalus(bambUser: BambooUserWithTrainings): { user: Partial<CreateV1UserPostBodyParam>, trainings: TrainingEntry[] } {
    const user = {
        "firstName": bambUser.firstName,
        "lastName": bambUser.lastName,
        "email": bambUser.email || bambUser.customField4318,
        "phone": bambUser.homePhone || bambUser.customField5886 || null,
        "phoneCell": bambUser.mobilePhone,
        "phoneWork": bambUser.workPhone,
        "address": null,
        "city": bambUser.jobInformationLocation,
        "postalCode": null,
        "country": null,
        "timezone": null,
        "birthDate": bambUser.dateOfBirth,
        "industryId": null,
        "tradeId": null,
        "emergencyContact": bambUser.emergencyContactName || null,
        "emergencyContactPhone": bambUser.emergencyContactMobilePhone || bambUser.emergencyContactHomePhone || bambUser.emergencyContactWorkPhone || null,
        "password": makePassword(bambUser),
        "companyUser": {
            isActive: true,
            editTimer: false,
            createTimer: false,
            documentAccess: "none" as const,
            feedAccess: "none" as const,
            employeeId: bambUser.employeeNumber,
            position: "",
            roleId: 64205, // TODO: set the correct roleId
        },
    } as unknown as CreateV1UserPostBodyParam

    const relevantTrainings = bambUser.trainings.filter(train => trainingMap[train.training.type])

    const trainings: TrainingEntry[] = relevantTrainings.map(train => ({
        payload: {
            type: train.trainingDef.name,
            userId: -1, // filled in after user is created
            expiryDate: train.trainingDef.renewable
                ? (() => { const d = new Date(train.training.completed); d.setMonth(d.getMonth() + Number(train.trainingDef.frequency)); return d.toISOString().replace('Z', ''); })()
                : undefined,
            trainingCompanyId: STACY_WITBECK_ID,
            approved: false,
            companyCertificationTypeId: trainingMap[train.training.type]
        } as CreateCertificateV1CertificatePostBodyParam,
        bambooTrainingId: train.training.id,
        bambooTrainingTypeId: train.training.type,
    }))

    return { user, trainings }
}


async function main() {
    const salus = await getSalus();
    const logger = new RunLogger(trainingMap);

    // pull bamboohr users and deduplicate (emergency contacts introduce one row per contact)
    const bambooUsers = deduplicateEmployees(await getEmployeesDataset());

    // pull salus users
    const response = await salus.search_v1_user__get({ is_active: true });
    const salusUsers = response.data.data ?? [];

    // build lookup maps keyed by employeeNumber for O(1) joins
    const bambooByEmployeeNumber = new Map(bambooUsers.filter(u => u.employeeNumber).map(user => [user.employeeNumber!, user]));
    const salusByEmployeeNumber = new Map(salusUsers.filter(u => u.companyUser?.employeeId).map(user => [user.companyUser!.employeeId, user]));

    const inBoth = bambooUsers.filter(user => user.employeeNumber && salusByEmployeeNumber.has(user.employeeNumber));
    const properFull = inBoth.map(bambooUser => ({ bambooUser, salusUser: salusByEmployeeNumber.get(bambooUser.employeeNumber!)! }));

    const bambooNoSalus = bambooUsers.filter(user => !salusByEmployeeNumber.has(user.employeeNumber!));
    // users from salus where the employee id is not set or that employee id does not exist in bamboo
    const salusNoBamboo = salusUsers.filter(user => !user.companyUser?.employeeId || !bambooByEmployeeNumber.has(user.companyUser.employeeId));

    console.log("original bamboo:", bambooUsers.length);
    console.log("original salus:", salusUsers?.length);
    console.log("proper mapping:", properFull.length);
    console.log("not in Salus:", bambooNoSalus.length)
    console.log("not in bamboo/no employeeId in Salus:", salusNoBamboo?.length)

    assert(bambooUsers.length + salusUsers.length === (properFull.length * 2) + bambooNoSalus.length + salusNoBamboo.length)

    // fetch trainings for every bamboo user that has no salus account
    const bambooNoSalusWTraining = await Promise.all(bambooNoSalus.map(async bambUser => {
        const response = await listEmployeeTrainings(Number(bambUser.eeid))
        const disUserTrainings = response.data as unknown as Record<string, training>
        const trainings: { training: training, trainingDef: trainingDef }[] =
            Object.values(disUserTrainings).map(training => ({ training, trainingDef: trainingTypes[training.type] }))
        return { ...bambUser, trainings }
    }))

    const newSalusWTrainings = bambooNoSalusWTraining.map(bambUser => bambUserToSalus(bambUser));

    // push new users + certificates to Salus
    for (let i = 0; i < newSalusWTrainings.length; i++) {
        const { user, trainings } = newSalusWTrainings[i];
        const bambUser = bambooNoSalusWTraining[i];
        console.log("asdf:", user, trainings, bambUser)

        let salusUserId: number | undefined;
        // console.log("asdf:", user, trainings, bambUser)
        // return;
        let createUserResp = undefined
        try {
            createUserResp = await salus.create_v1_user__post(user as CreateV1UserPostBodyParam);
            if (createUserResp.data.data) {
                salusUserId = createUserResp.data.data.id;
                logger.logUserCreated(bambUser, user, createUserResp.data.data as { id: number });
            } else {
                logger.logUserFailed(bambUser, user, createUserResp.data.error ?? 'no data in response');
            }
        } catch (err: any) {
            console.error("validation errors:", JSON.stringify(err.data?.detail ?? err, null, 2))
            logger.logUserFailed(bambUser, user, err);
            return
        }

        if (salusUserId === undefined) {
            // user creation failed — skip certificates for this user
            continue;
        }

        // Create Certificates
        for (const { payload, bambooTrainingId, bambooTrainingTypeId } of trainings) {
            const certPayload = { ...payload, userId: salusUserId };
            try {
                const certResp = await salus.create_certificate_v1_certificate__post(certPayload);
                if (certResp.data.data) {
                    logger.logCertificateCreated(
                        bambUser.eeid!,
                        bambooTrainingId,
                        bambooTrainingTypeId,
                        salusUserId,
                        certPayload,
                        certResp.data.data as { id: number }
                    );
                } else {
                    logger.logCertificateFailed(
                        bambUser.eeid!,
                        bambooTrainingId,
                        bambooTrainingTypeId,
                        salusUserId,
                        certPayload,
                        certResp.data.error ?? 'no data in response'
                    );
                }
            } catch (err) {
                logger.logCertificateFailed(
                    bambUser.eeid!,
                    bambooTrainingId,
                    bambooTrainingTypeId,
                    salusUserId,
                    certPayload,
                    err
                );
            }
            // breaking because pushing to salus is not tested yet and I want to examine what it looks like before pushing all of them.
        }
        break;

    }


    logger.finalize({
        bambooTotal: bambooUsers.length,
        salusTotal: salusUsers.length,
        alreadyMapped: properFull.length,
        newUsersAttempted: newSalusWTrainings.length,
    });
}

main()

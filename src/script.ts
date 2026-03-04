import { getSalus } from "./salus/init";
import { getEmployeesDataset, listEmployeeTrainings, BambooEmployee, training, trainingDef } from "./bamboohr/init";
import { CreateCertificateV1CertificatePostBodyParam, CreateV1UserPostBodyParam } from "@api/salus";
import { writeFileSync } from "node:fs";

import trainingTypesRaw from "./bamboohr/trainingTypesBamboo.json"
import { trainingMap } from "./trainingMap";
const trainingTypes = trainingTypesRaw as Record<string, trainingDef>;

import { to_csv } from "./random/random";
import { ListEmployeeTrainingsResponse200 } from "@api/bamboohr";

const STACY_WITBECK_ID = 1246989

type BambooUserWithTrainings = BambooEmployee & { trainings: { training: training, trainingDef: trainingDef }[] }

function bambUserToSalus(bambUser: BambooUserWithTrainings) {
    const user = {
        "firstName": bambUser.firstName,
        "lastName": bambUser.lastName,
        "email": bambUser.email || bambUser.customField4318,
        "phone": bambUser.homePhone || bambUser.customField5886,
        "phoneCell": bambUser.mobilePhone,
        "phoneWork": bambUser.workPhone,

        // "address": bambUser.,
        "city": bambUser.jobInformationLocation,
        // "postalCode": ,
        // "country": ,
        // "timezone": ,
        "birthDate": bambUser.dateOfBirth,
        // "industryId": ,
        // "tradeId": ,
        "emergencyContact": bambUser.emergencyContactName,
        "emergencyContactPhone": bambUser.emergencyContactMobilePhone || bambUser.emergencyContactHomePhone || bambUser.emergencyContactWorkPhone,
        // "password": bambUser.firstName,
        "companyUser": {
            isActive: true,
            editTimer: false,
            createTimer: false,
            documentAccess: "none" as const,
            feedAccess: "none" as const,
            employeeId: bambUser.employeeNumber,
            position: "",
            // roleId: 0, // TODO: set the correct roleId
        },
    } as Partial<CreateV1UserPostBodyParam>

    // const uniqueTypes = [...new Set(bambUser.trainings.map(t => t.training.type))]
    // console.log("bamboo type IDs seen:", uniqueTypes.slice(0, 5))
    // console.log("trainingMap keys sample:", Object.keys(trainingMap).slice(0, 5))
    // console.log("trainingMap values sample:", Object.values(trainingMap).slice(0, 5))
    const relevantTrainings = bambUser.trainings.filter(train => trainingMap[train.training.type])

    const trainings = relevantTrainings.map(train => ({
        type: train.trainingDef.name,
        userId: -1, // filled after user is created
        expiryDate: train.trainingDef.renewable
            ? (() => { const d = new Date(train.training.completed); d.setMonth(d.getMonth() + Number(train.trainingDef.frequency)); return d.toISOString().replace('Z', ''); })()
            : undefined,
        trainingCompanyId: STACY_WITBECK_ID,
        approved: undefined, // not sure yet
        // approvedByUserId: undefined,
        // offline: undefined,
        // providerId: 1,
        companyCertificationTypeId: trainingMap[train.training.type]
    } as CreateCertificateV1CertificatePostBodyParam))

    return { user, trainings }
}

async function main() {
    const salus = await getSalus();
    // push users from bamboohr to salus users

    // pull bamboohr users
    const bambooUsers = await getEmployeesDataset();


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
    //for each user create the trainings that need to be created
    // const userTrainings: any = {}
    console.log(trainingMap)
    const bambooNoSalusWTraining = await Promise.all(bambooNoSalus.map(async bambUser => {
        const response = await listEmployeeTrainings(Number(bambUser.eeid))
        const disUserTrainings = response.data as unknown as Record<string, training>
        const trainings: { training: training, trainingDef: trainingDef }[] =
            Object.values(disUserTrainings).map(training => ({ training, trainingDef: trainingTypes[training.type] }))
        return { ...bambUser, trainings }
    }))
    // const bambTrainingIds = Object.keys(trainingMap);
    // const training = all_trainings.filter(train => bambTrainingIds.includes(train.type))

    // console.log("found one!!!", training)
    // transform bamboo into salus post command
    // const all_trainings = []
    const newSalusWTrainings = [];
    for (const bambUser of bambooNoSalusWTraining) {
        // all_trainings.push(...bambUser.trainings)
        const result = bambUserToSalus(bambUser)
        newSalusWTrainings.push(result)
        // if (result.trainings.length > 0) {
        //     console.log("found some trainings that will transfer", )
        //     break
        // }
    }
    // console.log("exist?:", all_trainings.filter(train=> Object.keys(trainingMap).includes(train.training.type)))
    // return
    // push them
    for (const newSalusUser of newSalusWTrainings) {
        if (newSalusUser.trainings.length > 0) {
            console.log("update:", newSalusUser)
            return
        }
        const createUserResp = await salus.create_v1_user__post(newSalusUser.user as CreateV1UserPostBodyParam)

        if (createUserResp.data.data) {
            //user exists/was create successfully
            for (const training of newSalusUser.trainings) {
                // "response":{"200":{"properties":{"error":{"type":"boolean","title":"Error Indicator","description":"A boolean error indicator.","default":false},"message":{"title":"Response Message","description":"Optional message.","type":"string"},"data":{"title":"Response Data","description":"The response data for any given request.","properties":{"type":{"type":"string","title":"Certificate Name","description":"The name of the certificate","examples":["First Aid"]},"userId":{"type":"integer","title":"User ID","description":"The identifier of the user this certificate belongs to","examples":[1]},"expiryDate":{"title":"Expiry Date","description":"The certificate's expiry date","examples":["2027-02-24T22:20:20.686316"],"type":"string","format":"date-time"},"trainingCompanyId":{"title":"Training Company","description":"The identifier of the company that provided the training for the certificate","examples":[13],"type":"integer"},"approved":{"title":"Approved","description":"Determines if the certificate has been approved","examples":[true],"type":"boolean"},"approvedByUserId":{"title":"Approved By","description":"The identifier of the user who approved the certificate.","examples":[13],"type":"integer"},"offline":{"title":"Offline","description":"Determines if offline mode is enabled","examples":[true],"type":"boolean"},"providerId":{"title":"Certification Provider ID","description":"The identifier of the provider of the certification, this field is company specific.","examples":[15],"type":"integer"},"id":{"type":"integer","title":"ID","description":"The certification identifier","examples":[1]},"url":{"title":"URL","description":"The certification url","examples":["/upload/example-certificate.jpg"],"type":"string"},"urlBack":{"title":"URL Back","description":"The url of the backside of the certificate","examples":["/upload/example-certificate-back.jpg"],"type":"string"}},"type":"object","required":["type","userId","id"]}},"type":"object","title":"ApiGenericResponse[CertificateModel]","$schema":"https://json-schema.org/draft/2020-12/schema#"},"400":{"properties":{"error":{"type":"boolean","title":"Error Indicator","description":"A boolean error indicator.","default":false},"message":{"title":"Response Message","description":"Optional message.","type":"string"},"data":{"title":"Response Data","description":"The response data for any given request.","properties":{"requestPath":{"title":"Request Path","description":"The path of the request that generated the error.","type":"string"},"requestMethod":{"title":"Request HTTP Method","description":"The HTTP method of the request that generated the error.","type":"string"},"errorType":{"type":"string","title":"The Error Type that Occurred","description":"The type of error that occurred, broadly it can be 'Database', 'BusinessLogic', or 'Permissions`"},"errorTypeDetail":{"title":"Errortypedetail","description":"If available, an additional categorization of the error that occurred.","type":"string"},"errorDetail":{"title":"Errordetail","type":"string"}},"type":"object","required":["errorType"]}},"type":"object","title":"ApiGenericResponse[ErrorDetail]","$schema":"https://json-schema.org/draft/2020-12/schema#"},"403":{"properties":{"error":{"type":"boolean","title":"Error Indicator","description":"A boolean error indicator.","default":false},"message":{"title":"Response Message","description":"Optional message.","type":"string"},"data":{"title":"Response Data","description":"The response data for any given request.","properties":{"requestPath":{"title":"Request Path","description":"The path of the request that generated the error.","type":"string"},"requestMethod":{"title":"Request HTTP Method","description":"The HTTP method of the request that generated the error.","type":"string"},"errorType":{"type":"string","title":"The Error Type that Occurred","description":"The type of error that occurred, broadly it can be 'Database', 'BusinessLogic', or 'Permissions`"},"errorTypeDetail":{"title":"Errortypedetail","description":"If available, an additional categorization of the error that occurred.","type":"string"},"errorDetail":{"title":"Errordetail","type":"string"}},"type":"object","required":["errorType"]}},"type":"object","title":"ApiGenericResponse[ErrorDetail]","$schema":"https://json-schema.org/draft/2020-12/schema#"},"409":{"properties":{"error":{"type":"boolean","title":"Error Indicator","description":"A boolean error indicator.","default":false},"message":{"title":"Response Message","description":"Optional message.","type":"string"},"data":{"title":"Response Data","description":"The response data for any given request.","properties":{"requestPath":{"title":"Request Path","description":"The path of the request that generated the error.","type":"string"},"requestMethod":{"title":"Request HTTP Method","description":"The HTTP method of the request that generated the error.","type":"string"},"errorType":{"type":"string","title":"The Error Type that Occurred","description":"The type of error that occurred, broadly it can be 'Database', 'BusinessLogic', or 'Permissions`"},"errorTypeDetail":{"title":"Errortypedetail","description":"If available, an additional categorization of the error that occurred.","type":"string"},"errorDetail":{"title":"Errordetail","type":"string"}},"type":"object","required":["errorType"]}},"type":"object","title":"ApiGenericResponse[ErrorDetail]","$schema":"https://json-schema.org/draft/2020-12/schema#"},"422":{"properties":{"detail":{"items":{"properties":{"loc":{"items":{"anyOf":[{"type":"string"},{"type":"integer"}]},"type":"array","title":"Location"},"msg":{"type":"string","title":"Message"},"type":{"type":"string","title":"Error Type"}},"type":"object","required":["loc","msg","type"],"title":"ValidationError"},"type":"array","title":"Detail"}},"type":"object","title":"HTTPValidationError","$schema":"https://json-schema.org/draft/2020-12/schema#"}}
                const response = await salus.create_certificate_v1_certificate__post({ ...training, userId: createUserResp.data.data?.id })
                if (response.data.error) {
                    console.log("failed to push certificate:", response)
                }
            }
        }
        else {
            console.error("user not create successfully:", createUserResp)
        }
        // salus.create_certificate_v1_certificate__post
        return
    }

}

main()
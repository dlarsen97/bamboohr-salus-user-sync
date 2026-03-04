/**
 * Sync existing users (those already in both BambooHR and Salus).
 *
 * For each matched user:
 *   1. Update any changed profile fields in Salus
 *   2. Check that every relevant BambooHR training has a certificate in Salus
 *   3. Create any missing certificates
 *
 * Usage:
 *   npx ts-node src/sync.ts
 */

import { getSalus } from "./salus/init";
import { getEmployeesDataset, listEmployeeTrainings, deduplicateEmployees, BambooEmployee, training, trainingDef } from "./bamboohr/init";
import { CreateCertificateV1CertificatePostBodyParam } from "@api/salus";
import trainingTypesRaw from "./bamboohr/trainingTypesBamboo.json"
import { trainingMap } from "./trainingMap";
import { RunLogger } from "./logger";

const trainingTypes = trainingTypesRaw as Record<string, trainingDef>;
const STACY_WITBECK_ID = 1246989

// Fields we sync from BambooHR into the PUT body.
// Salus-owned fields (address, postalCode, country, timezone, industryId, tradeId)
// are read from the current Salus record and passed through unchanged.
type PutUserBody = {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    phoneCell: string | null;
    phoneWork: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    timezone: string | null;
    birthDate: string | null;
    industryId: number | null;
    tradeId: number | null;
    emergencyContact: string | null;
    emergencyContactPhone: string | null;
};

// Fields we compare to decide whether to PUT (the bamboo-owned subset)
const BAMBOO_MANAGED_FIELDS: (keyof PutUserBody)[] = [
    'firstName', 'lastName', 'email', 'phone', 'phoneCell', 'phoneWork',
    'city', 'birthDate', 'emergencyContact', 'emergencyContactPhone',
];

function bambooFields(bambUser: BambooEmployee): Pick<PutUserBody, typeof BAMBOO_MANAGED_FIELDS[number]> {
    return {
        firstName: bambUser.firstName,
        lastName: bambUser.lastName,
        email: bambUser.email || bambUser.customField4318,
        phone: bambUser.homePhone || bambUser.customField5886 || null,
        phoneCell: bambUser.mobilePhone,
        phoneWork: bambUser.workPhone,
        city: bambUser.jobInformationLocation,
        birthDate: bambUser.dateOfBirth,
        emergencyContact: bambUser.emergencyContactName || null,
        emergencyContactPhone: bambUser.emergencyContactMobilePhone || bambUser.emergencyContactHomePhone || bambUser.emergencyContactWorkPhone || null,
    };
}

// Normalize a value for comparison: null/undefined/"" all treated as null,
// dates trimmed to YYYY-MM-DD so bamboo "2000-01-01" matches salus "2000-01-01T00:00:00".
function normalize(val: unknown): string | null {
    if (val === null || val === undefined || val === '') return null;
    const s = String(val);
    const dateMatch = s.match(/^(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : s;
}

function diffBambooFields(
    desired: Pick<PutUserBody, typeof BAMBOO_MANAGED_FIELDS[number]>,
    current: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> | null {
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const field of BAMBOO_MANAGED_FIELDS) {
        const desiredNorm = normalize(desired[field]);
        const currentNorm = normalize(current[field]);
        if (desiredNorm !== currentNorm) {
            changes[field] = { from: current[field] ?? null, to: desired[field] ?? null };
        }
    }
    return Object.keys(changes).length > 0 ? changes : null;
}

async function main() {
    const salus = await getSalus();
    const logger = new RunLogger(trainingMap);

    const bambooUsers = deduplicateEmployees(await getEmployeesDataset());
    const salusSearchResp = await salus.search_v1_user__get({ is_active: true });
    const salusUsers = salusSearchResp.data.data ?? [];

    const bambooByEmployeeNumber = new Map(
        bambooUsers.filter(u => u.employeeNumber).map(u => [u.employeeNumber!, u])
    );
    const salusByEmployeeNumber = new Map(
        salusUsers.filter(u => u.companyUser?.employeeId).map(u => [u.companyUser!.employeeId, u])
    );

    const properFull = bambooUsers
        .filter(u => u.employeeNumber && salusByEmployeeNumber.has(u.employeeNumber))
        .map(bambUser => ({ bambUser, salusUser: salusByEmployeeNumber.get(bambUser.employeeNumber!)! }));

    console.log(`syncing ${properFull.length} matched users`);

    for (const { bambUser, salusUser } of properFull) {
        const salusUserId = salusUser.id as number;
        console.log(`\nuser bamboo=${bambUser.eeid} emp#${bambUser.employeeNumber} → salus=${salusUserId}`);

        // --- 1. Update profile if any bamboo-managed fields changed ---
        let currentProfile: Record<string, unknown>;
        try {
            const profileResp = await salus.get_user_profile_v1_user__user_id___get({ user_id: salusUserId });
            currentProfile = (profileResp.data.data ?? {}) as Record<string, unknown>;
        } catch (err) {
            console.error(`  [!] could not fetch profile, skipping update check: ${err}`);
            currentProfile = {};
        }

        const desired = bambooFields(bambUser);
        const changes = diffBambooFields(desired, currentProfile);

        if (changes) {
            console.log("changes:", changes);
            // continue
            // Build the full PUT body: bamboo-managed fields + salus-owned fields preserved
            // const putBody: PutUserBody = {
            //     ...desired,
            //     address: (currentProfile.address as string | null) ?? null,
            //     postalCode: (currentProfile.postalCode as string | null) ?? null,
            //     country: (currentProfile.country as string | null) ?? null,
            //     timezone: (currentProfile.timezone as string | null) ?? null,
            //     industryId: (currentProfile.industryId as number | null) ?? null,
            //     tradeId: (currentProfile.tradeId as number | null) ?? null,
            // };
            // try {
            //     await salus.update_user_profile_v1_user__user_id___put(putBody as any, { user_id: salusUserId });
            //     logger.logUserUpdated(bambUser, salusUserId, changes, putBody);
            // } catch (err: any) {
            //     const detail = err.data?.detail ?? err;
            //     console.error(`  [!] update errors: ${JSON.stringify(detail)}`);
            //     logger.logUserUpdateFailed(bambUser, salusUserId, putBody, err);
            // }
        } else {
            console.log(`  [=] no profile changes`);
        }
        // --- 2. Sync certificates ---
        let salusCerts: { companyCertificationTypeId: number | null }[] = [];
        try {
            const certsResp = await salus.search_v1_certificate__get({ user_id: salusUserId, limit: 1000 });
            salusCerts = (certsResp.data.data ?? []) as typeof salusCerts;
        } catch (err) {
            console.error(`  [!] could not fetch certificates, skipping cert sync: ${err}`);
            continue;
        }
        
        const salusCertTypeIds = new Set(
            salusCerts.map(c => c.companyCertificationTypeId).filter((id): id is number => id != null)
        );
        
        let bambooTrainings: { training: training; trainingDef: trainingDef }[] = [];
        try {
            const trainResp = await listEmployeeTrainings(Number(bambUser.eeid));
            const raw = trainResp.data as unknown as Record<string, training>;
            bambooTrainings = Object.values(raw).map(t => ({ training: t, trainingDef: trainingTypes[t.type] }));
        } catch (err) {
            console.error(`  [!] could not fetch bamboo trainings, skipping cert sync: ${err}`);
            continue;
        }
        
        const missingTrainings = bambooTrainings.filter(({ training: t }) => {
            const salusCertTypeId = trainingMap[t.type];
            return salusCertTypeId && !salusCertTypeIds.has(salusCertTypeId);
        });
        
        console.log(`  certs: ${salusCerts.length} in salus, ${bambooTrainings.filter(t => trainingMap[t.training.type]).length} mapped in bamboo, ${missingTrainings.length} to create`);
        continue;

        for (const { training: t, trainingDef: def } of missingTrainings) {
            const expiryDate = def?.renewable
                ? (() => { const d = new Date(t.completed); d.setMonth(d.getMonth() + Number(def.frequency)); return d.toISOString().replace('Z', ''); })()
                : undefined;

            const certPayload: CreateCertificateV1CertificatePostBodyParam = {
                type: def?.name ?? t.type,
                userId: salusUserId,
                expiryDate,
                trainingCompanyId: STACY_WITBECK_ID,
                approved: false,
                companyCertificationTypeId: trainingMap[t.type],
            };

            try {
                const certResp = await salus.create_certificate_v1_certificate__post(certPayload);
                if (certResp.data.data) {
                    logger.logCertificateCreated(bambUser.eeid!, t.id, t.type, salusUserId, certPayload, certResp.data.data as { id: number });
                } else {
                    logger.logCertificateFailed(bambUser.eeid!, t.id, t.type, salusUserId, certPayload, certResp.data.error ?? 'no data in response');
                }
            } catch (err) {
                logger.logCertificateFailed(bambUser.eeid!, t.id, t.type, salusUserId, certPayload, err);
            }
        }
    }

    logger.finalize({
        bambooTotal: bambooUsers.length,
        salusTotal: salusUsers.length,
        alreadyMapped: properFull.length,
        newUsersAttempted: 0,
    });
}

main().catch(err => { console.error(err); process.exit(1); });

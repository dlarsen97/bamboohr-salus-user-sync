/**
 * Retry failed operations from a previous run.
 *
 * Usage:
 *   npx ts-node src/retry.ts logs/2026-03-04T12-00-00
 *
 * Workflow:
 *   1. Inspect logs/<run>/failed-users.json and/or failed-certificates.json
 *   2. Edit the "salusPayload" field in those files to fix the problem
 *   3. Run this script pointing at that log directory
 *   4. A new sub-log directory is created under logs/ for the retry session
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getSalus } from "./salus/init";
import { CreateCertificateV1CertificatePostBodyParam, CreateV1UserPostBodyParam } from "@api/salus";
import { RunLogger, FailedUser, FailedCertificate } from "./logger";
import { trainingMap } from "./trainingMap";

function loadJson<T>(path: string): T | null {
    try {
        return JSON.parse(readFileSync(path, 'utf-8')) as T;
    } catch {
        return null;
    }
}

async function retry(logDir: string) {
    const salus = await getSalus();
    const logger = new RunLogger(trainingMap);

    const failedUsers = loadJson<FailedUser[]>(join(logDir, 'failed-users.json')) ?? [];
    const failedCerts = loadJson<FailedCertificate[]>(join(logDir, 'failed-certificates.json')) ?? [];

    console.log(`retrying ${failedUsers.length} users, ${failedCerts.length} certificates from ${logDir}\n`);

    // Map bambooEeid → new salusUserId for users successfully created in this retry run
    const newSalusIds = new Map<string, number>();

    // --- retry users ---
    for (const failed of failedUsers) {
        try {
            const resp = await salus.create_v1_user__post(failed.salusPayload as CreateV1UserPostBodyParam);
            if (resp.data.data) {
                logger.logUserCreated(failed.bambooUser, failed.salusPayload, resp.data.data as { id: number });
                newSalusIds.set(failed.bambooEeid, resp.data.data.id);
            } else {
                logger.logUserFailed(failed.bambooUser, failed.salusPayload, resp.data.error ?? 'no data in response');
            }
        } catch (err) {
            logger.logUserFailed(failed.bambooUser, failed.salusPayload, err);
        }
    }

    // --- retry certificates ---
    for (const failed of failedCerts) {
        // If the user was just successfully created in this retry, use the new id
        const salusUserId = newSalusIds.get(failed.bambooEeid) ?? failed.salusUserId;
        const payload: CreateCertificateV1CertificatePostBodyParam = { ...failed.salusPayload, userId: salusUserId };

        try {
            const resp = await salus.create_certificate_v1_certificate__post(payload);
            if (resp.data.data) {
                logger.logCertificateCreated(
                    failed.bambooEeid,
                    failed.bambooTrainingId,
                    failed.bambooTrainingTypeId,
                    salusUserId,
                    payload,
                    resp.data.data as { id: number }
                );
            } else {
                logger.logCertificateFailed(
                    failed.bambooEeid,
                    failed.bambooTrainingId,
                    failed.bambooTrainingTypeId,
                    salusUserId,
                    payload,
                    resp.data.error ?? 'no data in response'
                );
            }
        } catch (err) {
            logger.logCertificateFailed(
                failed.bambooEeid,
                failed.bambooTrainingId,
                failed.bambooTrainingTypeId,
                salusUserId,
                payload,
                err
            );
        }
    }

    logger.finalize({
        bambooTotal: 0,
        salusTotal: 0,
        alreadyMapped: 0,
        newUsersAttempted: failedUsers.length,
        usersCreated: 0,         // overridden by finalize
        usersFailed: 0,          // overridden by finalize
        certificatesCreated: 0,  // overridden by finalize
        certificatesFailed: 0,   // overridden by finalize
    });
}

const logDir = process.argv[2];
if (!logDir) {
    console.error('Usage: npx ts-node src/retry.ts <log-dir>');
    console.error('Example: npx ts-node src/retry.ts logs/2026-03-04T12-00-00');
    process.exit(1);
}

retry(logDir).catch(err => { console.error(err); process.exit(1); });

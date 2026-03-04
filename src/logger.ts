import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CreateCertificateV1CertificatePostBodyParam, CreateV1UserPostBodyParam } from "@api/salus";
import { BambooEmployee } from "./bamboohr/init";

export type UserIdMapping = {
    bambooEeid: string;
    bambooEmployeeNumber: string | null;
    salusUserId: number;
};

export type CertificateIdMapping = {
    bambooEeid: string;
    bambooTrainingId: string;
    bambooTrainingTypeId: string;
    salusUserId: number;
    salusCertificateId: number;
};

export type CreatedUser = {
    bambooEeid: string;
    bambooEmployeeNumber: string | null;
    salusUserId: number;
    bambooUser: BambooEmployee;
    salusPayload: Partial<CreateV1UserPostBodyParam>;
    salusResponse: unknown;
    timestamp: string;
};

export type FailedUser = {
    bambooEeid: string;
    bambooEmployeeNumber: string | null;
    bambooUser: BambooEmployee;
    /** Edit this payload to fix the issue, then run retry.ts */
    salusPayload: Partial<CreateV1UserPostBodyParam>;
    error: string;
    timestamp: string;
};

export type CreatedCertificate = {
    bambooEeid: string;
    bambooTrainingId: string;
    bambooTrainingTypeId: string;
    salusUserId: number;
    salusCertificateId: number;
    salusPayload: CreateCertificateV1CertificatePostBodyParam;
    timestamp: string;
};

export type FailedCertificate = {
    bambooEeid: string;
    bambooTrainingId: string;
    bambooTrainingTypeId: string;
    salusUserId: number;
    /** Edit this payload to fix the issue, then run retry.ts */
    salusPayload: CreateCertificateV1CertificatePostBodyParam;
    error: string;
    timestamp: string;
};

export type UpdatedUser = {
    bambooEeid: string;
    bambooEmployeeNumber: string | null;
    salusUserId: number;
    /** Field-level diff: what changed from→to */
    changes: Record<string, { from: unknown; to: unknown }>;
    putPayload: unknown;
    timestamp: string;
};

export type FailedUserUpdate = {
    bambooEeid: string;
    bambooEmployeeNumber: string | null;
    salusUserId: number;
    /** Edit this payload to fix the issue, then retry */
    putPayload: unknown;
    error: string;
    timestamp: string;
};

export type RunSummary = {
    startTime: string;
    endTime: string;
    logDir: string;
    bambooTotal: number;
    salusTotal: number;
    alreadyMapped: number;
    newUsersAttempted: number;
    usersCreated: number;
    usersFailed: number;
    usersUpdated: number;
    userUpdatesFailed: number;
    certificatesCreated: number;
    certificatesFailed: number;
};

export class RunLogger {
    readonly dir: string;
    private userIdMap: UserIdMapping[] = [];
    private certificateIdMap: CertificateIdMapping[] = [];
    private createdUsers: CreatedUser[] = [];
    private failedUsers: FailedUser[] = [];
    private updatedUsers: UpdatedUser[] = [];
    private failedUserUpdates: FailedUserUpdate[] = [];
    private createdCertificates: CreatedCertificate[] = [];
    private failedCertificates: FailedCertificate[] = [];
    private startTime: Date;

    constructor(trainingTypeMap: Record<string, number>) {
        this.startTime = new Date();
        const timestamp = this.startTime.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        this.dir = join(process.cwd(), 'logs', timestamp);
        mkdirSync(this.dir, { recursive: true });
        // Snapshot the bamboo→salus training-type mapping for this run
        writeFileSync(join(this.dir, 'training-type-map.json'), JSON.stringify(trainingTypeMap, null, 2));
        console.log(`[logger] session started  dir=${this.dir}`);
    }

    logUserCreated(bambooUser: BambooEmployee, salusPayload: Partial<CreateV1UserPostBodyParam>, salusResponse: { id: number }) {
        const salusUserId = salusResponse.id;
        this.userIdMap.push({
            bambooEeid: bambooUser.eeid!,
            bambooEmployeeNumber: bambooUser.employeeNumber,
            salusUserId,
        });
        this.createdUsers.push({
            bambooEeid: bambooUser.eeid!,
            bambooEmployeeNumber: bambooUser.employeeNumber,
            salusUserId,
            bambooUser,
            salusPayload,
            salusResponse,
            timestamp: new Date().toISOString(),
        });
        this.flush();
        console.log(`[+] user created  bamboo=${bambooUser.eeid} emp#${bambooUser.employeeNumber} → salus=${salusUserId}`);
    }

    logUserFailed(bambooUser: BambooEmployee, salusPayload: Partial<CreateV1UserPostBodyParam>, error: unknown) {
        this.failedUsers.push({
            bambooEeid: bambooUser.eeid!,
            bambooEmployeeNumber: bambooUser.employeeNumber,
            bambooUser,
            salusPayload,
            error: String(error),
            timestamp: new Date().toISOString(),
        });
        this.flush();
        console.error(`[!] user FAILED  bamboo=${bambooUser.eeid} emp#${bambooUser.employeeNumber}  ${String(error)}`);
    }

    logUserUpdated(
        bambooUser: BambooEmployee,
        salusUserId: number,
        changes: Record<string, { from: unknown; to: unknown }>,
        putPayload: unknown
    ) {
        this.updatedUsers.push({
            bambooEeid: bambooUser.eeid!,
            bambooEmployeeNumber: bambooUser.employeeNumber,
            salusUserId,
            changes,
            putPayload,
            timestamp: new Date().toISOString(),
        });
        this.flush();
        const fields = Object.keys(changes).join(', ');
        console.log(`[~] user updated  bamboo=${bambooUser.eeid} emp#${bambooUser.employeeNumber} → salus=${salusUserId}  (${fields})`);
    }

    logUserUpdateFailed(
        bambooUser: BambooEmployee,
        salusUserId: number,
        putPayload: unknown,
        error: unknown
    ) {
        this.failedUserUpdates.push({
            bambooEeid: bambooUser.eeid!,
            bambooEmployeeNumber: bambooUser.employeeNumber,
            salusUserId,
            putPayload,
            error: String(error),
            timestamp: new Date().toISOString(),
        });
        this.flush();
        console.error(`[!] user update FAILED  bamboo=${bambooUser.eeid} emp#${bambooUser.employeeNumber} → salus=${salusUserId}  ${String(error)}`);
    }

    logCertificateCreated(
        bambooEeid: string,
        bambooTrainingId: string,
        bambooTrainingTypeId: string,
        salusUserId: number,
        salusPayload: CreateCertificateV1CertificatePostBodyParam,
        salusResponse: { id: number }
    ) {
        const salusCertificateId = salusResponse.id;
        this.certificateIdMap.push({ bambooEeid, bambooTrainingId, bambooTrainingTypeId, salusUserId, salusCertificateId });
        this.createdCertificates.push({
            bambooEeid,
            bambooTrainingId,
            bambooTrainingTypeId,
            salusUserId,
            salusCertificateId,
            salusPayload,
            timestamp: new Date().toISOString(),
        });
        this.flush();
        console.log(`  [+] cert created  bambooTraining=${bambooTrainingId} type=${bambooTrainingTypeId} → salusCert=${salusCertificateId}`);
    }

    logCertificateFailed(
        bambooEeid: string,
        bambooTrainingId: string,
        bambooTrainingTypeId: string,
        salusUserId: number,
        salusPayload: CreateCertificateV1CertificatePostBodyParam,
        error: unknown
    ) {
        this.failedCertificates.push({
            bambooEeid,
            bambooTrainingId,
            bambooTrainingTypeId,
            salusUserId,
            salusPayload,
            error: String(error),
            timestamp: new Date().toISOString(),
        });
        this.flush();
        console.error(`  [!] cert FAILED  bambooTraining=${bambooTrainingId} type=${bambooTrainingTypeId}  ${String(error)}`);
    }

    finalize(stats: Omit<RunSummary, 'startTime' | 'endTime' | 'logDir' | 'usersCreated' | 'usersFailed' | 'usersUpdated' | 'userUpdatesFailed' | 'certificatesCreated' | 'certificatesFailed'>) {
        const summary: RunSummary = {
            startTime: this.startTime.toISOString(),
            endTime: new Date().toISOString(),
            logDir: this.dir,
            ...stats,
            usersCreated: this.createdUsers.length,
            usersFailed: this.failedUsers.length,
            usersUpdated: this.updatedUsers.length,
            userUpdatesFailed: this.failedUserUpdates.length,
            certificatesCreated: this.createdCertificates.length,
            certificatesFailed: this.failedCertificates.length,
        };
        writeFileSync(join(this.dir, 'summary.json'), JSON.stringify(summary, null, 2));
        console.log('\n[logger] run complete');
        if (summary.usersCreated || summary.usersFailed)
            console.log(`  users created:  ${summary.usersCreated} ok, ${summary.usersFailed} failed`);
        if (summary.usersUpdated || summary.userUpdatesFailed)
            console.log(`  users updated:  ${summary.usersUpdated} ok, ${summary.userUpdatesFailed} failed`);
        console.log(`  certificates:   ${summary.certificatesCreated} created, ${summary.certificatesFailed} failed`);
        console.log(`  logs:           ${this.dir}`);
        if (summary.usersFailed > 0 || summary.certificatesFailed > 0) {
            console.log(`  to retry:       npx ts-node src/retry.ts "${this.dir}"`);
        }
    }

    private flush() {
        const w = (name: string, data: unknown) =>
            writeFileSync(join(this.dir, name), JSON.stringify(data, null, 2));
        w('user-id-map.json', this.userIdMap);
        w('certificate-id-map.json', this.certificateIdMap);
        w('created-users.json', this.createdUsers);
        w('failed-users.json', this.failedUsers);
        w('updated-users.json', this.updatedUsers);
        w('failed-user-updates.json', this.failedUserUpdates);
        w('created-certificates.json', this.createdCertificates);
        w('failed-certificates.json', this.failedCertificates);
    }
}

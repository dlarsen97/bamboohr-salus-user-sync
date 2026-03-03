import { getSalus } from "./salus/init";
import { bamboohr, getEmployeesDataset, BambooEmployee, training, trainingDef } from "./bamboohr/init";
import { CreateCertificateV1CertificatePostBodyParam, CreateV1UserPostBodyParam } from "@api/salus";
import { writeFileSync } from "node:fs";

import trainingTypesRaw from "./bamboohr/trainingTypesBamboo.json"
const trainingTypes = trainingTypesRaw as Record<string, trainingDef>;
import { to_csv } from "./random/random";

const STACY_WITBECK_ID = 1246989

async function main() {
    const salus = await getSalus();
    // push users from bamboohr to salus users

    // pull bamboohr users
    const bambooUsers = await getEmployeesDataset();

    //    await to_csv(bambooUsers, "bambooUsers.csv")
    //    return;

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
    const bambooNoSalusWTraining = []
    for (const bambUser of bambooNoSalus) {
        const disUserTrainings = await bamboohr.listEmployeeTrainings({ employeeId: Number(bambUser.eeid) })
        console.log(disUserTrainings);
        const trainings: { training: training, trainingDef: trainingDef }[] = []
        for (const training of Object.values(disUserTrainings)) {
            trainings.push({ training, trainingDef: trainingTypes[training.type] })
        }
        bambooNoSalusWTraining.push({ ...bambUser, trainings })
        // const trainingsWithType = disUserTrainings
        // userTrainings[bambUser.eeid] = { ...disUserTrainings, }

    }

    // transform bamboo into salus post command
    const newSalusWTrainings = [];
    for (const bambUser of bambooNoSalusWTraining) {
        const newSalusUser = {
            "firstName": bambUser.firstName,
            "lastName": bambUser.lastName,
            "email": bambUser.email || bambUser.customField4318 || bambUser.homeEmail,
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
        const newTrainings = bambUser.trainings.map(train => {
            return {
                //  { "body": { "properties": { "type": { "type": "string", "title": "Certificate Name", "description": "The name of the certificate", "examples": ["First Aid"] }, "userId": { "type": "integer", "title": "User ID", "description": "The identifier of the user this certificate belongs to", "examples": [1] }, "expiryDate": { "title": "Expiry Date", "description": "The certificate's expiry date", "examples": ["2027-02-24T22:20:20.686316"], "type": "string", "format": "date-time" }, "trainingCompanyId": { "title": "Training Company", "description": "The identifier of the company that provided the training for the certificate", "examples": [13], "type": "integer" }, "approved": { "title": "Approved", "description": "Determines if the certificate has been approved", "examples": [true], "type": "boolean" }, "approvedByUserId": { "title": "Approved By", "description": "The identifier of the user who approved the certificate.", "examples": [13], "type": "integer" }, "offline": { "title": "Offline", "description": "Determines if offline mode is enabled", "examples": [true], "type": "boolean" }, "providerId": { "title": "Certification Provider ID", "description": "The identifier of the provider of the certification, this field is company specific.", "examples": [15], "type": "integer" }, "companyCertificationTypeId": { "type": "integer", "title": "Certification Type ID", "description": "The identifier of the type of certificate, this field is company specific.", "examples": [12] } }, "type": "object", "required": ["type", "userId", "companyCertificationTypeId"], "title": "CertificateCreateModel", "description": "Required data elements for creating and updating certificates.", "$schema": "https://json-schema.org/draft/2020-12/schema#" }, "response": { "200": { "properties": { "error": { "type": "boolean", "title": "Error Indicator", "description": "A boolean error indicator.", "default": false }, "message": { "title": "Response Message", "description": "Optional message.", "type": "string" }, "data": { "title": "Response Data", "description": "The response data for any given request.", "properties": { "type": { "type": "string", "title": "Certificate Name", "description": "The name of the certificate", "examples": ["First Aid"] }, "userId": { "type": "integer", "title": "User ID", "description": "The identifier of the user this certificate belongs to", "examples": [1] }, "expiryDate": { "title": "Expiry Date", "description": "The certificate's expiry date", "examples": ["2027-02-24T22:20:20.686316"], "type": "string", "format": "date-time" }, "trainingCompanyId": { "title": "Training Company", "description": "The identifier of the company that provided the training for the certificate", "examples": [13], "type": "integer" }, "approved": { "title": "Approved", "description": "Determines if the certificate has been approved", "examples": [true], "type": "boolean" }, "approvedByUserId": { "title": "Approved By", "description": "The identifier of the user who approved the certificate.", "examples": [13], "type": "integer" }, "offline": { "title": "Offline", "description": "Determines if offline mode is enabled", "examples": [true], "type": "boolean" }, "providerId": { "title": "Certification Provider ID", "description": "The identifier of the provider of the certification, this field is company specific.", "examples": [15], "type": "integer" }, "id": { "type": "integer", "title": "ID", "description": "The certification identifier", "examples": [1] }, "url": { "title": "URL", "description": "The certification url", "examples": ["/upload/example-certificate.jpg"], "type": "string" }, "urlBack": { "title": "URL Back", "description": "The url of the backside of the certificate", "examples": ["/upload/example-certificate-back.jpg"], "type": "string" } }, "type": "object", "required": ["type", "userId", "id"] } }, "type": "object", "title": "ApiGenericResponse[CertificateModel]", "$schema": "https://json-schema.org/draft/2020-12/schema#" }, "400": { "properties": { "error": { "type": "boolean", "title": "Error Indicator", "description": "A boolean error indicator.", "default": false }, "message": { "title": "Response Message", "description": "Optional message.", "type": "string" }, "data": { "title": "Response Data", "description": "The response data for any given request.", "properties": { "requestPath": { "title": "Request Path", "description": "The path of the request that generated the error.", "type": "string" }, "requestMethod": { "title": "Request HTTP Method", "description": "The HTTP method of the request that generated the error.", "type": "string" }, "errorType": { "type": "string", "title": "The Error Type that Occurred", "description": "The type of error that occurred, broadly it can be 'Database', 'BusinessLogic', or 'Permissions`" }, "errorTypeDetail": { "title": "Errortypedetail", "description": "If available, an additional categorization of the error that occurred.", "type": "string" }, "errorDetail": { "title": "Errordetail", "type": "string" } }, "type": "object", "required": ["errorType"] } }, "type": "object", "title": "ApiGenericResponse[ErrorDetail]", "$schema": "https://json-schema.org/draft/2020-12/schema#" }, "403": { "properties": { "error": { "type": "boolean", "title": "Error Indicator", "description": "A boolean error indicator.", "default": false }, "message": { "title": "Response Message", "description": "Optional message.", "type": "string" }, "data": { "title": "Response Data", "description": "The response data for any given request.", "properties": { "requestPath": { "title": "Request Path", "description": "The path of the request that generated the error.", "type": "string" }, "requestMethod": { "title": "Request HTTP Method", "description": "The HTTP method of the request that generated the error.", "type": "string" }, "errorType": { "type": "string", "title": "The Error Type that Occurred", "description": "The type of error that occurred, broadly it can be 'Database', 'BusinessLogic', or 'Permissions`" }, "errorTypeDetail": { "title": "Errortypedetail", "description": "If available, an additional categorization of the error that occurred.", "type": "string" }, "errorDetail": { "title": "Errordetail", "type": "string" } }, "type": "object", "required": ["errorType"] } }, "type": "object", "title": "ApiGenericResponse[ErrorDetail]", "$schema": "https://json-schema.org/draft/2020-12/schema#" }, "409": { "properties": { "error": { "type": "boolean", "title": "Error Indicator", "description": "A boolean error indicator.", "default": false }, "message": { "title": "Response Message", "description": "Optional message.", "type": "string" }, "data": { "title": "Response Data", "description": "The response data for any given request.", "properties": { "requestPath": { "title": "Request Path", "description": "The path of the request that generated the error.", "type": "string" }, "requestMethod": { "title": "Request HTTP Method", "description": "The HTTP method of the request that generated the error.", "type": "string" }, "errorType": { "type": "string", "title": "The Error Type that Occurred", "description": "The type of error that occurred, broadly it can be 'Database', 'BusinessLogic', or 'Permissions`" }, "errorTypeDetail": { "title": "Errortypedetail", "description": "If available, an additional categorization of the error that occurred.", "type": "string" }, "errorDetail": { "title": "Errordetail", "type": "string" } }, "type": "object", "required": ["errorType"] } }, "type": "object", "title": "ApiGenericResponse[ErrorDetail]", "$schema": "https://json-schema.org/draft/2020-12/schema#" }, "422": { "properties": { "detail": { "items": { "properties": { "loc": { "items": { "anyOf": [{ "type": "string" }, { "type": "integer" }] }, "type": "array", "title": "Location" }, "msg": { "type": "string", "title": "Message" }, "type": { "type": "string", "title": "Error Type" } }, "type": "object", "required": ["loc", "msg", "type"], "title": "ValidationError" }, "type": "array", "title": "Detail" } }, "type": "object", "title": "HTTPValidationError", "$schema": "https://json-schema.org/draft/2020-12/schema#" } } } as const
                type: train.trainingDef.name,
                // userId: undefined,// filled after user is created
                expiryDate: undefined, //if train.trainingDef.renewable then train.training.completed + train.traingDef.frequency (months)
                trainingCompanyId: STACY_WITBECK_ID,
                approved: undefined, // not sure yet
                approvedByUserId: undefined, // me I guess?
                // offline
                // providerId:
                companyCertificationTypeId: 1,// need mapping


            } as CreateCertificateV1CertificatePostBodyParam
        })
    }
    // push them
    for (const newSalusUser of newSalusWTrainings) {
        console.log("update:", newSalusUser)
        return;
        salus.create_v1_user__post(newSalusUser as CreateV1UserPostBodyParam)
        salus.create_certificate_v1_certificate__post
    }

}

main()
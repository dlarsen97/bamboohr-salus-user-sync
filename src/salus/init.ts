import "dotenv/config";
import salus from "@api/salus"

const TOKEN_URL = "https://guardian.beta.salussafety.io/token";

const { CLIENT_ID, CLIENT_SECRET } = process.env;
if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("CLIENT_ID and CLIENT_SECRET must be set in .env");
}

// type createCertificate = {
//     type: string,    // required The name of the certificate
//     userId: number, // requiredThe identifier of the user this certificate belongs to
//     expiryDate: date-time | null,   // The certificate's expiry date
//         trainingCompanyId: number | null,// The identifier of the company that provided the training for the certificate
//             approved: boolean | null,// Determines if the certificate has been approved
//                 approvedByUserId: integer | null,// The identifier of the user who approved the certificate.
//                     offline: boolean | null,// Determines if offline mode is enabled
//                         providerId: integer | null,// The identifier of the provider of the certification, this field is company specific.
//                             companyCertificationTypeId: integer,// required
// }
let tokenExpiresAt = 0;

async function refreshAuth(): Promise<void> {
    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: "sls:idn",
        }),
    });

    if (!res.ok) {
        throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
    }

    const { access_token, expires_in } = await res.json() as { access_token: string; expires_in: number };
    salus.auth(access_token);
    // Refresh 60 seconds before actual expiry
    tokenExpiresAt = Date.now() + (expires_in - 60) * 1000;
}

export async function getSalus() {
    if (Date.now() >= tokenExpiresAt) {
        await refreshAuth();
    }
    return salus;
}

export { salus };

if (require.main == module) {
    async function main() {
        const salus = await getSalus()
        const response = await salus.search_v1_user__get({ limit: 5 });
        console.log("response:", response.data.data)
    }
    main();
}
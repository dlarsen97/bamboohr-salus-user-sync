import "dotenv/config";

const TOKEN_URL = "https://guardian.beta.salussafety.io/token";
const API_BASE = "https://developer.beta.salussafety.io";

const { CLIENT_ID, CLIENT_SECRET } = process.env;
if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("CLIENT_ID and CLIENT_SECRET must be set in .env");
}

async function getAccessToken(): Promise<string> {
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

    const { access_token } = await res.json() as { access_token: string };
    return access_token;
}

async function searchUsers(token: string, query?: string) {
    const params = new URLSearchParams({ limit: "50" });
    if (query) params.set("query", query);

    const res = await fetch(`${API_BASE}/v1/user/?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error(`Search users failed: ${res.status} ${await res.text()}`);
    }

    return res.json();
}

async function main() {
    const token = await getAccessToken();
    console.log("Access token acquired.");

    const users = await searchUsers(token);
    console.log(users);
}

main().catch(console.error);

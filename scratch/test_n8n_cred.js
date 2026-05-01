require('dotenv').config();

const baseUrl = "https://n8n.manadavana.lv";
const apiKey = process.env.N8N_API_KEY;

const payload = {
    name: "Test-Manual-Sync",
    type: "gmailOAuth2Api",
    isResolvable: false,
    data: {
        clientId: process.env.N8N_GOOGLE_CLIENT_ID,
        clientSecret: process.env.N8N_GOOGLE_CLIENT_SECRET,
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        accessTokenUrl: "https://oauth2.googleapis.com/token",
        accessToken: "ya29.fake-token",
        refreshToken: "1//fake-refresh",
        expiry: 0,
        scope: "https://www.googleapis.com/auth/gmail.send",
        tokenType: "Bearer"
    }
};

async function test() {
    console.log("Sending to:", `${baseUrl}/api/v1/credentials`);
    try {
        const res = await fetch(`${baseUrl}/api/v1/credentials`, {
            method: 'POST',
            headers: { 
                'X-N8N-API-KEY': apiKey, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
        });

        const status = res.status;
        const text = await res.text();
        console.log("Status:", status);
        console.log("Response JSON:", text);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

test();

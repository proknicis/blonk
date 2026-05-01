require('dotenv').config();

const baseUrl = "https://n8n.manadavana.lv";
const apiKey = process.env.N8N_API_KEY;

const payload = {
    name: "Perfect-Google-OAuth2",
    type: "googleOAuth2Api",
    isResolvable: false,
    data: {
        clientId: process.env.N8N_GOOGLE_CLIENT_ID,
        clientSecret: process.env.N8N_GOOGLE_CLIENT_SECRET,
        scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
        oauthTokenData: {
            access_token: "ya29.fake-token",
            refresh_token: "1//fake-refresh",
            token_type: "Bearer",
            expiry_date: Date.now() + 3600000 // 1 hour from now
        }
    }
};

async function testPerfect() {
    console.log("Sending perfectly matched payload to n8n...");
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
        console.log(`Status: ${status}`);
        console.log(`Response: ${text}`);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testPerfect();

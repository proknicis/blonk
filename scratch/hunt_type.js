require('dotenv').config();

const baseUrl = "https://n8n.manadavana.lv";
const apiKey = process.env.N8N_API_KEY;

const typesToTry = ['googleOAuth2Api', 'googleOAuth2', 'gmailOAuth2', 'googleSheetsOAuth2Api'];

async function hunt() {
    for (const type of typesToTry) {
        console.log(`Trying type: ${type}...`);
        const res = await fetch(`${baseUrl}/api/v1/credentials`, {
            method: 'POST',
            headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `Test-${type}`,
                type: type,
                data: { clientId: "test", clientSecret: "test" }
            })
        });
        const text = await res.text();
        console.log(`Result for ${type}: ${res.status} - ${text}`);
        if (res.ok) {
            console.log(`SUCCESS! The correct type is: ${type}`);
            break;
        }
    }
}

hunt();

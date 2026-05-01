require('dotenv').config();

const baseUrl = "https://n8n.manadavana.lv";
const apiKey = process.env.N8N_API_KEY;

async function checkSchema() {
    try {
        console.log("Fetching credential schema for gmailOAuth2Api...");
        const res = await fetch(`${baseUrl}/api/v1/credentials/schema/gmailOAuth2Api`, {
            headers: { 'X-N8N-API-KEY': apiKey }
        });
        const text1 = await res.text();
        console.log("gmailOAuth2Api Schema:", text1);

        console.log("\nFetching credential schema for googleOAuth2Api...");
        const res2 = await fetch(`${baseUrl}/api/v1/credentials/schema/googleOAuth2Api`, {
            headers: { 'X-N8N-API-KEY': apiKey }
        });
        const text2 = await res2.text();
        console.log("googleOAuth2Api Schema:", text2);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

checkSchema();

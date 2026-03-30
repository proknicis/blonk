import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: "Proxy Trigger API is online. Use POST to fire webhooks." });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, payload } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`Proxying request to n8n: ${url}`);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload || {}),
        });

        // We want to capture the status even if it's 404 or 500
        const status = res.status;
        let responseText = "";
        try {
            responseText = await res.text();
        } catch (e) {
            responseText = "Could not parse response body";
        }

        return NextResponse.json({
            success: res.ok,
            status: status,
            data: responseText
        });

    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

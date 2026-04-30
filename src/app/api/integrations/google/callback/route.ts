import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const clientId = process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`;

    try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId!,
                client_secret: clientSecret!,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        });

        const tokens = await res.json();

        if (tokens.error) {
            return NextResponse.json(tokens, { status: 400 });
        }

        // Return a small HTML page that sends the tokens back to the main app window
        const html = `
            <html>
                <body>
                    <script>
                        window.opener.postMessage({
                            type: 'GOOGLE_AUTH_SUCCESS',
                            tokens: ${JSON.stringify(tokens)}
                        }, '*');
                        window.close();
                    </script>
                    <p>Authentication successful! Closing window...</p>
                </body>
            </html>
        `;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        console.error('Google OAuth Error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

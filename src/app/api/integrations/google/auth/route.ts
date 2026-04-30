import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`;
    
    // Scopes needed for n8n Google nodes (Gmail, Sheets, etc.)
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `access_type=offline&` +
        `prompt=consent`;

    return NextResponse.redirect(authUrl);
}

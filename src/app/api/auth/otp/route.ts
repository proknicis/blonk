import { NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        await sendOTPEmail(email, otp);

        console.log(`[SERVER]: OTP email successfully dispatched to ${email}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('SMTP Error Detailed:', error);
        return NextResponse.json({ 
            error: 'Failed to send verification email', 
            details: error.message 
        }, { status: 500 });
    }
}

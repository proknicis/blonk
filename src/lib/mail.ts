import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendOTPEmail = async (to: string, otp: string) => {
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject: 'Your BLONK Verification Code',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #111; margin-bottom: 24px;">Security Verification</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
                    To complete your institutional authentication, please enter the following 6-digit code:
                </p>
                <div style="background: #f9fafb; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 0.2em; color: #111;">${otp}</span>
                </div>
                <p style="color: #9ca3af; font-size: 14px;">
                    This code will expire in 10 minutes. If you did not request this code, please ignore this email.
                </p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    BLONK ASSETS LLC / Sovereign Infrastructure
                </p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false // Helps with certificate issues on some shared hosting
    }
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

export const sendWelcomeEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject: 'Welcome to the BLONK Fleet',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #111; margin-bottom: 12px;">Welcome Aboard, ${name}.</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
                    Your institutional profile has been successfully provisioned. You now have access to the BLONK sovereign infrastructure and autonomous fleet.
                </p>
                <div style="background: #34D186; color: white; padding: 18px; border-radius: 12px; text-align: center; margin: 32px 0; font-weight: 800; font-size: 18px;">
                    Account Active & Secured
                </div>
                <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
                    Next steps:
                    <ul style="padding-left: 20px;">
                        <li>Configure your first autonomous workflow</li>
                        <li>Integrate your firm's document storage</li>
                        <li>Invite your team members to the command center</li>
                    </ul>
                </p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    BLONK ASSETS LLC / Sovereign Infrastructure / v3.2
                </p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

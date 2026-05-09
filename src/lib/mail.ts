import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

const BASE_TEMPLATE = (title: string, content: string, footerNote: string = "BLONK ASSETS LLC / Sovereign Infrastructure") => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        .body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #eef2f5; }
        .header { padding: 40px; text-align: center; background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: #ffffff; }
        .content { padding: 48px; color: #334155; line-height: 1.6; font-size: 16px; }
        .footer { padding: 32px; text-align: center; color: #94A3B8; font-size: 12px; border-top: 1px solid #f1f5f9; }
        .badge { display: inline-block; padding: 6px 12px; background: #f1f5f9; border-radius: 100px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748B; margin-bottom: 24px; }
        .title { font-size: 28px; font-weight: 800; color: #0F172A; margin: 0 0 24px 0; letter-spacing: -0.02em; }
        .otp-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0; }
        .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 0.3em; color: #0F172A; }
        .button { display: inline-block; padding: 16px 32px; background-color: #34D186; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 16px; margin: 24px 0; }
        .accent { color: #34D186; font-weight: 800; }
    </style>
</head>
<body class="body">
    <div class="container">
        <div class="content">
            <div class="badge">Security Notification</div>
            <h1 class="title">${title}</h1>
            ${content}
        </div>
        <div class="footer">
            ${footerNote}
        </div>
    </div>
</body>
</html>
`;

export const sendOTPEmail = async (to: string, otp: string) => {
    const content = `
        <p>To finalize your institutional authentication and access the sovereign command center, please utilize the following security token:</p>
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
        </div>
        <p style="color: #64748B; font-size: 14px;">This token remains valid for 10 minutes. If you did not initiate this request, please contact system administration immediately.</p>
    `;
    
    return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: `[SECURE] Verification Token: ${otp}`,
        html: BASE_TEMPLATE("Identity Verification", content)
    });
};

export const sendWelcomeEmail = async (to: string, name: string) => {
    const content = `
        <p>Acknowledge receipt, <span class="accent">${name}</span>.</p>
        <p>Your administrative profile has been provisioned. You now have operational clearance for the BLONK autonomous infrastructure.</p>
        <div style="background: #F0FDF4; border-left: 4px solid #34D186; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; font-weight: 700; color: #166534;">Credential Clearance Active</p>
        </div>
        <p>Please log in to your dashboard to begin workflow orchestration and fleet monitoring.</p>
    `;

    return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: 'Clearance Granted: Welcome to BLONK Infrastructure',
        html: BASE_TEMPLATE("Operational Access Granted", content)
    });
};

export const sendCustomEmail = async (to: string, subject: string, title: string, body: string) => {
    const content = `
        <div style="white-space: pre-wrap; margin-bottom: 24px;">${body}</div>
        <p style="color: #64748B; font-size: 14px;">This communication was dispatched by a system administrator.</p>
    `;

    return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: `[ADMIN] ${subject}`,
        html: BASE_TEMPLATE(title, content)
    });
};

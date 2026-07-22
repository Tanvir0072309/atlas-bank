import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send Email
 */
export const sendEmail = async ({ to, subject, html }) => {
    return transporter.sendMail({
        from: process.env.SMTP_FROM || '"Atlas Bank" <no-reply@atlasbank.com>',
        to,
        subject,
        html,
    });
};

/**
 * Send Verification Email (Lively Modern Atlas UI)
 */
export const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // Logo Direct Image URL
    const logoUrl = "https://i.ibb.co/3ykXv4S/logo.png";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Atlas Bank</title>
</head>

<body style="margin:0; padding:0; background-color:#F1F5F9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9; padding: 50px 15px;">
        <tr>
            <td align="center">

                <!-- Main Email Card -->
                <table width="100%" maxWidth="560" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #E2E8F0; box-shadow:0 20px 30px -10px rgba(128, 10, 56, 0.08);">

                    <!-- Header Banner with Rich Crimson Gradient -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #800A38 0%, #A30E4A 100%); padding:42px 24px 38px 24px; text-align:center;">
                            
                            <!-- Glowing Logo Container -->
                            <div style="display:inline-block; padding:10px; background:rgba(255,255,255,0.12); border-radius:20px; border:1px solid rgba(255,255,255,0.25); margin-bottom:14px;">
                                <img src="${logoUrl}" alt="Atlas Bank Logo" width="58" height="58" style="display:block; border-radius:14px;" />
                            </div>
                            
                            <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:800; letter-spacing:-0.5px;">
                                Atlas Bank
                            </h1>
                            <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">
                                Next-Gen Secure Banking
                            </p>

                        </td>
                    </tr>

                    <!-- Card Body -->
                    <tr>
                        <td style="padding:40px 36px 36px 36px; color:#1E293B;">

                            <!-- Hero Verification Icon Badge -->
                            <div style="text-align:center; margin-bottom:24px;">
                                <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; background-color:#FFF1F2; border-radius:50%; border:2px solid #FFE4E6;">
                                    <!-- Envelope Check Mark Icon -->
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 8L10.89 13.26C11.567 13.7114 12.433 13.7114 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="#800A38" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                            </div>

                            <h2 style="margin:0 0 10px 0; color:#0F172A; font-size:22px; font-weight:800; text-align:center; letter-spacing:-0.3px;">
                                Verify Your Email
                            </h2>

                            <p style="margin:0 0 20px 0; font-size:14px; line-height:1.65; color:#475569; text-align:center;">
                                Welcome to <strong>Atlas Bank</strong>! You're just one quick step away from unlocking your account and accessing your dashboard.
                            </p>

                            <!-- Gradient Action Button -->
                            <div style="text-align:center; margin:34px 0;">
                                <a href="${verificationLink}"
                                    style="
                                        display:inline-block;
                                        background: linear-gradient(135deg, #800A38 0%, #A30E4A 100%);
                                        color:#ffffff;
                                        text-decoration:none;
                                        padding:16px 42px;
                                        border-radius:100px;
                                        font-size:14px;
                                        font-weight:800;
                                        letter-spacing:0.5px;
                                        box-shadow:0 8px 20px -4px rgba(128, 10, 56, 0.4);
                                    ">
                                    Confirm Email Address
                                </a>
                            </div>

                            <!-- Styled Copy-Paste Link Box -->
                            <div style="background-color:#F8FAFC; border:1px dashed #CBD5E1; border-radius:16px; padding:18px; margin-top:28px;">
                                <p style="margin:0 0 6px 0; font-size:11px; color:#64748B; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
                                    Button not working?
                                </p>
                                <p style="margin:0; word-break:break-all; font-size:12px; color:#800A38; font-family:Consolas, Monaco, monospace; font-weight:600;">
                                    ${verificationLink}
                                </p>
                            </div>

                            <hr style="border:none; border-top:1px solid #F1F5F9; margin:30px 0 24px 0;">

                            <p style="margin:0; font-size:12px; color:#94A3B8; text-align:center; line-height:1.5;">
                                If you didn't create an Atlas Bank account, you can safely ignore this email.
                            </p>

                        </td>
                    </tr>

                    <!-- Modern Footer -->
                    <tr>
                        <td align="center" style="background-color:#F8FAFC; padding:24px; border-top:1px solid #F1F5F9; color:#94A3B8; font-size:12px; text-align:center;">
                            <p style="margin:0 0 4px 0; font-weight:700; color:#475569;">
                                Atlas Bank Financial Technologies
                            </p>
                            <p style="margin:0; font-size:11px; color:#94A3B8;">
                                &copy; ${new Date().getFullYear()} Atlas Bank. All Rights Reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
    `;

    await sendEmail({
        to: email,
        subject: "Verify Your Email - Atlas Bank",
        html,
    });
};

/**
 * Send Login Verification Email
 */
export const sendLoginVerificationEmail = async (
    email,
    fullName,
    verificationCode
) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Login Verification - Atlas Bank</title>
</head>

<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;">
<tr>
<td align="center">

<table width="560" cellpadding="0" cellspacing="0"
style="
background:#ffffff;
border-radius:18px;
overflow:hidden;
border:1px solid #E2E8F0;
">

<tr>
<td
style="
background:#800A38;
padding:30px;
text-align:center;
">

<h1
style="
margin:0;
color:#ffffff;
font-size:28px;
">
Atlas Bank
</h1>

<p
style="
margin-top:8px;
color:#F8FAFC;
">
Secure Login Verification
</p>

</td>
</tr>

<tr>
<td style="padding:40px;">

<h2
style="
margin-top:0;
color:#0F172A;
">
Hello ${fullName},
</h2>

<p
style="
font-size:15px;
line-height:1.7;
color:#475569;
">
We received a login request for your Atlas Bank account.
Please enter the verification code below to complete your login.
</p>

<div
style="
margin:35px 0;
text-align:center;
">

<div
style="
display:inline-block;
padding:18px 35px;
background:#FFF1F2;
border:2px dashed #800A38;
border-radius:12px;
font-size:34px;
font-weight:bold;
letter-spacing:8px;
color:#800A38;
font-family:Consolas,monospace;
">
${verificationCode}
</div>

</div>

<p
style="
font-size:14px;
color:#64748B;
">
This verification code will expire in
<strong>5 minutes</strong>.
</p>

<p
style="
font-size:14px;
color:#64748B;
">
If you did not attempt to login,
please ignore this email.
No one can access your account without this verification code.
</p>

</td>
</tr>

<tr>
<td
style="
background:#F8FAFC;
padding:20px;
text-align:center;
font-size:12px;
color:#94A3B8;
">

© ${new Date().getFullYear()} Atlas Bank.
All Rights Reserved.

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

    await sendEmail({
        to: email,
        subject: "Atlas Bank Login Verification Code",
        html,
    });
};
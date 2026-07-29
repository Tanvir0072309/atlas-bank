import * as Brevo from "@getbrevo/brevo";

console.log("========== EMAIL SERVICE LOADED (BREVO API) ==========");

// Initialize Brevo API Instance
const apiInstance = new Brevo.TransactionalEmailsApi();

// Set API key authorization
const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
    console.warn("⚠️ BREVO_API_KEY is missing from environment variables.");
} else {
    apiInstance.setApiKey(
        Brevo.TransactionalEmailsApiApiKeys.apiKey,
        apiKey
    );
}

console.log("BREVO SENDER:", process.env.SMTP_FROM || "Atlas Bank <no-reply@atlasbank.com>");

/**
 * Parses "Name <email@domain.com>" or "email@domain.com" into Brevo's expected format.
 */
const parseSender = (senderString) => {
    const defaultSender = { name: "Atlas Bank", email: "no-reply@atlasbank.com" };

    if (!senderString) return defaultSender;

    const match = senderString.match(/^(?:"?([^"]*)"?\s)?(?:<(.+)>|(.+))$/);
    if (!match) return defaultSender;

    const name = match[1]?.trim() || "Atlas Bank";
    const email = (match[2] || match[3])?.trim() || "no-reply@atlasbank.com";

    return { name, email };
};

/**
 * Send Email via Brevo HTTPS REST API
 */
export const sendEmail = async ({ to, subject, html }) => {
    try {
        const sender = parseSender(process.env.SMTP_FROM);

        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.sender = sender;
        sendSmtpEmail.to = [{ email: to }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("✅ Email Sent via Brevo API:", data.body);
        return data.body;
    } catch (error) {
        console.error("❌ Brevo Email Error:", error.response?.body || error.message || error);
        throw error;
    }
};

/**
 * Send Verification Email (Account Activation)
 */
export const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email - Atlas Bank</title>
</head>
<body style="margin:0; padding:0; background-color:#F1F5F9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9; padding: 50px 15px;">
        <tr>
            <td align="center">

                <!-- Main Email Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #E2E8F0; box-shadow:0 20px 30px -10px rgba(128, 10, 56, 0.08);">

                    <!-- Header Banner -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #800A38 0%, #A30E4A 100%); padding:40px 24px 36px 24px; text-align:center;">
                            <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:800; letter-spacing:-0.5px;">
                                Atlas Bank
                            </h1>
                            <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">
                                Account Security Notice
                            </p>
                        </td>
                    </tr>

                    <!-- Card Body -->
                    <tr>
                        <td style="padding:40px 36px 36px 36px; color:#1E293B;">

                            <!-- Purpose Badge -->
                            <div style="text-align:center; margin-bottom:20px;">
                                <span style="display:inline-block; padding:6px 16px; background-color:#FFF1F2; border:1px solid #FFE4E6; border-radius:100px; color:#800A38; font-size:12px; font-weight:800; letter-spacing:0.5px; text-transform:uppercase;">
                                    ACCOUNT ACTIVATION
                                </span>
                            </div>

                            <h2 style="margin:0 0 10px 0; color:#0F172A; font-size:22px; font-weight:800; text-align:center; letter-spacing:-0.3px;">
                                Verify Your Email Address
                            </h2>

                            <p style="margin:0 0 24px 0; font-size:14px; line-height:1.65; color:#475569; text-align:center;">
                                Welcome to <strong>Atlas Bank</strong>! Please confirm your email address to complete your account registration and access your banking dashboard.
                            </p>

                            <!-- Gradient Action Button -->
                            <div style="text-align:center; margin:32px 0;">
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

                            <!-- Copy-Paste Link Box -->
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
                                If you didn't create an account with Atlas Bank, you can safely ignore this email.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
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
 * Send Login Verification Email (2FA / OTP)
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Verification - Atlas Bank</title>
</head>
<body style="margin:0; padding:0; background-color:#F1F5F9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9; padding: 50px 15px;">
        <tr>
            <td align="center">

                <!-- Main Email Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #E2E8F0; box-shadow:0 20px 30px -10px rgba(128, 10, 56, 0.08);">

                    <!-- Header Banner -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #800A38 0%, #A30E4A 100%); padding:40px 24px 36px 24px; text-align:center;">
                            <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:800; letter-spacing:-0.5px;">
                                Atlas Bank
                            </h1>
                            <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">
                                Account Security Notice
                            </p>
                        </td>
                    </tr>

                    <!-- Card Body -->
                    <tr>
                        <td style="padding:40px 36px 36px 36px; color:#1E293B;">

                            <!-- Purpose Badge -->
                            <div style="text-align:center; margin-bottom:20px;">
                                <span style="display:inline-block; padding:6px 16px; background-color:#FFF1F2; border:1px solid #FFE4E6; border-radius:100px; color:#800A38; font-size:12px; font-weight:800; letter-spacing:0.5px; text-transform:uppercase;">
                                    LOGIN VERIFICATION
                                </span>
                            </div>

                            <h2 style="margin:0 0 10px 0; color:#0F172A; font-size:22px; font-weight:800; text-align:center; letter-spacing:-0.3px;">
                                Hello ${fullName || "User"},
                            </h2>

                            <p style="margin:0 0 24px 0; font-size:14px; line-height:1.65; color:#475569; text-align:center;">
                                We received a login request for your Atlas Bank account. Please enter the OTP code below to complete your sign-in.
                            </p>

                            <!-- Styled OTP Code Box -->
                            <div style="text-align:center; margin:30px 0;">
                                <div style="display:inline-block; padding:18px 40px; background-color:#FFF1F2; border:2px dashed #800A38; border-radius:16px; font-size:32px; font-weight:800; letter-spacing:8px; color:#800A38; font-family:Consolas, Monaco, monospace;">
                                    ${verificationCode}
                                </div>
                            </div>

                            <p style="margin:0 0 12px 0; font-size:13px; color:#64748B; text-align:center; font-weight:600;">
                                This code will expire in <strong style="color:#800A38;">5 minutes</strong>.
                            </p>

                            <hr style="border:none; border-top:1px solid #F1F5F9; margin:30px 0 24px 0;">

                            <p style="margin:0; font-size:12px; color:#94A3B8; text-align:center; line-height:1.5;">
                                If you did not attempt to log in, please secure your account immediately.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
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
        subject: "Atlas Bank Login Verification Code",
        html,
    });
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (
    email,
    fullName,
    verificationCode
) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - Atlas Bank</title>
</head>
<body style="margin:0; padding:0; background-color:#F1F5F9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9; padding: 50px 15px;">
        <tr>
            <td align="center">

                <!-- Main Email Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #E2E8F0; box-shadow:0 20px 30px -10px rgba(128, 10, 56, 0.08);">

                    <!-- Header Banner -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #800A38 0%, #A30E4A 100%); padding:40px 24px 36px 24px; text-align:center;">
                            <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:800; letter-spacing:-0.5px;">
                                Atlas Bank
                            </h1>
                            <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">
                                Account Security Notice
                            </p>
                        </td>
                    </tr>

                    <!-- Card Body -->
                    <tr>
                        <td style="padding:40px 36px 36px 36px; color:#1E293B;">

                            <!-- Purpose Badge -->
                            <div style="text-align:center; margin-bottom:20px;">
                                <span style="display:inline-block; padding:6px 16px; background-color:#FFF1F2; border:1px solid #FFE4E6; border-radius:100px; color:#800A38; font-size:12px; font-weight:800; letter-spacing:0.5px; text-transform:uppercase;">
                                    PASSWORD RESET
                                </span>
                            </div>

                            <h2 style="margin:0 0 10px 0; color:#0F172A; font-size:22px; font-weight:800; text-align:center; letter-spacing:-0.3px;">
                                Hello ${fullName || "User"},
                            </h2>

                            <p style="margin:0 0 24px 0; font-size:14px; line-height:1.65; color:#475569; text-align:center;">
                                We received a request to reset your Atlas Bank account password. Use the verification code below to set a new password.
                            </p>

                            <!-- Styled OTP Code Box -->
                            <div style="text-align:center; margin:30px 0;">
                                <div style="display:inline-block; padding:18px 40px; background-color:#FFF1F2; border:2px dashed #800A38; border-radius:16px; font-size:32px; font-weight:800; letter-spacing:8px; color:#800A38; font-family:Consolas, Monaco, monospace;">
                                    ${verificationCode}
                                </div>
                            </div>

                            <p style="margin:0 0 12px 0; font-size:13px; color:#64748B; text-align:center; font-weight:600;">
                                This code will expire in <strong style="color:#800A38;">10 minutes</strong>.
                            </p>

                            <hr style="border:none; border-top:1px solid #F1F5F9; margin:30px 0 24px 0;">

                            <p style="margin:0; font-size:12px; color:#94A3B8; text-align:center; line-height:1.5;">
                                If you did not request a password reset, please ignore this email or contact support.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
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
        subject: "Atlas Bank Password Reset Verification Code",
        html,
    });
};
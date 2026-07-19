import nodemailer from "nodemailer";
console.log({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
});

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
export const sendEmail = async ({
    to,
    subject,
    html,
}) => {

    return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
    });

};

/**
 * Send Verification Email
 */
export const sendVerificationEmail = async (
    email,
    token
) => {

    const verificationLink =
        `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const html = `
        <h2>Atlas Bank</h2>

        <p>Click the button below to verify your email.</p>

        <a href="${verificationLink}">
            Verify Email
        </a>
    `;

    await sendEmail({
        to: email,
        subject: "Verify Your Email",
        html,
    });

};
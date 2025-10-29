// ==================== src/service/emailService.js ====================
import { transporter, sender } from "../lib/nodemailer.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js";

// Send Welcome Email
export const sendWelcomeEmail = async (email, name, clientURL) => {
    try {
        const html = createWelcomeEmailTemplate(name, clientURL);

        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to: email,
            subject: "Welcome to SpectreeChat!",
            html,
            text: `Welcome ${name}! Thank you for joining SpectreeChat. Visit ${clientURL} to get started.`,
            headers: { "X-Priority": "1", "X-Mailer": "NodeMailer" },
        });

        console.log("✅ Welcome Email sent successfully to:", email);
        console.log("📧 Message ID:", info.messageId);

        return {
            success: true,
            data: {
                id: info.messageId,
                to: email,
            },
            error: null,
        };
    } catch (error) {
        console.error("❌ Error sending welcome email:", error.message);
        return {
            success: false,
            data: null,
            error: {
                message: error.message,
            },
        };
    }
};


// Generic Send Email Function
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to,
            subject,
            html,
            text,
        });

        console.log("✅ Email sent successfully to:", to);
        return {
            success: true,
            data: {
                id: info.messageId,
                to,
            },
            error: null,
        };
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        return {
            success: false,
            data: null,
            error: {
                message: error.message,
            },
        };
    }
};
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables");
    process.exit(1);
}

// Create transporter
export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Gmail service connection failed:", error.message);
    } else {
        console.log("✅ Gmail configured and ready to send emails");
    }
});

// Sender configuration
export const sender = {
    name: process.env.EMAIL_FROM_NAME || "Messenger Team",
    email: process.env.EMAIL_USER,
};


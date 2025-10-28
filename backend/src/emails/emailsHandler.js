export const sendWelcomeEmail = async (email, name, clientUrl) => {
    try {
        const { data, error } = await resendEmail.emails.send({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Welcome to SpectreeChat!",
            html: createWelcomeEmailTemplate(name, clientUrl),
        });

        if (error) throw new Error(error.message);

        console.log("Welcome Email sent successfully", data);
    } catch (err) {
        console.error("Error sending welcome email:", err);
        throw new Error("Failed to send welcome email");
    }
};

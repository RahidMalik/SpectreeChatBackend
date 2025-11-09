import aj from "../lib/arcjet.js";

export const arcjetProctection = async (req, res, next) => {
    try {
        // Ensure IP is optional
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "";

        // Pass custom characteristics with optional IP
        const decision = await aj.protect(req, {
            ip: clientIp,
            // aap additional characteristics yahan add kar sakte ho
        });

        // Optional: Log decision in development
        if (process.env.NODE_ENV === "development") {
            console.log("🛡️ Arcjet Decision:", decision.conclusion);
        }

        // Check if request is denied
        if (decision.isDenied()) {
            for (const result of decision.results) {

                // Rate Limit Check
                if (result.reason.type === "RATE_LIMIT" && result.conclusion === "DENY") {
                    return res.status(429).json({
                        success: false,
                        message: "Too many requests. Please try again later.",
                        retryAfter: Math.ceil(result.reason.resetTime / 1000) || 60
                    });
                }

                // Bot Detection Check
                if (result.reason.type === "BOT" && result.conclusion === "DENY") {
                    return res.status(403).json({
                        success: false,
                        message: "Bot access denied.",
                        detail: "Automated access is not allowed."
                    });
                }

                // Shield (Attack Protection) Check
                if (result.reason.type === "SHIELD" && result.conclusion === "DENY") {
                    return res.status(403).json({
                        success: false,
                        message: "Suspicious activity detected.",
                        detail: "Your request has been blocked for security reasons."
                    });
                }
            }

            // Generic denial
            return res.status(403).json({
                success: false,
                message: "Access denied by security policy.",
            });
        }

        // Spoofed bot check
        if (decision.reason?.type === "BOT" && decision.reason?.spoofed) {
            return res.status(403).json({
                success: false,
                message: "Spoofed bot detected.",
                detail: "Malicious bot activity identified."
            });
        }

        // All checks passed
        next();

    } catch (error) {
        console.error("❌ Arcjet Protection Error:", error.message);

        // Production: deny access on errors
        if (process.env.NODE_ENV === "production") {
            return res.status(500).json({
                success: false,
                message: "Security check failed. Please try again.",
            });
        }

        // Development: log but allow
        console.warn("⚠️ Arcjet error in development - allowing request");
        next();
    }
};

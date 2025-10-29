import aj from "../lib/arcjet.js";

export const arcjetProctection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req);

        // Optional: Log decision in development
        if (process.env.NODE_ENV === "development") {
            console.log("🛡️ Arcjet Decision:", decision.conclusion);
        }

        // Check if request is denied
        if (decision.isDenied()) {

            // Check each rule result for specific reasons
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

            // Generic denial (if no specific reason matched)
            return res.status(403).json({
                success: false,
                message: "Access denied by security policy.",
            });
        }

        // Check for spoofed bots (even if allowed)
        if (decision.reason.type === "BOT" && decision.reason.spoofed) {
            return res.status(403).json({
                success: false,
                message: "Spoofed bot detected.",
                detail: "Malicious bot activity identified."
            });
        }

        // All checks passed, continue to next middleware
        next();

    } catch (error) {
        console.error("❌ Arcjet Protection Error:", error.message);

        // In production, deny access on errors for safety
        if (process.env.NODE_ENV === "production") {
            return res.status(500).json({
                success: false,
                message: "Security check failed. Please try again.",
            });
        }

        // Development: log error but allow request to continue
        console.warn("⚠️ Arcjet error in development - allowing request");
        next();
    }
};
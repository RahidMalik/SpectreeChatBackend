import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./src/Router/auth.route.js";
import messageRouter from "./src/Router/message.route.js";
import { connectDB } from "./src/lib/db.js";
import { ENV } from "./src/lib/env.js";
import { app, server } from "./src/lib/socket.js";
import compression from "compression";
import helmet from "helmet";



// ✅ Needed for __dirname (ESM support)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables
dotenv.config();

// ✅ Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// CORS for REST APIs
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            ENV.CLIENT_URL,
            "http://localhost:5173",
            "http://localhost:5000"
        ];

        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("❌ Blocked origin:", origin); // This will help debug
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(cookieParser());
app.use(helmet());
app.use(compression());


// ✅ API Routes
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

// ✅ Connect DB first
connectDB();

// ✅ Production setup (Express v5 compatible)



const PORT = ENV.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${ENV.NODE_ENV} mode`);
});

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
app.use(cors({
    origin: [
        "http://localhost:5173",
        ENV.CLIENT_URL
    ],
    credentials: true,
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

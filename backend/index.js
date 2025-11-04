import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors'
import authRouter from './src/Router/auth.route.js'
import messageRouter from './src/Router/message.route.js'
import { connectDB } from "./src/lib/db.js";
import { ENV } from "./src/lib/env.js";
import cookieParser from "cookie-parser";
import { app, server } from "./src/lib/socket.js";


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

const PORT = ENV.PORT || 5000;
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

//* make ready for deployment
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}




server.listen(PORT, () => {
    console.log("Server running on port: " + PORT);
    connectDB();
});
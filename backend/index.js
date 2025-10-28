import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors'
import authRouter from './src/Router/auth.route.js'
import messageRouter from './src/Router/message.route.js'
import { connectDB } from "./src/lib/db.js";
import { ENV } from "./src/lib/env.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const PORT = ENV.PORT || 5000;
app.use("/api/auth", authRouter);
app.use("/messages", messageRouter);

//* make ready for deployment
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}


app.listen(PORT, () => console.log(`SERVER RUN ON ${PORT}`))
connectDB();
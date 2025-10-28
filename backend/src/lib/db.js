import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
    try {
        const { MONGODB_URI } = ENV;
        if (!MONGODB_URI) throw new Error("MongoDB is not set")
        const conn = await mongoose.connect(ENV.MONGODB_URI)
        console.log(`MongoDB Connected:${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB not connected", error)
        process.exit(1)
    }
}
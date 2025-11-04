import jwt from "jsonwebtoken";
import User from "../models/UserData.js";
import { ENV } from "../lib/env.js";
import UserData from "../models/UserData.js";


export const socketAuthMiddleware = async (socket, next) => {
    try {
        //* extract token from only HTTP 

        const token = socket.handshake.headers.cookie
            ?.split(";")
            .find((row) => row.startsWith("jwt="))
            ?.split("=")[1];


        if (!token) {
            console.log("Socket connection rejected: No token provided");
            return next(new Error("Unauthorized - No Token Provided"));
        }

        // verify the token
        const decoded = jwt.verify(token, ENV.JASONWEB_TOKEN);
        if (!decoded) {
            console.log("Socket connection rejected: Invalid token");
            return next(new Error("Unauthorized - Invalid Token"));
        }

        const user = await UserData.findById(decoded.userid).select("-password");
        if (!user) {
            console.log("Socket connection rejected: User not found");
            return next(new Error("User not found"));
        }
        // attach user info to socket
        socket.user = user;
        socket.userId = user._id.toString();

        console.log(`Socket authenticated for user: ${user.fullname} (${user._id})`);
        next();
    } catch (error) {
        console.log("Error in socket authentication:", error.message);
        next(new Error("Unauthorized - Authentication failed"));
    }
}
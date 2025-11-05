import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import UserData from "../models/UserData.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, ENV.JASONWEB_TOKEN);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await UserData.findById(decoded.userid).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User Not Found" });
        }

        req.user = user; // attach user info to request
        next(); // move to next middleware or route
    } catch (error) {
        console.error("Server Error in auth-middleware:", error.message);
        res.status(500).json({ message: "Internet Connection Failed" });
    }
};

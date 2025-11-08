import jwt from 'jsonwebtoken'
import { ENV } from './env.js'


export const generateToken = (userid, res) => {

    const JASONWEB_TOKEN = ENV.JASONWEB_TOKEN
    if (!JASONWEB_TOKEN) {
        throw new Error("jsonwebtoken is not configured");
    }

    const token = jwt.sign({ userid }, JASONWEB_TOKEN, {
        expiresIn: "7days"
    })

    // Cookie set karte waqt
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 👈 IMPORTANT
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });

    return token;

};
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

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //MS 
        httpOnly: true,
        sameSite: "strict"
    })

    return token;

};
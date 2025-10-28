import { generateToken } from "../lib/jwt.js";
import UserData from "../models/UserData.js";
import { sendWelcomeEmail } from "../emails/emailsHandler.js";
import bcrypt from "bcrypt";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";


//*_______________________SIGNUP PAGE_______________________*//

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {


        // * Required fields check
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }



        // * Password length check
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be greater than 6 characters" });
        }



        // * Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(401).json({ message: "Invalid email format" });
        }



        // * Check if email already exists
        const existingUser = await UserData.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }



        // * Hash password
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);



        // * Add new user in DB
        const newUser = new UserData({
            fullname,
            email,
            password: hashpassword,
            profilepic: ""
        });

        const savedUser = await newUser.save();



        // * Generate token
        const token = generateToken(savedUser._id, res);

        // * Send welcome email 
        try {
            await sendWelcomeEmail(savedUser.email, savedUser.fullname, ENV.CLIENT_URL);
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError.message);
        }
        // * Show user data on UI
        return res.status(201).json({
            _id: savedUser._id,
            fullName: savedUser.fullname,
            email: savedUser.email,
            profilepic: "",
            token: token,
        });

    } catch (error) {
        console.error("Error in signup controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


//*_______________________LOGIN PAGE_______________________*//


export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(401).send("All field are required")
    }

    try {
        const user = await UserData.findOne({ email });
        if (!user) res.status(400).json({ message: "invalid Credentials" })
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) return res.status(400).json({ message: "invalid Credentials" })

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullname,
            email: user.email,
            profilepic: ""
        })

    } catch (error) {
        console.error("Error in login Controller", error.message)
        res.status(500).json({ meesage: "internal server error" })
    }
}

//*_______________________LOGOUT PAGE_______________________*//


export const logout = async (_, res) => {
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).json({ message: "Logout Successfully" })
}


//*_______________________UPDATE PROFILE PAGE_______________________*//

export const updateProfile = async (req, res) => {
    try {
        const { profilepic } = req.body
        if (!profilepic) return res.status(400).json({ message: "Profile picture is required" })

        const userid = req.user._id;

        const uplordResponse = await cloudinary.uploader.upload(profilepic, {
            folder: "profile_pics"
        });

        const updateduser = await UserData.findByIdAndUpdate(userid, { profilepic: uplordResponse.secure_url }, { new: true });
        res.status(200).json(updateduser);

    } catch (error) {
        console.log("Error in update profile", error.message)
        res.status(500).json({ message: "internal server error" })
    }
}
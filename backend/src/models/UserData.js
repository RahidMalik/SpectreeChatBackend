import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullname: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            minlength: 6,
        },
        profilepic: {
            type: String,
            default: ""
        },
    }, { timestamps: true } // CretedAt & UpdatedAt 
)

const UserData = mongoose.model("Validation", userSchema);
export default UserData;
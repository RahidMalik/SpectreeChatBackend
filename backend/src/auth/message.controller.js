import Message from "../models/message.js"
import UserData from "../models/UserData.js"
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

//*_______________________GetAllContacts_______________________*//
export const getAllContacts = async (req, res) => {
    try {
        const loggedinUserId = req.user._id
        const filteredUsers = await UserData.find({
            _id: { $ne: loggedinUserId }
        }).select("-password")

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.error("Error in AllContacts")
        res.status(500).json({ message: "Server Error in AllContacts" })
    }
}

//*_______________________GetMessagesByUserId_______________________*//
export const getMessagesByUserId = async (req, res) => {
    try {
        const myid = req.user._id;
        const { id: UsertoChatId } = req.params;

        const message = await Message.find({
            $or: [
                { senderId: myid, receiverId: UsertoChatId },
                { senderId: UsertoChatId, receiverId: myid },
            ]
        })
        res.status(200).json(message)

    } catch (error) {
        console.log("Error in messages controller:", error.message)
    }
}

//*_______________________SENDMESSAGE_______________________*//
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ message: "Text or image is required." });
        }

        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "Cannot send messages to yourself." });
        }

        const receiverExists = await UserData.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found." });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, { folder: "messages" });
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            seen: false,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({
            message: "Message sent successfully!",
            data: newMessage,
        });

    } catch (error) {
        console.log("Error in sendMessage:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

//*_______________________getChatPartners_______________________*//
export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // find all the messages where the logged-in user is either sender or receiver
        const messages = await Message.find({
            $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        });

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) =>
                    msg.senderId.toString() === loggedInUserId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                )
            ),
        ];

        const chatPartners = await UserData.find({ _id: { $in: chatPartnerIds } }).select("-password");

        res.status(200).json(chatPartners);
    } catch (error) {
        console.error("Error in getChatPartners: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

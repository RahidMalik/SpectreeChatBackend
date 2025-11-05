import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/message.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ENV.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST"],
    },
});

// ✅ Middleware for auth
io.use(socketAuthMiddleware);

// 🧠 Store online users: userId -> socketId
const userSocketMap = {};

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}
io.on("connection", (socket) => {
    const user = socket.user;
    const userId = user?._id?.toString();
    if (!userId) return socket.disconnect(true);

    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    console.log(`🟢 ${user.fullname} connected`);

    // Typing
    socket.on("typing", ({ receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", { senderId: userId });
        }
    });

    // Stop typing
    socket.on("stopTyping", ({ receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userStopTyping", { senderId: userId });
        }
    });

    // ✅ Mark as seen - FIX
    socket.on("markAsSeen", async ({ senderId, receiverId }) => {
        try {
            console.log("📩 Marking messages as seen:", { senderId, receiverId });

            // Update in database
            const result = await Message.updateMany(
                { senderId: senderId, receiverId: receiverId, seen: false },
                { $set: { seen: true } }
            );

            console.log(`✅ Updated ${result.modifiedCount} messages as seen`);

            // ✅ Notify the sender that their messages were seen
            const senderSocketId = userSocketMap[senderId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageSeen", {
                    senderId: senderId,
                    receiverId: receiverId
                });
                console.log(`📤 Sent messageSeen event to sender: ${senderId}`);
            }
        } catch (error) {
            console.error("❌ markAsSeen error:", error);
        }
    });
    // 🗑️ Delete message event (with check)
    socket.on("deleteMessage", async ({ messageId, senderId, receiverId }) => {
        try {
            const deleted = await Message.findByIdAndDelete(messageId);
            if (!deleted) {
                console.warn("⚠️ Message not found:", messageId);
                return;
            }

            // Notify both users
            const senderSocket = userSocketMap[senderId];
            const receiverSocket = userSocketMap[receiverId];

            if (senderSocket) io.to(senderSocket).emit("messageDeleted", { messageId });
            if (receiverSocket) io.to(receiverSocket).emit("messageDeleted", { messageId });

            console.log(`🗑️ Message deleted successfully: ${messageId}`);
        } catch (error) {
            console.error("❌ Error deleting message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log(`🔴 ${user.fullname} disconnected`);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
export { io, app, server };

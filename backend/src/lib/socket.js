import { Server } from 'socket.io';
import http from "http";
import express from "express";
import { ENV } from './env.js';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';
import Message from '../models/message.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ENV.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST"],
    },
});

// Apply auth middleware
io.use(socketAuthMiddleware);

// Store online users
const userSocketMap = {};

// Get socket ID for a user
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.user.fullname);

    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    // Broadcast online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // ✅ Move this outside of disconnect
    socket.on("markAsSeen", async ({ senderId, receiverId }) => {
        try {
            await Message.updateMany(
                { senderId, receiverId, seen: false },
                { $set: { seen: true } }
            );

            // Notify senderMessage
            const senderSocketId = userSocketMap[senderId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageSeen", { receiverId });
            }

            console.log(`✅ Messages marked seen: ${senderId} → ${receiverId}`);
        } catch (error) {
            console.error("Error in markAsSeen event:", error);
        }
    });
    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.user.fullname);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

    });
});

export { io, app, server };
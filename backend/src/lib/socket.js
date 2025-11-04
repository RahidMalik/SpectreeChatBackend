import { Server } from 'socket.io';
import http from "http";
import express from "express";
import { ENV } from './env.js';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';

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

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.user.fullname);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };
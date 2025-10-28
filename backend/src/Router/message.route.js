import express from 'express'
import {
    getAllContacts,
    getChatPartners,
    getMessagesByUserId,
    sendMessage
} from '../auth/message.controller.js';
import { protectRoute } from '../middleware/auth-middleware.js';
import { arcjetProctection } from '../middleware/auth-arcjet.js';

const router = express.Router();

router.use(arcjetProctection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;

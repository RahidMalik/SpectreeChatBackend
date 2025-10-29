import express from 'express';
import { login, logout, signup, updateProfile } from '../auth/auth.controller.js';
import { protectRoute } from '../middleware/auth-middleware.js';
import { arcjetProctection } from '../middleware/auth-arcjet.js';


const router = express.Router();
router.use(arcjetProctection)

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout);


router.put("/UpdateProfile", protectRoute, updateProfile)
router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

export default router
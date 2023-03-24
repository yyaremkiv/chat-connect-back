import express from "express";
import { login, refresh, logout } from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/refresh", verifyToken, refresh);
router.get("/logout", verifyToken, logout);

export default router;

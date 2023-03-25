import express from "express";
import multer from "multer";

import { login, refresh, logout, update } from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";
import { storage } from "../index.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/refresh", verifyToken, refresh);
router.get("/logout", verifyToken, logout);
router.post("/login", login);
router.patch("/update", verifyToken, upload.single("picture"), update);

export default router;

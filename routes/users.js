import express from "express";
import {
  getUser,
  getAllUsers,
  getUserFriends,
  addRemoveFriend,
  changeUserAvatar,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/list", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);
router.patch(
  "/avatar",
  verifyToken,
  upload.single("picture"),
  changeUserAvatar
);

export default router;

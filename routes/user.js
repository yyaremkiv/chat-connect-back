import express from "express";
import {
  getUserData,
  getAllUsers,
  getUserFriends,
  addRemoveFriend,
  // changeUserAvatar,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";

import UserController from "../controllers/user-controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/list", verifyToken, getAllUsers);
router.get("/:userId", verifyToken, getUserData);
router.get("/:userId/friends", verifyToken, getUserFriends);

router.patch("/update", verifyToken, UserController.updateDataUser);

router.patch("/:userId/:friendId", verifyToken, addRemoveFriend);
router.patch(
  "/avatar",
  verifyToken,
  upload.single("picture"),
  UserController.updateAvatarUser
);

export default router;

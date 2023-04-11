import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth-middleware.js";
import UserController from "../controllers/user-controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/list", authMiddleware, UserController.getAllUsers);
router.get("/:userId", authMiddleware, UserController.getUserData);
router.get("/:userId/friends", authMiddleware, UserController.getUserFriends);
router.patch("/update", authMiddleware, UserController.updateDataUser);
router.patch(
  "/:userId/:friendId",
  authMiddleware,
  UserController.addRemoveFriend
);
router.patch(
  "/avatar",
  authMiddleware,
  upload.single("picture"),
  UserController.updateAvatarUser
);

export default router;

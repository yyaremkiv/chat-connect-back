import express from "express";
import multer from "multer";
import {
  getPosts,
  createNewPost,
  patchLike,
  deletePost,
  addComment,
  deleteComment,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import { addFileCloud } from "../services/cloud/cloud.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", verifyToken, getPosts);
router.get("/:userId/posts", verifyToken, getPosts);

router.post("/", verifyToken, upload.single("picture"), createNewPost);
router.patch("/:postId/like", verifyToken, patchLike);
router.patch("/:postId/comment", verifyToken, addComment);
router.patch("/:postId/comment/delete", verifyToken, deleteComment);
router.delete("/:postId/delete", verifyToken, deletePost);

export default router;

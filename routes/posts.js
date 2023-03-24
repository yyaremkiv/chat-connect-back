import express from "express";
import {
  getFeedPosts,
  getUserPosts,
  likePost,
  deletePost,
  addComment,
  deleteComment,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//Routes for authorization:
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);
router.patch("/:id/like", verifyToken, likePost);

// Routes for comment:
router.patch("/:id/comment", verifyToken, addComment);
router.patch("/:id/comment/delete", verifyToken, deleteComment);

//Routes for posts:
router.delete("/:id/delete", verifyToken, deletePost);

export default router;

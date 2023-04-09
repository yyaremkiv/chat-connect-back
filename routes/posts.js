import express from "express";
import multer from "multer";
import {
  getPosts,
  createNewPost,
  patchLike,
  deletePost,
  addComment,
  deleteComment,
  updatePost,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", verifyToken, getPosts);
router.get("/:userId/posts", verifyToken, getPosts);
router.post("/", verifyToken, upload.single("picture"), createNewPost);
router.patch("/", verifyToken, upload.single("picture"), updatePost);
router.patch("/:postId/like", verifyToken, patchLike);
router.patch("/:postId/comment", verifyToken, addComment);
router.patch("/:postId/comment/delete", verifyToken, deleteComment);
router.delete("/:postId/delete", verifyToken, deletePost);

export default router;

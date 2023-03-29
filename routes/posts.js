import express from "express";
import multer from "multer";
import {
  getFeedPosts,
  getUserPosts,
  likePost,
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

router.post("/", verifyToken, upload.single("picture"), createPost);
router.get("/", verifyToken, getFeedPosts);

//Routes for authorization:
router.get("/:userId/posts", verifyToken, getUserPosts);
router.patch("/:id/like", verifyToken, likePost);

// Routes for comment:
router.patch("/:id/comment", verifyToken, addComment);
router.patch("/:id/comment/delete", verifyToken, deleteComment);

//Routes for posts:
router.delete("/:id/delete", verifyToken, deletePost);

async function createPost(req, res) {
  try {
    const { userId, description } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("not found user with this id");
    }

    if (req.file) {
      const publicUrl = await addFileCloud(req.file);

      const newPost = new Post({
        author: user._id,
        description,
        picturePath: publicUrl,
        likes: {},
        comments: [],
      });
      await newPost.save();
    } else {
      const newPost = new Post({
        author: user._id,
        description,
        picturePath: "",
        likes: {},
        comments: [],
      });
      await newPost.save();
    }

    const posts = await Post.find()
      .populate("author", "firstName lastName location occupation picturePath")
      .sort({ createdAt: "desc" });
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
}

export default router;

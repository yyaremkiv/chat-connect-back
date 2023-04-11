import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth-middleware.js";
import PostController from "../controllers/posts-controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", authMiddleware, PostController.getPosts);
router.get("/:userId/posts", authMiddleware, PostController.getPosts);
router.post(
  "/",
  authMiddleware,
  upload.single("picture"),
  PostController.createNewPost
);
router.patch(
  "/",
  authMiddleware,
  upload.single("picture"),
  PostController.updatePost
);
router.patch("/:postId/like", authMiddleware, PostController.patchLike);
router.patch("/:postId/comment", authMiddleware, PostController.addComment);
router.patch(
  "/:postId/comment/delete",
  authMiddleware,
  PostController.deleteComment
);
router.delete("/:postId/delete", authMiddleware, PostController.deletePost);

export default router;

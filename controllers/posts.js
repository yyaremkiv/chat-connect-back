import { addFileCloud } from "../services/cloud/cloud.js";
import {
  listPosts,
  addNewPost,
  deleteOnePost,
  patchLikePost,
  addCommentPost,
  deleteCommentPost,
} from "../services/mongoose/postsService.js";

export const getPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    let { page = 1, limit = 10, sort = "desc" } = req.query;

    const skip = parseInt((page - 1) * limit);
    limit = parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

    if (userId) {
      const { posts, totalCounts } = await listPosts({
        userId,
        skip,
        limit,
        sort,
      });
      res.status(200).json({ posts, totalCounts });
    } else {
      const { posts, totalCounts } = await listPosts({ skip, limit, sort });
      res.status(200).json({ posts, totalCounts });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createNewPost = async (req, res) => {
  try {
    const { userId, description } = req.body;
    let { page = 1, limit = 10, sort = "desc" } = req.query;

    const skip = parseInt((page - 1) * limit);
    limit = parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

    if (req.file) {
      const picturePath = await addFileCloud(req.file);
      await addNewPost({ userId, description, picturePath });
    } else {
      await addNewPost({
        userId,
        description,
        picturePath: "",
      });
    }

    const { posts, totalCounts } = await listPosts({ skip, limit, sort });
    res.status(201).json({ posts, totalCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const patchLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await patchLikePost({ postId, userId });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { postId } = req.params;
    const { text } = req.body;

    const updatedPost = await addCommentPost({ userId, postId, text });

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { created } = req.body;

    const updatePost = await deleteCommentPost({ postId, created });

    res.status(201).json(updatePost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    let { page = 1, limit = 10, sort = "desc" } = req.query;

    const skip = parseInt((page - 1) * limit);
    limit = parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

    await deleteOnePost({ postId });

    const { posts, totalCounts } = await listPosts({ skip, limit, sort });
    res.status(201).json({ posts, totalCounts });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

import Post from "../models/post-model.js";
import PostService from "../services/post-service.js";
import CloudService from "../services/cloud-service.js";

class PostController {
  static getPosts = async (req, res) => {
    try {
      const { userId } = req.params;
      let { page = 1, limit = 10, sort = "desc" } = req.query;

      const skip = parseInt((page - 1) * limit);
      limit =
        parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

      if (userId) {
        const { posts, totalCounts } = await PostService.listPosts({
          userId,
          skip,
          limit,
          sort,
        });
        res.status(200).json({ posts, totalCounts });
      } else {
        const { posts, totalCounts } = await PostService.listPosts({
          skip,
          limit,
          sort,
        });
        res.status(200).json({ posts, totalCounts });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static createNewPost = async (req, res) => {
    try {
      const { userId, description } = req.body;
      let { page = 1, limit = 10, sort = "desc" } = req.query;

      const skip = parseInt((page - 1) * limit);
      limit =
        parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

      if (req.file) {
        const picturePath = await CloudService.addFileCloud(req.file);
        await PostService.addNewPost({ userId, description, picturePath });
      } else {
        await PostService.addNewPost({
          userId,
          description,
          picturePath: "",
        });
      }

      const { posts, totalCounts } = await PostService.listPosts({
        skip,
        limit,
        sort,
      });
      res.status(201).json({ posts, totalCounts });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static updatePost = async (req, res) => {
    try {
      const { userId, postId, description, deletePhoto } = req.body;
      let { page = 1, limit = 10, sort = "desc" } = req.query;

      const skip = parseInt((page - 1) * limit);
      limit =
        parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

      const post = await Post.findById(postId);

      if (req.file) {
        if (post.picturePath)
          await CloudService.deleteFileCloud(post.picturePath);
        const publicUrl = await CloudService.addFileCloud(req.file);

        await Post.findByIdAndUpdate(postId, {
          picturePath: publicUrl,
          description,
        });
      } else {
        if (deletePhoto === "true") {
          console.log("deletePhoto", Boolean(deletePhoto));
          if (post.picturePath) {
            await CloudService.deleteFileCloud(post.picturePath);
          }
          await Post.findByIdAndUpdate(postId, {
            description,
            picturePath: "",
          });
        } else {
          await Post.findByIdAndUpdate(postId, { description });
        }
      }

      const { posts, totalCounts } = await PostService.listPosts({
        skip,
        limit,
        sort,
      });
      res.status(201).json({ posts, totalCounts });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static patchLike = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;

      const post = await PostService.patchLikePost({ postId, userId });

      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static fetchComments = async (req, res) => {
    try {
      const { postId, isLoadMore } = req.body;
      let { page = 1, limit = 10, sort = "desc" } = req.query;

      const skip = parseInt((page - 1) * limit);
      limit =
        parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

      const updatedPost = await PostService.fetchComments({
        postId,
        skip,
        limit,
        sort,
        isLoadMore,
      });

      res.status(200).json(updatedPost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static addComment = async (req, res) => {
    try {
      const { _id: userId } = req.user;
      const { postId, text } = req.body;
      let { page = 1, limit = 10, sort = "desc" } = req.query;

      const skip = parseInt((page - 1) * limit);
      limit =
        parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

      const updatedPost = await PostService.addComment({
        userId,
        postId,
        text,
        skip,
        limit,
        sort,
      });

      res.status(200).json(updatedPost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static updateComment = async (req, res) => {
    try {
      const { postId, commentId, text } = req.body;
      let { page = 1, limit = 10, sort = "desc" } = req.query;

      const skip = parseInt((page - 1) * limit);
      limit =
        parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

      const updatedPost = await PostService.updateComment({
        postId,
        commentId,
        text,
        skip,
        limit,
        sort,
      });

      res.status(200).json(updatedPost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static deleteComment = async (req, res) => {
    try {
      const { postId, commentId } = req.body;
      let { page = 1, limit = 10, sort = "desc" } = req.query;

      const skip = parseInt((page - 1) * limit);
      limit =
        parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

      const deletedCommentId = await PostService.deleteComment({
        postId,
        commentId,
        skip,
        limit,
        sort,
      });

      res.status(201).json(deletedCommentId);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  static deletePost = async (req, res) => {
    try {
      const { postId } = req.params;
      let { page = 1, limit = 10, sort = "desc" } = req.query;

      const skip = parseInt((page - 1) * limit);
      limit =
        parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

      await PostService.deleteOnePost({ postId });

      const { posts, totalCounts } = await PostService.listPosts({
        skip,
        limit,
        sort,
      });
      res.status(201).json({ posts, totalCounts });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };
}

export default PostController;

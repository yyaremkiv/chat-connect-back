import PostService from "../services/post-service.js";
import { processPaginationParams } from "../config/pagination.js";

class PostController {
  static getPosts = async (req, res) => {
    try {
      const { userId } = req.params;
      const { skip, limit, sort } = processPaginationParams(req.query);

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
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };

  static createNewPost = async (req, res) => {
    try {
      const { userId, description } = req.body;
      const { skip, limit, sort } = processPaginationParams(req.query);

      const { posts, totalCounts } = await PostService.addNewPost({
        userId,
        description,
        file: req.file,
        skip,
        limit,
        sort,
      });

      res.status(201).json({ posts, totalCounts });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };

  static updatePost = async (req, res) => {
    try {
      const { postId, textPost, deletePhoto } = req.body;

      const updatedPost = await PostService.updatePost({
        postId,
        file: req.file,
        textPost,
        deletePhoto,
      });

      res.status(201).json(updatedPost);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };

  static deletePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { skip, limit, sort } = processPaginationParams(req.query);

      await PostService.deleteOnePost({ postId });

      const { posts, totalCounts } = await PostService.listPosts({
        skip,
        limit,
        sort,
      });

      res.status(201).json({ posts, totalCounts });
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  };

  static patchLike = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;

      const updatedPost = await PostService.patchLikePost({ postId, userId });

      res.status(201).json(updatedPost);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };

  static fetchComments = async (req, res) => {
    try {
      const { postId, isLoadMore } = req.body;
      const { skip, limit, sort } = processPaginationParams(req.query);

      const post = await PostService.fetchComments({
        postId,
        skip,
        limit,
        sort,
        isLoadMore,
      });

      res.status(200).json(post);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };

  static addComment = async (req, res) => {
    try {
      const { _id: userId } = req.user;
      const { postId, commentText } = req.body;
      const { skip, limit, sort } = processPaginationParams(req.query);

      const updatedPost = await PostService.addComment({
        userId,
        postId,
        commentText,
        skip,
        limit,
        sort,
      });

      res.status(200).json(updatedPost);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };

  static updateComment = async (req, res) => {
    try {
      const { postId, commentId, commentText } = req.body;

      const updatedComment = await PostService.updateComment({
        postId,
        commentId,
        commentText,
      });

      res.status(200).json({ postId, updatedComment });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };

  static deleteComment = async (req, res) => {
    try {
      const { postId, commentId } = req.body;
      const { skip, limit, sort } = processPaginationParams(req.query);

      const updatedPost = await PostService.deleteComment({
        postId,
        commentId,
        skip,
        limit,
        sort,
      });

      res.status(201).json(updatedPost);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

export default PostController;

import Post from "../models/post-model.js";
import CloudService from "./cloud-service.js";
import { v4 as uuidv4 } from "uuid";

const commentsQuery = {
  path: "comments.author",
  model: "User",
  select: "firstName lastName location occupation picturePath",
};
const authorQuery = {
  path: "author",
  model: "User",
  select: "firstName lastName location occupation picturePath",
};

class PostService {
  static listPosts = async ({ userId = null, skip, limit, sort }) => {
    const query = userId ? { author: userId } : {};
    const posts = await Post.find(query)
      .select("-__v")
      .populate(authorQuery)
      .populate(commentsQuery)
      .sort({ createdAt: sort })
      .skip(skip)
      .limit(limit);

    const totalCounts = await Post.countDocuments(query);

    return { posts, totalCounts };
  };

  static addNewPost = async ({ userId, description, picturePath }) => {
    const newPost = new Post({
      author: userId,
      description,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    return newPost;
  };

  static updatePost = async ({ userId, description, picturePath }) => {
    return null;
  };

  static deleteOnePost = async ({ postId }) => {
    const post = await Post.findById(postId);

    if (post.picturePath) {
      await CloudService.deleteFileCloud(post.picturePath);
    }

    await Post.findByIdAndDelete(postId);
  };

  static patchLikePost = async ({ postId, userId }) => {
    const post = await Post.findById(postId);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatePost = await Post.findByIdAndUpdate(
      postId,
      { likes: post.likes },
      { new: true }
    )
      .populate(authorQuery)
      .populate(commentsQuery);

    return updatePost;
  };

  static addCommentPost = async ({ userId, postId, text }) => {
    const comment = {
      id: uuidv4(),
      author: userId,
      created: new Date(),
      text,
    };

    const updatePost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { $each: [comment], $position: 0 } },
      },
      { new: true }
    )
      .populate(authorQuery)
      .populate(commentsQuery)
      .sort({ createdAt: "desc" });

    return updatePost;
  };

  static deleteComment = async ({ postId, commentId }) => {
    const post = await Post.findById(postId);

    const newComments = post.comments.filter((comment) => {
      console.log("console.log", comment.id, "-------", commentId);
      if (comment.id !== commentId) {
        return true;
      }
      return false;
    });

    const updatePost = await Post.findByIdAndUpdate(
      postId,
      {
        comments: newComments,
      },
      { new: true }
    )
      .populate(authorQuery)
      .populate(commentsQuery)
      .sort({ createdAt: "desc" });

    return updatePost;
  };
}

export default PostService;

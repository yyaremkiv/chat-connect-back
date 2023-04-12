import Post from "../models/post-model.js";
import CloudService from "./cloud-service.js";
import { v4 as uuidv4 } from "uuid";

const authorQuery = {
  path: "author",
  model: "User",
  select: "firstName lastName location occupation picturePath",
};

const commentsQuery = {
  path: "comments",
  populate: {
    path: "author",
    model: "User",
    select: "firstName lastName location occupation picturePath",
  },
};

class PostService {
  static listPosts = async ({ userId = null, skip, limit, sort }) => {
    const query = userId ? { author: userId } : {};
    const posts = await Post.find(query)
      .select("-__v")
      .populate(authorQuery)
      .sort({ createdAt: sort })
      .skip(skip)
      .limit(limit);

    const totalCounts = await Post.countDocuments(query);

    const limitedPosts = posts.map((post) => {
      post.commentsCount = post.comments.length;
      post.comments = [];
      return post;
    });

    return { posts: limitedPosts, totalCounts };
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

  static fetchComments = async ({ postId, skip, limit, sort, isLoadMore }) => {
    console.log(postId, skip, limit, sort, isLoadMore);
    const post = await Post.findById(postId)
      .select("-__v")
      .populate(authorQuery)
      .populate(commentsQuery);

    post.comments.sort((a, b) =>
      sort === "desc" ? a.created - b.created : b.created - a.created
    );
    post.commentsCount = post.comments.length;
    if (post.comments.length > limit) {
      post.comments = post.comments.slice(skip, skip + limit);
    }

    return post;
  };

  static addComment = async ({ userId, postId, text, skip, limit, sort }) => {
    const comment = {
      id: uuidv4(),
      author: userId,
      created: new Date(),
      updated: new Date(),
      text,
    };

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { $each: [comment], $position: 0 } } },
      { new: true }
    )
      .populate(authorQuery)
      .populate(commentsQuery);

    updatedPost.comments.sort((a, b) =>
      sort === "desc" ? a.created - b.created : b.created - a.created
    );
    updatedPost.commentsCount = updatedPost.comments.length;
    if (updatedPost.comments.length > limit) {
      updatedPost.comments = updatedPost.comments.slice(skip, skip + limit);
    }

    return updatedPost;
  };

  static updateComment = async ({
    postId,
    commentId,
    text,
    skip,
    limit,
    sort,
  }) => {
    const post = await Post.findById(postId);

    const newComments = post.comments.map((comment) => {
      if (comment.id === commentId) {
        comment.text = text;
        comment.updated = new Date();
      }
      return comment;
    });

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { comments: newComments },
      { new: true }
    )
      .populate(authorQuery)
      .populate(commentsQuery);

    updatedPost.comments.sort((a, b) =>
      sort === "desc" ? a.created - b.created : b.created - a.created
    );
    updatedPost.commentsCount = updatedPost.comments.length;
    if (updatedPost.comments.length > limit) {
      updatedPost.comments = updatedPost.comments.slice(skip, skip + limit);
    }

    return updatedPost;
  };

  static deleteComment = async ({ postId, commentId, skip, limit, sort }) => {
    const post = await Post.findById(postId);

    const newComments = post.comments.filter((item) => item.id !== commentId);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { comments: newComments },
      { new: true }
    )
      .populate(authorQuery)
      .populate(commentsQuery);

    updatedPost.comments.sort((a, b) =>
      sort === "desc" ? a.created - b.created : b.created - a.created
    );
    updatedPost.commentsCount = updatedPost.comments.length;
    if (updatedPost.comments.length > limit) {
      updatedPost.comments = updatedPost.comments.slice(skip, skip + limit);
    }

    return updatedPost;
  };
}

export default PostService;

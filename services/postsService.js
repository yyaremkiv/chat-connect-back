import Post from "../models/Post.js";
import { deleteFileCloud } from "./cloud/cloud.js";

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

export const listPosts = async ({ userId = null, skip, limit, sort }) => {
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

export const addNewPost = async ({ userId, description, picturePath }) => {
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

export const deleteOnePost = async ({ postId }) => {
  const post = await Post.findById(postId);

  if (post.picturePath) {
    await deleteFileCloud(post.picturePath);
  }

  await Post.findByIdAndDelete(postId);
};

export const patchLikePost = async ({ postId, userId }) => {
  const post = await Post.findById(postId);
  const isLiked = post.likes.get(userId);

  if (isLiked) {
    post.likes.delete(userId);
  } else {
    post.likes.set(userId, true);
  }

  const updatePost = await Post.findByIdAndUpdate(
    id,
    { likes: post.likes },
    { new: true }
  )
    .populate(authorQuery)
    .populate(commentsQuery);

  return updatePost;
};

export const addCommentPost = async ({ userId, postId, text }) => {
  const comment = {
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

export const deleteCommentPost = async ({ postId, created }) => {
  const post = await Post.findById(postId);

  const newComments = post.comments.filter((comment) => {
    if (comment.created.getTime() !== new Date(created).getTime()) {
      console.log("yes", comment.created, created);
      return true;
    }
    console.log("no");
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

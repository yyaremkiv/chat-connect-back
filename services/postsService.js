import Post from "../models/Post.js";

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

export const listPosts = async ({ skip, limit, sort }) => {
  const posts = await Post.find()
    .select("-__v")
    .populate(authorQuery)
    .populate(commentsQuery)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: sort });

  const totalCounts = await Post.countDocuments();

  return { posts, totalCounts };
};

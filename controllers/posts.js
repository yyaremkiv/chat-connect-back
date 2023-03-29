import Post from "../models/Post.js";
import User from "../models/User.js";
import { deleteFileCloud } from "../services/cloud/cloud.js";

// export const createPost = async (req, res) => {
//   try {
//     const { userId, description, picturePath } = req.body;
//     const user = await User.findById(userId);
//     const newPost = new Post({
//       userId,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       location: user.location,
//       description,
//       userPicturePath: user.picturePath,
//       picturePath,
//       likes: {},
//       comments: [],
//     });
//     await newPost.save();

//     const post = await Post.find().sort({ createdAt: "desc" });
//     res.status(201).json(post);
//   } catch (err) {
//     res.status(409).json({ message: err.message });
//   }
// };

export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find()
      .populate("author", "firstName lastName location occupation picturePath")
      .populate({
        path: "comments.author",
        model: "User",
        select: "firstName lastName location occupation picturePath",
      })
      .sort({ createdAt: "desc" });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const posts = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    )
      .populate("author", "firstName lastName location occupation picturePath")
      .populate({
        path: "comments.author",
        model: "User",
        select: "firstName lastName location occupation picturePath",
      })
      .sort({ createdAt: "desc" });

    res.status(201).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const { userId } = req.body;

    const post = await Post.findById(id);
    const user = await User.findById(userId);

    const comment = {
      author: user._id,
      created: new Date(),
      text,
    };

    const updatePost = await Post.findByIdAndUpdate(id, {
      comments: [...post.comments, comment],
    });

    const updatedPosts = await Post.find()
      .populate("author", "firstName lastName location occupation picturePath")
      .populate({
        path: "comments.author",
        model: "User",
        select: "firstName lastName location occupation picturePath",
      })
      .sort({ createdAt: "desc" });

    res.status(200).json(updatedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      res.status(500).json({ message: "Post not found" });
    }

    const newComments = post.comments.filter((comment) => {
      if (comment.text !== text) {
        return true;
      }
      return false;
    });

    console.log("text", newComments);

    await Post.findByIdAndUpdate(id, {
      comments: newComments,
    });

    const updatedPosts = await Post.find()
      .populate("author", "firstName lastName location occupation picturePath")
      .populate({
        path: "comments.author",
        model: "User",
        select: "firstName lastName location occupation picturePath",
      })
      .sort({ createdAt: "desc" });

    res.status(200).json(updatedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (post.picturePath) {
      await deleteFileCloud(post.picturePath);
    }

    await Post.findByIdAndDelete(id);

    const posts = await Post.find()
      .populate("author", "firstName lastName location occupation picturePath")
      .populate({
        path: "comments.author",
        model: "User",
        select: "firstName lastName location occupation picturePath",
      })
      .sort({ createdAt: "desc" });

    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

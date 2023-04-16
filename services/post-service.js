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

  static addNewPost = async ({
    userId,
    description,
    file,
    skip,
    limit,
    sort,
  }) => {
    let picturePath = "";

    if (file) {
      picturePath = await CloudService.addFileCloud(file);
    }

    const newPost = new Post({
      author: userId,
      description,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const { posts, totalCounts } = await this.listPosts({ skip, limit, sort });

    return { posts, totalCounts };
  };

  static updatePost = async ({ postId, file, textPost, deletePhoto }) => {
    const post = await Post.findById(postId);
    let updatedPost;

    if (file) {
      if (post.picturePath) {
        await CloudService.deleteFileCloud(post.picturePath);
      }
      const publicUrl = await CloudService.addFileCloud(file);
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { picturePath: publicUrl, description: textPost },
        { new: true }
      ).populate(authorQuery);
    }

    if (!file && deletePhoto === "true") {
      await CloudService.deleteFileCloud(post.picturePath);

      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { description: textPost, picturePath: "" },
        { new: true }
      ).populate(authorQuery);
    }

    if (!file && deletePhoto === "false") {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { description: textPost },
        { new: true }
      ).populate(authorQuery);
    }

    updatedPost.commentsCount = post.comments.length;
    updatedPost.comments = [];

    return updatedPost;
  };

  static deleteOnePost = async ({ postId }) => {
    const post = await Post.findById(postId);

    if (!post) throw new Error(`Post with Id ${postId} not found`);

    if (post.picturePath) {
      await CloudService.deleteFileCloud(post.picturePath);
    }
    await Post.findByIdAndDelete(postId);
  };

  static patchLikePost = async ({ postId, userId }) => {
    const post = await Post.findById(postId);

    if (!post) throw new Error(`Post with Id ${postId} not found`);

    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { likes: post.likes },
      { new: true }
    )
      .populate(authorQuery)
      .populate(commentsQuery);

    updatedPost.commentsCount = updatedPost.comments.length;
    updatedPost.comments = [];

    return updatedPost;
  };

  static fetchComments = async ({ postId, skip, limit, sort, isLoadMore }) => {
    const post = await Post.findById(postId)
      .select("-__v")
      .populate(authorQuery)
      .populate(commentsQuery);

    post.commentsCount = post.comments.length;
    post.comments.sort((a, b) =>
      sort === "desc" ? a.created - b.created : b.created - a.created
    );
    if (post.comments.length > limit) {
      post.comments = post.comments.slice(skip, skip + limit);
    }

    return post;
  };

  static addComment = async ({
    userId,
    postId,
    commentText,
    skip,
    limit,
    sort,
  }) => {
    const comment = {
      id: uuidv4(),
      author: userId,
      created: new Date(),
      updated: new Date(),
      text: commentText,
    };

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { $each: [comment], $position: 0 } } },
      { new: true }
    )
      .populate(authorQuery)
      .populate(commentsQuery);

    updatedPost.commentsCount = updatedPost.comments.length;
    updatedPost.comments.sort((a, b) =>
      sort === "desc" ? a.created - b.created : b.created - a.created
    );
    if (updatedPost.comments.length > limit) {
      updatedPost.comments = updatedPost.comments.slice(skip, skip + limit);
    }

    return updatedPost;
  };

  static updateComment = async ({ postId, commentId, commentText }) => {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, "comments.id": commentId },
      {
        $set: {
          "comments.$.text": commentText,
          "comments.$.updated": new Date(),
        },
      },
      { new: true }
    ).populate(commentsQuery);

    const updatedComment = updatedPost?.comments.find(
      (comment) => comment.id === commentId
    );

    if (!updatedPost || !updatedComment)
      throw new Error(`Comment with Id ${commentId} not found`);

    return updatedComment;
  };

  static deleteComment = async ({ postId, commentId, skip, limit, sort }) => {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: { id: commentId } } },
      { new: true }
    )
      .populate(authorQuery)
      .populate(commentsQuery);

    if (!updatedPost) throw new Error(`Post with Id ${postId} not found`);

    updatedPost.commentsCount = updatedPost.comments.length;
    updatedPost.comments.sort((a, b) =>
      sort === "desc" ? a.created - b.created : b.created - a.created
    );

    if (updatedPost.comments.length > limit) {
      updatedPost.comments = updatedPost.comments.slice(skip, skip + limit);
    }

    return updatedPost;
  };
}

export default PostService;

import mongoose from "mongoose";
import User from "./user-model.js";

const postSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    description: String,
    picturePath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: {
      type: Array,
      default: [
        {
          author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User,
          },
          created: String,
          text: String,
        },
      ],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;

import mongoose from "mongoose";
import User from "./User.js";

const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: User,
      required: true,
    },
    friends: [
      {
        friendId: {
          type: mongoose.Types.ObjectId,
          ref: User,
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;

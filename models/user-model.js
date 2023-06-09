import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      min: 4,
      max: 50,
      unique: true,
      validate: {
        validator: async function (v) {
          const user = await this.constructor.findOne({ email: v });
          if (user && !user._id.equals(this._id)) {
            throw new Error("Email address must be unique");
          }
        },
        message: "Email address must be unique",
      },
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 20,
    },
    location: {
      type: String,
      max: 50,
      default: "",
    },
    occupation: {
      type: String,
      max: 50,
      default: "",
    },
    twitter: {
      type: String,
      max: 50,
      default: "",
    },
    linkendin: {
      type: String,
      max: 50,
      default: "",
    },
    picturePath: {
      type: String,
      default:
        "https://storage.googleapis.com/chat-connect/avatar/no-user-image.jpg",
    },
    friends: {
      type: Number,
      default: 0,
    },
    posts: {
      type: Number,
      default: 0,
    },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    viewedProfile: Number,
    impressions: Number,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;

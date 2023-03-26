import mongoose from "mongoose";
import cloudConfig from "../config/cloudConfig.js";

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
    token: {
      type: String,
      default: null,
    },
    picturePath: {
      type: String,
      default: cloudConfig.imagePathDefault,
    },
    friends: {
      type: Array,
      default: [],
    },
    viewedProfile: Number,
    impressions: Number,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;

import express from "express";
import multer from "multer";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import {
  login,
  refresh,
  logout,
  update,
  deleteAvatar,
} from "../controllers/auth.js";
import { addFileCloud, deleteFileCloud } from "../services/cloud/cloud.js";
import { verifyToken } from "../middleware/auth.js";
import cloudConfig from "../config/cloudConfig.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", upload.single("picture"), register);
router.patch("/avatar", verifyToken, upload.single("picture"), updateAvatar);

router.get("/refresh", verifyToken, refresh);
router.get("/logout", verifyToken, logout);
router.post("/login", login);
router.patch("/update", verifyToken, update);
router.delete("/avatar", verifyToken, deleteAvatar);

async function register(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    if (req.file) {
      const publicUrl = await addFileCloud(req.file);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: passwordHash,
        picturePath: publicUrl,
        friends,
        location,
        occupation,
        viewedProfile: Math.floor(Math.random() * 10000),
        impressions: Math.floor(Math.random() * 10000),
      });

      await newUser.save();
      res.status(201).json({ message: "New user successfully created!" });
    } else {
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: passwordHash,
        friends,
        location,
        occupation,
        viewedProfile: Math.floor(Math.random() * 10000),
        impressions: Math.floor(Math.random() * 10000),
      });

      await newUser.save();
      res.status(201).json({ message: "New user successfully created!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateAvatar(req, res) {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User does not exists" });
      return;
    }

    if (user.picturePath !== cloudConfig.publicImagePathDefault) {
      await deleteFileCloud(user.picturePath);
    }

    const publicUrl = await addFileCloud(req.file);

    await User.findByIdAndUpdate(id, { picturePath: publicUrl });

    const updateUser = await User.find({}).select("-password -token -__v");
    res.status(201).json(updateUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export default router;

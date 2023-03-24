import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { Storage } from "@google-cloud/storage";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
// app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const storage = new Storage({
  projectId: "your-project-id",
  keyFilename: path.resolve("./gcp.json"),
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

async function createPost(req, res) {
  try {
    if (req.file) {
      console.log("this 1 console");
      const bucketName = "chat-connect";
      const fileName = `${Date.now()}-${req.file.originalname}`;
      console.log("this 2 console", fileName);
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      stream.on("error", (err) => {
        console.log("this 3 console", err.message);
        res.status(500).json({ message: err.message });
      });
      stream.on("finish", async () => {
        const publicUrl = `https://storage.cloud.google.com/${bucketName}/${fileName}`;

        const { userId, description, picturePath } = req.body;
        const user = await User.findById(userId);
        const newPost = new Post({
          userId,
          firstName: user.firstName,
          lastName: user.lastName,
          location: user.location,
          description,
          userPicturePath: user.picturePath,
          picturePath: publicUrl,
          likes: {},
          comments: [],
        });
        await newPost.save();
        const posts = await Post.find().sort({ createdAt: "desc" });
        res.status(201).json(posts);
      });

      stream.end(req.file.buffer);
    } else {
      const { userId, description, picturePath } = req.body;
      const user = await User.findById(userId);
      const newPost = new Post({
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location,
        description,
        userPicturePath: user.picturePath,
        picturePath: "",
        likes: {},
        comments: [],
      });
      await newPost.save();
      const posts = await Post.find().sort({ createdAt: "desc" });
      res.status(201).json(posts);
    }
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
}

async function register(req, res) {
  try {
    if (req.file) {
      const bucketName = "chat-connect";
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      stream.on("error", (err) => {
        next(err);
      });
      stream.on("finish", async () => {
        const publicUrl = `https://storage.cloud.google.com/${bucketName}/${fileName}`;

        const {
          firstName,
          lastName,
          email,
          password,
          // picturePath,
          friends,
          location,
          occupation,
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

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

        const savedUser = await newUser.save();
        res.status(201).json({ message: "Succes" });
      });
      stream.end(req.file.buffer);
    } else {
      const {
        firstName,
        lastName,
        email,
        password,
        // picturePath,
        friends,
        location,
        occupation,
      } = req.body;

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: passwordHash,
        picturePath:
          "https://storage.cloud.google.com/chat-connect/no-user-image.jpg",
        friends,
        location,
        occupation,
        viewedProfile: Math.floor(Math.random() * 10000),
        impressions: Math.floor(Math.random() * 10000),
      });

      const savedUser = await newUser.save();
      res.status(201).json({ message: "Succes" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));

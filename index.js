import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/posts.js";
import cookieParser from "cookie-parser";
import { Storage } from "@google-cloud/storage";
import errorMiddleware from "./middleware/error-middleware.js";
dotenv.config();

const STORAGE_CLIENT_EMAIL = process.env.STORAGE_CLIENT_EMAIL;
const STORAGE_PRIVATE_KEY = process.env.STORAGE_PRIVATE_KEY;
const STORAGE_PROJECT_ID = process.env.STORAGE_PROJECT_ID;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "15mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true }));
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

export const storage = new Storage({
  projectId: STORAGE_PROJECT_ID,
  credentials: {
    client_email: STORAGE_CLIENT_EMAIL,
    private_key: STORAGE_PRIVATE_KEY,
  },
});

app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use(errorMiddleware);

const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));

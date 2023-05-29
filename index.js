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

const STORAGE_CLIENT_EMAIL =
  "testchatconnected@phrasal-bruin-381116.iam.gserviceaccount.com";
const STORAGE_PRIVATE_KEY =
  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4BULUSA7j4nWf\nHhTojaU2dbGBb3SbNQn3pN4xy9R/q6tbUpZmbVDed4sCTIp/TQ4MxPgZtwn1u5Tu\ncmnOno2l7XjTVgPxRYfLbebjNspbuvKNg/ZUJQuU7Wt/RHxoWhvIDows2/k2zmFG\nGjDaGNpN7UgUoE6OGhR3uujk2YD7Nw9bAvol8/NkSSb1PRbtRVJsseClwHEdHRpP\noi6yxtkE917ZYvnx+2g+p9aUPKwO6czndEznoK8AD6QNSc8Q3htbOHcwL60JrxB4\n30u2EIA55n/3rhzYGR4ySfXK0ABwq/9GCeE18FgQs9mvz5AgHN560A7D0e7iUnkQ\nUrsfhHBZAgMBAAECggEAGlrWiWSQjV6fjdxXDj9LDBOrCmiWAKyF8uuvzt3sXySM\n9BVN6Pl6/YGNbRTdOQImIvoKtlQanxDwcX39XVQj4UGzbkEBa4qTujTRPnVYYe7S\nUiY2HzL3B6tBHAcI8kEFfY9nz/zpIkpIcCvMF1A747E6A4o59ewSRluEg1ILQO8R\nmTNA74XK7IRYJRhD1UVlSaWS9M96HKOEaVWfUt+boh+zj/i5HyxHvFplXMbjQyml\nX9oxry7eE7djhJCORYLTVy5oJySSXECIe54vJPoQ/QIMlmFC/O0yl5IhcxOgMp3R\nb5O8YOVzSnKz58tdn14oZLzN+aSMIcnJOlijgV4LiQKBgQDenJQMwG3lp7Hi7Ro3\n7PF+QQLracyQLmTQk6bAvGPkfWvYwRdui6MmqQ2D2ve/yVa7/Db5cdeqC6++wRJI\n5q54xU8c1uncPZtb1moFu+4+agwqf6u09G6tuQ+2l6ET+iWnLUFhxoifUDjMjrn/\nj4thwDbhC6AXyq7sTkKxUJht5wKBgQDTnu9jJbxRbIhNGi5NGC/BpmVavXDha5fp\nYICDDzxSCMpfiZYVaZRYQndPazPLGrp9mEgjsR6ulkqkcJlq1XDoTKie++tG+6yW\nWwjq5xAlzH8/XVbBnio0/mrSjy2+TsIFCOCcHGLAqg+iTt76CwmcgbmrqWXG/brs\nfQ+3DonnvwKBgCqyaYsQlYOI6IuX4oF7hs4qdf7lKgE1hMykpUUuXRKEI91NG8tu\nKPrPTfJOW1qDqYkg1QJ/HVhWKX0y1uj4pdowLf5gEjbV8ihpNain5Qg/mtnD5xEs\nGNZlOmhRKOoF/pbUDUhNpgK4hkxly7MCuz8ieOQtMKWfkHFuiUgtJy9dAoGBANKT\nG0gAW7R2F+cI/zutro+2gLJbQYC9rGsIoLhJJ8/FeYK5iMODzJ5KfShk1yPqU9n3\n9wi1DX/SgzG/7ZlWDETLSxrwOHzooCL5MRV1mSbTp2co/NQrC3qyEx+0Y2M0QXH7\nFG2i/U0Tq/zpGI2dABJhL502MdVh02fRRhr0d5tHAoGAGJJXkWlSrXJ0pB6Jinm8\ngZ7kcD60EsAPxhO9xFfn1Eo3GtfTN8+LX9sSyuUgc+aYAiiycMDR7gIY+Js1EYTp\nBMLXTyFtyHIlDTTuisS7RQ+GVtd3lyEUSqKszfnGPtMo5Y68ZOEqUBil4D4kN8y5\ny8VO4mYiP4SnLnx3RB/4vtw=\n-----END PRIVATE KEY-----\n";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
dotenv.config();
app.use(bodyParser.json({ limit: "15mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true }));
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

export const storage = new Storage({
  projectId: process.env.STORAGE_PROJECT_ID,
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

import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(500).send({ message: "Not token with this response" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(verified.id);

    if (token !== user.token) {
      throw new Error("Not found token");
    }

    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ error: "not token to send" });
  }
};

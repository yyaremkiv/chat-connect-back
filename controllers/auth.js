import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cloudConfig from "../config/cloudConfig.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(401)
        .json({ message: "Your email address or password is incorrect." });

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword)
      return res
        .status(401)
        .json({ message: "Your email address or password is incorrect." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).select("-password -token -__v");

    if (!user) {
      throw new Error("not found user with this id");
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      firstName,
      lastName,
      email,
      location,
      occupation,
      twitter,
      linkendin,
    } = req.body;
    let user = await User.findById(id);

    if (!user) {
      throw new Error("Not found user with this id");
    }

    await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
      email,
      location,
      occupation,
      twitter,
      linkendin,
    });
    const updateUser = await User.find({}).select("-password -token -__v");
    res.status(201).json(updateUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { id } = req.user;

    const user = User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User does not exists" });
      return;
    }

    await User.findByIdAndUpdate(id, { token: null });

    res.status(201).json({ messag: "Succes" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const { id } = req.user;
    const user = User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User does not exists" });
      return;
    }

    await User.findByIdAndUpdate(id, {
      picturePath: cloudConfig.imagePathDefault,
    });

    const updateUser = await User.find({}).select("-password -token -__v");
    res.status(201).json(updateUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

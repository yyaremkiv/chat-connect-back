import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// export const register = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       picturePath,
//       friends,
//       location,
//       occupation,
//     } = req.body;

//     const salt = await bcrypt.genSalt();
//     const passwordHash = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password: passwordHash,
//       picturePath,
//       friends,
//       location,
//       occupation,
//       viewedProfile: Math.floor(Math.random() * 10000),
//       impressions: Math.floor(Math.random() * 10000),
//     });

//     const savedUser = await newUser.save();
//     res.status(201).json({ message: "Succes" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const login = async (req, res) => {
  try {
    console.logсв;
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user)
      return res.status(404).json({ message: "User does not exists. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Unvalid credentials." });

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

    const user = await User.findById(id);

    if (!user) {
      throw new Error("not found user with this id");
    }

    res.status(200).json({ user });
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

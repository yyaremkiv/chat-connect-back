import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Friend from "../models/Friend.js";
import cloudConfig from "../config/cloudConfig.js";

// import { sendEmailSanGrid } from "../helpers/sendEmail.js";

import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
dotenv.config();

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
    const newUser = new Friend({
      userId: user._id,
    });
    await newUser.save();

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

export const sendEmail = async (req, res) => {
  try {
    const { email } = req.body;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: "y.yaremkiv@gmail.com", // Change to your recipient
      from: "y.yaremkiv@gmail.com", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      html: `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 20px;
          }
          .cta-btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #F15A29;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
          }
          .cta-btn:hover {
            background-color: #D44E22;
          }
        </style>
      </head>
      <body>
        <h1>Sending with SendGrid is Fun</h1>
        <p>Dear [Recipient],</p>
        <p>I hope this email finds you well. I wanted to share with you my recent experience using SendGrid to send emails. It's been an absolute pleasure and I wanted to take a moment to tell you why.</p>
        <p>Firstly, it's incredibly easy to use. The SendGrid API is well-documented and intuitive, so getting started was a breeze. And once I got going, I found that sending emails with SendGrid is incredibly fast and reliable.</p>
        <p>But what really sets SendGrid apart is its powerful features. With SendGrid, you can customize your emails with HTML and CSS, track email opens and clicks, and even set up automated email campaigns. And it all integrates seamlessly with Node.js.</p>
        <p>So if you're looking for a powerful and user-friendly email service, I highly recommend checking out SendGrid. And if you have any questions about getting started, feel free to reply to this email and I'll do my best to help.</p>
        <a href="https://sendgrid.com/" class="cta-btn">Learn More about SendGrid</a>
        <p>Thanks for your time,</p>
        <p>[Your Name]</p>
      </body>
    </html>
  `,
    };

    await sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        throw new Error(error);
      });

    res.status(200).json({ message: "Succes" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

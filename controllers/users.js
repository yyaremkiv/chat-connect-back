import User from "../models/User.js";
import Friend from "../models/Friend.js";
import cloudConfig from "../config/cloudConfig.js";
import { addFileCloud, deleteFileCloud } from "../services/cloud/cloud.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).json(users);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "No found user" });

    const friends = await Friend.findOne({ userId: id }).populate(
      "friends.friendId",
      "_id, firstName lastName location occupation picturePath"
    );
    res.status(200).json(friends);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const friend = await Friend.findOne({ userId: id });

    if (!friend) return res.status(404).json({ message: "No found user" });

    const friendIndex = friend.friends.findIndex(
      (friend) => friend.friendId == friendId
    );

    if (friendIndex === -1) {
      friend.friends.push({ friendId });
      await friend.save();
    } else {
      friend.friends.splice(friendIndex, 1);
      await friend.save();
    }

    const updateFriendsList = await Friend.findOne({ userId: id }).populate(
      "friends.friendId",
      "_id, firstName lastName location occupation picturePath"
    );
    res.status(200).json(updateFriendsList);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const changeUserAvatar = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User does not exists" });
      return;
    }

    if (req.file) {
      console.log("user id this");
      if (user.picturePath === cloudConfig.publicImagePathDefault) {
        const publicUrl = await addFileCloud(req.file);
        await User.findByIdAndUpdate(id, { picturePath: publicUrl });
      } else {
        await deleteFileCloud(user.picturePath);
        const publicUrl = await addFileCloud(req.file);
        await User.findByIdAndUpdate(id, { picturePath: publicUrl });
      }
    } else {
      console.log("user id this");
      await User.findByIdAndUpdate(id, {
        picturePath: cloudConfig.publicImagePathDefault,
      });
    }

    const updateUser = await User.findById(id).select("-password -token -__v");

    res.status(201).json(updateUser);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

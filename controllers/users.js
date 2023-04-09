import User from "../models/User.js";
import Friend from "../models/Friend.js";
import cloudConfig from "../config/cloudConfig.js";
import { getUser, getUsers } from "../services/mongoose/userServices.js";
import { addFileCloud, deleteFileCloud } from "../services/cloud/cloud.js";

import UserService from "../services/user-service.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getUser(userId);

    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, sort = "desc" } = req.query;

    const skip = parseInt((page - 1) * limit);
    limit = parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

    const { users, totalCounts } = await getUsers({ skip, limit, sort });

    res.status(200).json({ users, totalCounts });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "No found user" });

    const friends = await Friend.findOne({ userId }).populate(
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
    const { userId, friendId } = req.params;
    const friend = await Friend.findOne({ userId });

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

    const updateFriendsList = await Friend.findOne({ userId }).populate(
      "friends.friendId",
      "_id, firstName lastName location occupation picturePath"
    );
    res.status(200).json(updateFriendsList);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

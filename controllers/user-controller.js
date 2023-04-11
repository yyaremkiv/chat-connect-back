import User from "../models/user-model.js";
import Friend from "../models/friend-model.js";
import UserService from "../services/user-service.js";

class UserController {
  static async updateDataUser(req, res) {
    try {
      const { _id: userId } = req.user;

      const updateUser = await UserService.updateUser({
        userId,
        body: req.body,
      });

      return res.status(201).json(updateUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async updateAvatarUser(req, res) {
    try {
      const { _id: userId } = req.user;

      if (req.file) {
        const updateUser = await UserService.changeAvatar({
          userId,
          file: req.file,
        });
        res.status(200).json(updateUser);
      } else {
        const updateUser = await UserService.deleteAvatar(userId);
        res.status(200).json(updateUser);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static getUserData = async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await UserService.getUser(userId);

      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };

  static getAllUsers = async (req, res) => {
    try {
      let { page = 1, limit = 10, sort = "desc" } = req.query;

      const skip = parseInt((page - 1) * limit);
      limit =
        parseInt(limit) > 15 || parseInt(limit) < 0 ? 15 : parseInt(limit);

      const { users, totalCounts } = await UserService.getUsers({
        skip,
        limit,
        sort,
      });

      res.status(200).json({ users, totalCounts });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };

  static getUserFriends = async (req, res) => {
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

  static addRemoveFriend = async (req, res) => {
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
}

export default UserController;

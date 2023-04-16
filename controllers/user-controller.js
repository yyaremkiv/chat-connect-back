import UserService from "../services/user-service.js";
import { processPaginationParams } from "../config/pagination.js";

class UserController {
  static getUserData = async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await UserService.getUser(userId);

      res.status(200).json(user);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  };

  static getAllUsers = async (req, res) => {
    try {
      const { skip, limit, sort } = processPaginationParams(req.query);

      const { users, totalCounts } = await UserService.getAllUsers({
        skip,
        limit,
        sort,
      });

      res.status(200).json({ users, totalCounts });
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  };

  static async updateDataUser(req, res) {
    try {
      const { _id: userId } = req.user;

      const updateUser = await UserService.updateUser({
        userId,
        body: req.body,
      });

      return res.status(201).json(updateUser);
    } catch (e) {
      res.status(500).json({ message: e.message });
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
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  static getUserFriends = async (req, res) => {
    try {
      const { _id: authUserId } = req.user;
      const { userId } = req.params;

      const { userFriends, authUserFriends } = await UserService.getUserFriend({
        userId,
        authUserId,
      });

      res.status(200).json({ userFriends, authUserFriends });
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  };

  static addRemoveFriend = async (req, res) => {
    try {
      const { _id: authUserId } = req.user;
      const { userId, friendId } = req.params;

      const { userFriends, authUserFriends } =
        await UserService.addRemoveFriend({ userId, friendId, authUserId });

      res.status(200).json({ userFriends, authUserFriends });
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  };
}

export default UserController;

import UserService from "../services/user-service.js";

class UserController {
  static async updateDataUser(req, res) {
    try {
      const { id: userId } = req.user;

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
      const { id: userId } = req.user;

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
}

export default UserController;

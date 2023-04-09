import User from "../models/User.js";
import cloudConfig from "../config/cloudConfig.js";
import { addFileCloud, deleteFileCloud } from "./cloud/cloud.js";

class UserService {
  static async updateUser({ userId, body }) {
    const updateUser = await User.findByIdAndUpdate(userId, {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      location: body.location,
      occupation: body.occupation,
      twitter: body.twitter,
      linkendin: body.linkendin,
    }).select("-password -token -__v");

    return updateUser;
  }

  static async deleteAvatar(userId) {
    const user = await User.findById(userId);

    if (
      user.picturePath === cloudConfig.publicImagePathDefault ||
      user.picturePath.length === 0
    ) {
      await User.findByIdAndUpdate(userId, {
        picturePath: cloudConfig.publicImagePathDefault,
      });
    } else {
      await deleteFileCloud(user.picturePath);
      await User.findByIdAndUpdate(userId, {
        picturePath: cloudConfig.publicImagePathDefault,
      });
    }

    const updateUser = await User.findById(userId);
    return updateUser;
  }

  static async changeAvatar({ userId, file }) {
    const user = await User.findById(userId);

    if (
      user.picturePath === cloudConfig.publicImagePathDefault ||
      user.picturePath.length === 0
    ) {
      const publicURL = await addFileCloud(file);
      await User.findByIdAndUpdate(userId, { picturePath: publicURL });
    } else {
      await deleteFileCloud(user.picturePath);
      const publicURL = await addFileCloud(file);
      await User.findByIdAndUpdate(userId, { picturePath: publicURL });
    }

    const updateUser = await User.findById(userId);
    return updateUser;
  }
}

export default UserService;

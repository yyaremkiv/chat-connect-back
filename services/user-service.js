import User from "../models/user-model.js";
import cloudConfig from "../config/cloudConfig.js";
import CloudService from "./cloud-service.js";

const USER_PROJECTION = "-password -token -__v";

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
      await CloudService.deleteFileCloud(user.picturePath);
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
      const publicURL = await CloudService.addFileCloud(file);
      await User.findByIdAndUpdate(userId, { picturePath: publicURL });
    } else {
      await CloudService.deleteFileCloud(user.picturePath);
      const publicURL = await CloudService.addFileCloud(file);
      await User.findByIdAndUpdate(userId, { picturePath: publicURL });
    }

    const updateUser = await User.findById(userId);
    return updateUser;
  }

  static getUser = async (userId) => {
    const user = await User.findById(userId).select(USER_PROJECTION);

    return user;
  };

  static getUsers = async ({ skip, limit, sort }) => {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "author",
          as: "posts",
        },
      },
      {
        $lookup: {
          from: "friends",
          localField: "_id",
          foreignField: "userId",
          as: "friends",
        },
      },
      {
        $addFields: {
          friends: {
            $reduce: {
              input: "$friends",
              initialValue: 0,
              in: { $sum: ["$$value", { $size: "$$this.friends" }] },
            },
          },
          posts: { $size: "$posts" },
        },
      },
      { $sort: { createdAt: sort === "desc" ? -1 : 1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { password: 0, token: 0, __v: 0 } },
    ]);

    const totalCounts = await User.countDocuments();

    return { users, totalCounts };
  };
}

export default UserService;

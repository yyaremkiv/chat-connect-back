import User from "../models/user-model.js";
import Friend from "../models/friend-model.js";
import cloudConfig from "../config/cloudConfig.js";
import CloudService from "./cloud-service.js";

const USER_PROJECTION = "-password -token -__v";

const friendQuery = {
  path: "friends.friendId",
  select: "_id, firstName lastName location occupation picturePath",
};

class UserService {
  static getUser = async (userId) => {
    const user = await User.findById(userId).select(USER_PROJECTION);

    return user;
  };

  static getAllUsers = async ({ skip, limit, sort }) => {
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

  static getUserFriend = async ({ userId, authUserId }) => {
    const user = await User.findById(userId);

    const [userFriends, authUserFriends] = await Promise.all([
      Friend.findOne({ userId }).populate(friendQuery),
      Friend.findOne({ userId: authUserId }).populate(friendQuery),
    ]);

    return { userFriends, authUserFriends };
  };

  static addRemoveFriend = async ({ userId, friendId, authUserId }) => {
    const friend = await Friend.findOne({ userId });

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

    const [userFriends, authUserFriends] = await Promise.all([
      Friend.findOne({ userId }).populate(friendQuery),
      Friend.findOne({ userId: authUserId }).populate(friendQuery),
    ]);

    return { userFriends, authUserFriends };
  };
}

export default UserService;

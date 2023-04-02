import User from "../../models/User.js";

const USER_PROJECTION = "-password -token -__v";

export const getUser = async (userId) => {
  const user = await User.findById(userId).select(USER_PROJECTION);

  return user;
};

export const getUsers = async ({ skip, limit, sort }) => {
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
    {
      $sort: { createdAt: sort === "desc" ? -1 : 1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  const totalCounts = await User.countDocuments();

  return { users, totalCounts };
};

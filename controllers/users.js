import User from "../models/User.js";
import Friend from "../models/Friend.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friend = await Friend.findById(id);
    console.log("friend", friend);

    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    // const friends = await Promise.all(
    //   user.friends.map((id) => User.findById(id))
    // );

    // const formattedFriends = friends.map(
    //   ({ _id, firstName, lastName, occupation, location, picturePath }) => {
    //     return { _id, firstName, lastName, occupation, location, picturePath };
    //   }
    // );

    const friends = await Friend.findOne({ userId: id }).populate(
      "friends.friendId"
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

    if (friend) {
      const existingFriendIndex = friend.friends.findIndex((friendObj) =>
        friendObj.friendId.equals(friendId)
      );

      if (existingFriendIndex !== -1) {
        friend.friends.splice(existingFriendIndex, 1);
      }

      friend.friends.push({ friendId: friendId });
      await friend.save();
    }

    // user[0].friends.push({ friendId });
    // console.log("friend id user", user);

    // await user.save();
    // data.friends.push({ friendID: friendId });
    // await data.save();

    // const user = await User.findById(id);
    // const friend = await User.findById(friendId);

    // if (user.friends.includes(friendId)) {
    //   user.friends = user.friends.filter((id) => id !== friendId);
    //   friend.friends = friend.friends.filter((id) => id !== id);
    // } else {
    //   user.friends.push(friendId);
    // }
    // await user.save();
    // await friend.save();

    // const friends = await Promise.all(
    //   user.friends.map((id) => User.findById(id))
    // );
    // const formattedFriends = friends.map(
    //   ({ _id, firstName, lastName, occupation, location, picturePath }) => {
    //     return { _id, firstName, lastName, occupation, location, picturePath };
    //   }
    // );
    const friends = await Friend.findOne({ userId: id }).populate(
      "friends.friendId"
    );

    res.status(200).json(friends);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

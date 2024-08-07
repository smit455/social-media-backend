const { CustomError } = require("../middlewares/error");
const User = require("../models/User");
const Post = require("../models/post");
const Comment = require("../models/comment");

const getUserController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new CustomError("No user found", 404));
    }
    const { password, ...data } = user;
    res.status(200).json(data._doc);
  } catch (error) {
    next(error);
  }
};

const updateUserController = async (req, res, next) => {
  const { userId } = req.params;
  const updateData = req.body;
  try {
    const updateUser = await User.findById(userId);
    if (!updateUser) {
      throw new CustomError("User Not Found.", 404);
    }

    Object.assign(updateUser, updateData);
    await updateUser.save();
    res
      .status(200)
      .json({ message: "User Updated Successfully", user: updateUser });
  } catch (error) {
    next(error);
  }
};

const followUserController = async (req, res, next) => {
  const { userId: followerUserId } = req.body; // ID of the user who wants to follow
  const { userId: targetUserId } = req.params; // ID of the user to be followed

  try {
    if (followerUserId === targetUserId) {
      throw new CustomError("You cannot follow yourself.", 400);
    }

    const followerUser = await User.findById(followerUserId); // User who wants to follow
    const targetUser = await User.findById(targetUserId); // User to be followed

    if (!followerUser || !targetUser) {
      throw new CustomError("User not found.", 404);
    }

    if (followerUser.following.includes(targetUserId)) {
      throw new CustomError("You are already following this user.", 400);
    }

    followerUser.following.push(targetUserId); // Add the target user to the follower's following list
    targetUser.followers.push(followerUserId); // Add the follower to the target user's followers list

    await followerUser.save();
    await targetUser.save();

    res.status(200).json({ message: "You successfully followed the user!" });
  } catch (error) {
    next(error);
  }
};

const unfollowUserController = async (req, res, next) => {
  const { userId: unfollowerUserId } = req.body; // ID of the user who wants to unfollow
  const { userId: targetUserId } = req.params; // ID of the user to be unfollowed

  try {
    if (unfollowerUserId === targetUserId) {
      throw new CustomError("You cannot unfollow yourself.", 400);
    }

    const unfollowerUser = await User.findById(unfollowerUserId); // User who wants to unfollow
    const targetUser = await User.findById(targetUserId); // User to be unfollowed

    if (!unfollowerUser || !targetUser) {
      throw new CustomError("User not found.", 404);
    }

    if (!unfollowerUser.following.includes(targetUserId)) {
      throw new CustomError("You are not following this user.", 400);
    }

    // Remove the target user from the unfollower's following list
    unfollowerUser.following = unfollowerUser.following.filter(
      (id) => id.toString() !== targetUserId
    );

    // Remove the unfollower from the target user's followers list
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== unfollowerUserId
    );

    await unfollowerUser.save();
    await targetUser.save();

    res.status(200).json({ message: "You successfully unfollowed the user!" });
  } catch (error) {
    next(error);
  }
};

const blockUserController = async (req, res, next) => {
  const { userId: targetUserId } = req.params; // ID of the user to be blocked
  const { userId: loggedInUserId } = req.body; // Logged-in user's ID

  try {
    if (targetUserId === loggedInUserId) {
      throw new CustomError("You cannot block yourself", 400);
    }

    const targetUser = await User.findById(targetUserId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!targetUser || !loggedInUser) {
      throw new CustomError("User not found.", 404);
    }

    if (loggedInUser.blockeduser.includes(targetUserId)) {
      throw new CustomError("This user is already blocked!", 400);
    }

    loggedInUser.blockeduser.push(targetUserId);
    loggedInUser.following = loggedInUser.following.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== loggedInUserId
    );

    await loggedInUser.save();
    await targetUser.save();
    res.status(200).json({ message: "You successfully blocked the user!" });
  } catch (error) {
    next(error);
  }
};

const unblockUserController = async (req, res, next) => {
  const { userId: targetUserId } = req.params; // ID of the user to be unblocked
  const { userId: loggedInUserId } = req.body; // Logged-in user's ID

  try {
    if (targetUserId === loggedInUserId) {
      throw new CustomError("You cannot unblock yourself", 400);
    }

    const targetUser = await User.findById(targetUserId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!targetUser || !loggedInUser) {
      throw new CustomError("User not found.", 404);
    }

    if (!loggedInUser.blockeduser.includes(targetUserId)) {
      throw new CustomError("Not blocking this user!", 400);
    }

    loggedInUser.blockeduser = loggedInUser.blockeduser.filter(
      (id) => id.toString() !== targetUserId
    );

    await loggedInUser.save();
    res.status(200).json({ message: "You successfully unblocked the user!" });
  } catch (error) {
    next(error);
  }
};

const getBlockedUserController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate(
      "blockeduser",
      "username fullname"
    );
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const { blockeduser, ...data } = user;
    res.status(200).json(blockeduser);
  } catch (error) {
    next(error);
  }
};

const deleteUserController = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const usertodelete = await User.findById(userId);
    if (!usertodelete) {
      throw new CustomError("User not found", 404);
    }

    await Post.deleteMany({ user: userId });
    await Post.deleteMany({ "comments.user": userId });
    await Post.deleteMany({ "comments.commentreplie.user": userId });
    await Comment.deleteMany({ user: userId });
    await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });
    await User.updateMany(
      { _id: { $in: usertodelete.following } },
      { $pull: { followers: userId } }
    );
    await Comment.updateMany({}, { $pull: { likes: userId } });
    await Comment.updateMany(
      { "commentreplie.likes": userId },
      { $pull: { "commentreplie.likes": userId } }
    );
    await Post.updateMany({}, { $pull: { likes: userId } });

    const replyComments = await Comment.find({ "commentreplie.user": userId });

    await Promise.all(
      replyComments.map(async (comment) => {
        comment.commentreplie = comment.commentreplie.filter(
          (reply) => reply.user.toString() != userId
        );
        await Comment.save();
      })
    );

    await usertodelete.deleteOne();
    res.status(200).json({ message: "successfully delete user!!" });
  } catch (error) {
    next(error);
  }
};

const searchUserController = async (req, res, next) => {
  const { query } = req.params;
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: new RegExp(query, "i") } },
        { fullname: { $regex: new RegExp(query, "i") } },
      ],
    });

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const generateFileurl = (filename) => {
  return process.env.URL + `/uploads/${filename}`;
};

const uploadProfilePhotoController = async (req, res, next) => {
  const { userId } = req.params;
  const { filename } = req.file;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: generateFileurl(filename) },
      { new: true }
    );
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    res
      .status(200)
      .json({ message: "Profile photo updated successfully", user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserController,
  updateUserController,
  followUserController,
  unfollowUserController,
  blockUserController,
  unblockUserController,
  getBlockedUserController,
  deleteUserController,
  searchUserController,
  uploadProfilePhotoController,
};

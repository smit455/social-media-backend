const Comment = require("../models/comment");
const User = require("../models/User");
const Post = require("../models/post");
const { CustomError } = require("../middlewares/error");

const commentController = async (req, res, next) => {
  const { postId, userId, text } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post Not found!!!", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }
    const comment = new Comment({
      user: userId,
      post: postId,
      text,
    });
    await comment.save();
    post.comments.push(comment._id);
    await post.save();
    res.status(200).json({ message: "Comment added successfully!!", comment });
  } catch (error) {
    next(error);
  }
};

const replyCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { userId, replyText } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment Not Found!!!", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }
    const reply = {
      user: userId,
      text: replyText,
    };
    comment.commentreplie.push(reply);
    await comment.save();
    res.status(200).json({ message: "Reply added successfully!!", reply });
  } catch (error) {
    next(error);
  }
};

const updateCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment Not Found!!!", 404);
    }
    const updateComment = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Comment Updated Successfully!!", updateComment });
  } catch (error) {
    next(error);
  }
};

const updatereplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const { text, userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment Not Found!!!", 404);
    }

    const replyIdx = comment.commentreplie.findIndex(
      (reply) => reply._id.toString() === replyId
    );
    if (replyIdx === -1) {
      throw new CustomError("Reply Not Found!!!", 404);
    }

    if (comment.commentreplie[replyIdx].user.toString() !== userId) {
      throw new CustomError("You should only update your comment", 404);
    }

    comment.commentreplie[replyIdx].text = text;

    await comment.save();
    res.status(200).json({ message: "Reply Updated Successfully!!", comment });
  } catch (error) {
    next(error);
  }
};

const populateUserDetails = async (comments) => {
  for (const comment of comments) {
    await comment.populate("user", "username fullname profilePhoto");
    if (comment.commentreplie.length > 0) {
      await comment.populate(
        "commentreplie.user",
        "username fullname profilePhoto"
      );
    }
  }
};
const getpostCommentController = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post Not found!!!", 404);
    }

    let comments = await Comment.find({ post: postId });
    await populateUserDetails(comments);
    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
};

const deleteCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment Not Found!!!", 404);
    }
    const user = await User.findById(comment.user);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }
    if (comment.user.toString() !== user._id.toString()) {
      throw new CustomError("You should only delete your comment", 404);
    }

    await Post.findOneAndUpdate(
      { comments: commentId },
      { $pull: { comments: commentId } },
      { new: true }
    );
    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully!!" });
  } catch (error) {
    next(error);
  }
};

const deleteReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment Not Found!!!", 404);
    }
    comment.commentreplie = comment.commentreplie.filter((id) => {
      id.toString() !== replyId;
    });
    await comment.save();
    res.status(200).json({ message: "Reply Comment deleted successfully!!" });
  } catch (error) {
    next(error);
  }
};

const likeCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment Not Found!!!", 404);
    }
    if (comment.likes.includes(userId)) {
      throw new CustomError("You have already liked this comment", 404);
    }
    comment.likes.push(userId);
    await comment.save();
    res.status(200).json({ message: "Comment liked successfully!!" });
  } catch (error) {
    next(error);
  }
};

const unlikeCommentController = async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment Not Found!!!", 404);
    }
    if (!comment.likes.includes(userId)) {
      throw new CustomError("You have not yet liked this comment", 404);
    }
    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    await comment.save();
    res.status(200).json({ message: "Comment unliked successfully!!" });
  } catch (error) {
    next(error);
  }
};

const likeReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment Not Found!!!", 404);
    }
    const replyComment = comment.commentreplie.id(replyId);
    if (!replyComment) {
      throw new CustomError("Reply comment not found!!", 404);
    }
    if (replyComment.likes.includes(userId)) {
      throw new CustomError("You already liked this comment", 400);
    }
    replyComment.likes.push(userId);
    await comment.save();
    res.status(200).json({ message: "Reply comment liked successfully!!" });
  } catch (error) {
    next(error);
  }
};

const unlikeReplyCommentController = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new CustomError("Comment Not Found!!!", 404);
    }
    const replyComment = comment.commentreplie.id(replyId);
    if (!replyComment) {
      throw new CustomError("Reply comment not found!!", 404);
    }
    if (!replyComment.likes.includes(userId)) {
      throw new CustomError("You have not yet liked this comment", 400);
    }
    replyComment.likes = replyComment.likes.filter(
      (id) => id.toString() !== userId
    );
    await comment.save();
    res.status(200).json({ message: "Reply comment unliked successfully!!" });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  commentController,
  replyCommentController,
  updateCommentController,
  updatereplyCommentController,
  getpostCommentController,
  deleteCommentController,
  deleteReplyCommentController,
  likeCommentController,
  unlikeCommentController,
  likeReplyCommentController,
  unlikeReplyCommentController,
};

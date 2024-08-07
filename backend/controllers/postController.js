const { CustomError } = require("../middlewares/error");
const User = require("../models/User");
const Post = require("../models/post");

const createPostController = async (req, res, next) => {
  const { userId, caption } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }
    const newpost = new Post({
      user: userId,
      caption,
    });
    await newpost.save();
    user.posts.push(newpost._id);
    await user.save();
    res
      .status(201)
      .json({ message: "Post created successfully!!", post: newpost });
  } catch (error) {
    next(error);
  }
};

const generateFileurl = (filename) => {
  return process.env.URL + `/uploads/${filename}`;
};

const createPostWithImageController = async (req, res, next) => {
  const { userId } = req.params;
  const { caption } = req.body;
  const files = req.files;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }
    const imageUrl = files.map((file) => generateFileurl(file.filename));
    const newpost = new Post({
      user: userId,
      caption,
      image: imageUrl,
    });

    await newpost.save();
    user.posts.push(newpost._id);
    await user.save();
    res
      .status(201)
      .json({ message: "Post created successfully!!", post: newpost });
  } catch (error) {
    next(error);
  }
};

const updatePostController = async (req, res, next) => {
  const { postId } = req.params;
  const { caption } = req.body;

  try {
    const findpost = await Post.findById(postId);
    if (!findpost) {
      throw new CustomError("Post Not Found!!", 404);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { caption },
      { new: true }
    );
    await updatedPost.save();
    res
      .status(200)
      .json({ message: "Post updated Successfully!!", post: updatedPost });
  } catch (error) {
    next(error);
  }
};

const getPostController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }
    const bolckIds = user.blockeduser.map((id) => id.toString()); //loggedin user can not see blockeduser's post

    const allposts = await Post.find({ user: { $nin: bolckIds } }).populate(
      "user",
      "username fullname profilePhoto"
    );
    res.status(200).json({ posts: allposts });
  } catch (error) {
    next(error);
  }
};

const getUserPostController = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }

    const userposts = await Post.find({ user: userId });
    res.status(200).json({ posts: userposts });
  } catch (error) {
    next(error);
  }
};

const deletePostController = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post Not found!!!", 404);
    }
    const user = await User.findById(post.user);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }
    user.posts = user.posts.filter(
      (id) => id.toString() !== post._id.toString()
    );
    await user.save();
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully!!" });
  } catch (error) {
    next(error);
  }
};

const likePostController = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post Not found!!!", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }

    if (post.likes.includes(userId)) {
      throw new CustomError("You have already liked this post", 404);
    }
    post.likes.push(userId);
    await post.save();
    res.status(200).json({ message: "Post liked successfully!!", post });
  } catch (error) {
    next(error);
  }
};

const unlikePostController = async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new CustomError("Post Not found!!!", 404);
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User Not Found!!", 404);
    }
    if (!post.likes.includes(userId)) {
      throw new CustomError("You have not yet liked this post", 404);
    }
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    await post.save();
    res.status(200).json({ message: "Post unliked successfully!!", post });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPostController,
  createPostWithImageController,
  updatePostController,
  getPostController,
  getUserPostController,
  deletePostController,
  likePostController,
  unlikePostController,
};

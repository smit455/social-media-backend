const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error");

const registerController = async (req, res, next) => {
  try {
    const { password, username, email } = req.body;
    const ifexist = await User.findOne({ $or: [{ username }, { email }] });
    if (ifexist) {
      throw new CustomError(
        "This Email or Username is already taken by someone else.",
        400
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ ...req.body, password: hashPassword });
    const saveUser = await newUser.save();
    res.status(201).json(saveUser);
  } catch (error) {
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    let user;
    if (req.body.email) {
      user = await User.findOne({ email: req.body.email });
    } else {
      user = await User.findOne({ username: req.body.username });
    }

    if (!user) {
      throw new CustomError("User not found.", 404);
    }

    const matchpassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!matchpassword) {
      throw new CustomError("Invalid username or password.", 401);
    }

    const { password, ...data } = user._doc;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.cookie("token", token).status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const logoutController = (req, res, next) => {
  try {
    res
      .clearCookie("token", { sameSite: "none", secure: true })
      .status(200)
      .json("Logout successfully.");
  } catch (error) {
    next(error);
  }
};

const refetchController = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new CustomError("No token provided.", 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, data) => {
      if (err) {
        return next(new CustomError("Invalid token.", 401));
      }
      try {
        const user = await User.findById(data._id);
        if (!user) {
          throw new CustomError("User not found.", 404);
        }
        res.status(200).json(user);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  refetchController,
};

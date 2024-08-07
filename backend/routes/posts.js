const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const {
  createPostController,
  createPostWithImageController,
  updatePostController,
  getPostController,
  getUserPostController,
  deletePostController,
  likePostController,
  unlikePostController,
} = require("../controllers/postController");

router.post("/create", createPostController);
router.post(
  "/create/:userId",
  upload.array("images", 5),
  createPostWithImageController
); //maximum 5 picture are uploaded
router.put("/update/:postId", updatePostController);
router.get("/all/:userId", getPostController);
router.get("/user/:userId", getUserPostController);
router.delete("/delete/:postId", deletePostController);
router.post("/like/:postId", likePostController);
router.post("/unlike/:postId", unlikePostController);

module.exports = router;

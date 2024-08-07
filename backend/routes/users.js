const express = require("express");
const {
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
} = require("../controllers/userController");
const upload = require("../middlewares/upload");
const router = express.Router();

router.get("/:userId", getUserController);
router.put("/update/:userId", updateUserController);
router.post("/follow/:userId", followUserController);
router.post("/unfollow/:userId", unfollowUserController);
router.post("/block/:userId", blockUserController);
router.post("/unblock/:userId", unblockUserController);
router.get("/blocked/:userId", getBlockedUserController);
router.delete("/delete/:userId", deleteUserController);
router.get("/search/:query", searchUserController);
router.put(
  "/update-profile-photo/:userId",
  upload.single("profilePhoto"),
  uploadProfilePhotoController
);
module.exports = router;

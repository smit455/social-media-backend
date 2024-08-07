const express = require("express");
const {
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
} = require("../controllers/commentController");
const router = express.Router();

router.post("/create", commentController);
router.post("/create/reply/:commentId", replyCommentController);
router.put("/update/:commentId", updateCommentController);
router.put("/update/:commentId/reply/:replyId", updatereplyCommentController);
router.get("/post/:postId", getpostCommentController);
router.delete("/delete/:commentId", deleteCommentController);
router.delete(
  "/delete/:commentId/reply/:replyId",
  deleteReplyCommentController
);
router.post("/like/:commentId", likeCommentController);
router.post("/unlike/:commentId", unlikeCommentController);
router.post("/:commentId/replies/like/:replyId", likeReplyCommentController);
router.post(
  "/:commentId/replies/unlike/:replyId",
  unlikeReplyCommentController
);
module.exports = router;

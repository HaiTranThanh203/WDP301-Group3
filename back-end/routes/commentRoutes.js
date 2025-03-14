const express = require("express");
const { protect } = require("../controllers/authController");
const commentController= require("../controllers/commentController");
const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(commentController.getAllComments)
  .post(commentController.createNewComment);
router
  .route("/:id")
  .get(commentController.getCommentById)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);
router.route("/get-by-post/:id").get(commentController.getCommentByPostId);
router.patch("/:id/vote", commentController.voteComment);
router.post("/reply", commentController.replyComment);
module.exports = router;

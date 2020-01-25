const express = require("express");
const path = require("path");
const { createReview, getReviews, updateReview } = require(path.join(
  __dirname,
  "/../controllers/reviews"
));
const { protect } = require("./../controllers/authController");

const router = express.Router({ mergeParams: true });
router.use(protect);
router
  .route("/")
  .get(getReviews)
  .post(createReview)
  .patch(updateReview);

module.exports = router;

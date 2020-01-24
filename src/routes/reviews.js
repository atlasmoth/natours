const express = require("express");
const path = require("path");
const { createReview, getReviews } = require(path.join(
  __dirname,
  "/../controllers/reviews"
));
const { protect } = require("./../controllers/authController");

const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(protect, getReviews)
  .post(protect, createReview);

module.exports = router;

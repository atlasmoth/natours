const path = require("path");
const errorResponse = require(path.join(__dirname, "/../utils/errorResponse"));
const catchAsync = require(path.join(__dirname, "/../utils/catchAsync"));
const Review = require(path.join(__dirname, "/../models/Review"));

exports.createReview = catchAsync(async (req, res, next) => {
  const { review, rating } = req.body;

  if (!review || !rating) {
    return next(new errorResponse(400, "Please include review and rating"));
  }
  const reviewObj = await Review.create({
    user: req.user._id,
    review,
    rating,
    tour: req.params.id
  });
  res.send({
    success: true,
    data: reviewObj
  });
});
exports.getReviews = catchAsync(async (req, res, next) => {
  const reviewObjs = await Review.findOne({ tour: req.params.id });
  res.send({
    success: true,
    length: reviewObjs.length,
    data: reviewObjs
  });
});

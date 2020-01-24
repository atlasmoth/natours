const express = require("express");
const path = require("path");
const { createTour, getTours, getStats, getBusy } = require(path.join(
  __dirname,
  "/../controllers/tours"
));
const { protect, restrict } = require("./../controllers/authController");
const reviewRouter = require(path.join(__dirname, "/reviews"));

const router = express.Router();
router.use("/reviews", reviewRouter);
router.route("/busy-month/:year").get(getBusy);
router.route("/tour-stats").get(getStats);
router
  .route("/")
  .get(protect, getTours)
  .post(createTour);
router.use("/:id/reviews", reviewRouter);
router
  .route("/:id")
  .get()
  .patch()
  .delete();

module.exports = router;

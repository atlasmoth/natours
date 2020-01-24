const express = require("express");
const path = require("path");
const {
  createTour,
  getTours,
  getStats,
  getBusy,
  deleteTour,
  updateTour
} = require(path.join(__dirname, "/../controllers/tours"));
const { protect, restrict } = require("./../controllers/authController");
const reviewRouter = require(path.join(__dirname, "/reviews"));

const router = express.Router();

router
  .route("/")
  .get(getTours)
  .post(protect, restrict("admin", "lead-guide"), createTour);

router.use("/reviews", reviewRouter);
router.use("/:id/reviews", reviewRouter);

// protect routes using middleware
router.use(protect);
router.use(restrict("admin", "lead-guide"));

router.route("/busy-month/:year").get(getBusy);
router.route("/tour-stats").get(getStats);

router
  .route("/:id")
  .get()
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;

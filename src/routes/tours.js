const express = require("express");
const path = require("path");
const { createTour, getTours, getStats, getBusy } = require(path.join(
  __dirname,
  "/../controllers/tours"
));
const { protect, restrict } = require("./../controllers/authController");
const router = express.Router();
router.route("/busy-month/:year").get(getBusy);
router.route("/tour-stats").get(getStats);
router
  .route("/")
  .get(protect, getTours)
  .post(createTour);

router
  .route("/:id")
  .get()
  .patch()
  .delete();

module.exports = router;

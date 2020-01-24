const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: [true, "Review cannot be empty"],
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Review must have rating"]
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"]
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: "user",
    model: "User",
    select: "name photo"
  });
  next();
});
reviewSchema.index(
  {
    tour: 1,
    user: 1
  },
  { unique: true }
);
module.exports = mongoose.model("Review", reviewSchema);

const mongoose = require("mongoose");
const Tour = require("./Tour");

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
reviewSchema.statics.calcAvg = function(tour) {
  return this.aggregate([
    {
      $match: {
        tour
      }
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);
};
reviewSchema.post("save", async function(next) {
  const [{ avgRating, nRating }] = await this.constructor.calcAvg(
    mongoose.Types.ObjectId(this.tour)
  );
  await Tour.findByIdAndUpdate(this.tour, {
    averageRating: avgRating,
    ratingsQuantity: nRating
  });
  next();
});
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  const [{ avgRating, nRating }] = await this.r.constructor.calcAvg(
    mongoose.Types.ObjectId(this.r.tour)
  );
  await Tour.findByIdAndUpdate(this.r.tour, {
    averageRating: avgRating,
    ratingsQuantity: nRating
  });
});
module.exports = mongoose.model("Review", reviewSchema);

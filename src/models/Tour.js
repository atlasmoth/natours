const mongoose = require("mongoose");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tours must have a name"],
      unique: true
    },
    duration: {
      type: Number,
      required: [true, "Tours must have a duration"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have a maximum number of participants"]
    },
    difficulty: {
      type: String,
      default: "easy",
      enum: ["easy", "medium", "difficult"]
    },
    price: {
      type: Number,
      required: [true, "Tours must have a price"]
    },
    rating: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    ratingsAverage: {
      type: Number,
      default: 0
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Tours must have a description"]
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"]
    },
    images: [{ type: String }],
    startDates: [{ type: Date }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model("Tour", tourSchema);

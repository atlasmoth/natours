const mongoose = require("mongoose");
const slugify = require("slugify");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tours must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "Tour name cannot exceed 40 characters"]
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
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty must be easy, medium or difficult"
      }
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
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: "Discount should be below regular price"
      }
    },
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
    startDates: [{ type: Date }],
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordiantes: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordiantes: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    slug: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourSchema.virtual("durationWeeks").get(function() {
  return this.duration / 7;
});
tourSchema.pre("save", function(next) {
  // only works on save and create
  this.slug = slugify(this.name, { lower: true });
  next();
});
// query middleware
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: "guides",
    model: "User"
  });
  next();
});
module.exports = mongoose.model("Tour", tourSchema);

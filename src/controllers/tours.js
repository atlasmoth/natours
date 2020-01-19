const path = require("path");
const Tour = require(path.join(__dirname, "/../models/Tour"));
const catchAsync = require("./../utils/catchAsync");
const apiFeatures = require("./../utils/apiFeatures");

exports.getTours = catchAsync(async (req, res, next) => {
  const api = new apiFeatures(Tour, req.query);
  const tours = await api
    .filter()
    .sort(api.sort)
    .select(api.fields)
    .limit(api.limit)
    .skip(api.page);
  res.send({
    sucess: true,
    length: tours.length,
    tours
  });
});
exports.createTour = catchAsync(async (req, res, next) => {
  res.send("Ikebe wins!");
  const tour = await Tour.create(req.body);
  res.send({
    success: true,
    data: tour
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  res.send({
    success: true,
    data: tour
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );
  res.send({
    success: true,
    data: tour
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gt: 1 } }
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" }
      }
    },
    {
      $sort: {
        avgPrice: -1
      }
    }
  ]);
  res.send({
    success: true,
    data: stats
  });
});

exports.getBusy = catchAsync(async (req, res, next) => {
  //
  const year = req.params.year * 1;

  const stats = await Tour.aggregate([
    {
      $unwind: "$startDates"
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 }
      }
    },
    {
      $sort: {
        numTours: -1
      }
    }
  ]);
  res.send({
    success: true,
    data: stats
  });
});

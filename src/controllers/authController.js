const path = require("path");
const errorResponse = require("./../utils/errorResponse");
const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/User");
const jwt = require("jsonwebtoken");

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });

  res.status(201).send({
    success: true,
    user,
    token
  });
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email })
    .select("+password")
    .exec();

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new errorResponse(400, "User doesn't exist"));
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });

  res.status(201).send({
    success: true,
    user,
    token
  });
});

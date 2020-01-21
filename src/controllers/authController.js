const path = require("path");
const errorResponse = require(path.join(__dirname, "/../utils/errorResponse"));
const catchAsync = require(path.join(__dirname, "/../utils/catchAsync"));
const User = require(path.join(__dirname, "/../models/User"));
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

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

  if (!user || !(await user.checkPassword(password))) {
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

exports.protect = catchAsync(async (req, res, next) => {
  // get token
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer")) {
    return next(new errorResponse(401, "User not logged in"));
  }
  const token = authorization.split(" ")[1];
  // validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  if (!decoded) {
    return next(new errorResponse(401, "User not logged in"));
  }
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new errorResponse(401, "User not logged in"));
  }
  req.user = user;
  next();
});

const path = require("path");
const errorResponse = require(path.join(__dirname, "/../utils/errorResponse"));
const catchAsync = require(path.join(__dirname, "/../utils/catchAsync"));
const User = require(path.join(__dirname, "/../models/User"));
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const sendEmail = require(path.join(__dirname, "/../utils/email"));

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

exports.restrict = function(...roles) {
  return catchAsync(async (req, res, next) => {
    const { user } = req;
    return roles.includes(user.role)
      ? next()
      : next(new errorResponse(400, "Not Authorized to perform action"));
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user based on posted email.
  const { email } = req.body;
  if (!email) {
    return next(new errorResponse(400, "Please include email"));
  }
  const user = await User.findOne({ email }).exec();
  if (!user) {
    return next(new errorResponse(400, "No user with this email address"));
  }
  const resetToken = user.tokenGenerator();
  await user.save({ validateBeforeSave: false });
  // send to users' email

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? submit a patch request with your new password and passwordConfirm to ${resetURL}.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token, only valid for 10 minutes`,
      message
    });

    res.send({
      success: true,
      message: "token sent to email"
    });
  } catch (error) {
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(error);
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based off of the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new errorResponse(400, "Invalid Token"));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });

  res.status(201).send({
    success: true,
    token
  });
});

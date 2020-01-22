const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "/config/config.env")
});
const express = require("express");
const morgan = require("morgan");
const errorResponse = require("./src/utils/errorResponse");
const tourRouter = require(path.join(__dirname, "/src/routes/tours"));
const userRouter = require(path.join(__dirname, "/src/routes/users"));
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const app = express();
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour."
});
// Middleware setup
app.use(helmet());
app.use(morgan("dev"));

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
// routes middleware
app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "price",
      "maxGroupSize",
      "difficulty"
    ]
  })
);

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
// Middleware  catch all
app.all("*", (req, res, next) => {
  next(new errorResponse(404, "Wrong route"));
});
app.use((err, req, res, next) => {
  res.status(err.statusCode || 400).send(err.message);
});
// Server and database set up
require("./config/db")
  .then(() => {
    console.log("Connected to Database");
    app.listen(process.env.PORT, () =>
      console.log(`Listening on ${process.env.PORT}`)
    );
  })
  .catch(e => console.log(e.message));

process.on("unhandledRejection", function(error) {
  console.log(error.message);
  process.exit(1);
});

process.on("uncaughtException", function(error) {
  console.log(error.message);
  process.exit(1);
});

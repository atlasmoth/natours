const express = require("express");
const { signUp, login } = require("./../controllers/authController");
const router = express.Router();
router.route("/signup").post(signUp);
router.route("/login").post(login);
router
  .route("/")
  .get()
  .post();

router
  .route("/:id")
  .get()
  .patch()
  .delete();

module.exports = router;

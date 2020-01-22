const express = require("express");
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updateUser,
  deleteMe
} = require("./../controllers/authController");
const router = express.Router();
router.route("/signup").post(signUp);
router.route("/login").post(login);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updateUser", protect, updateUser);
router.delete("deleteMe", protect, deleteMe);
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

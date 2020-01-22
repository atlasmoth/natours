const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User must have a name"],
      unique: true,
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"]
    },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Wrongly formatted email"
      ],
      required: [true, "User must have an email"],
      unique: true
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, "User must confirm password"],
      validate: {
        validator: function(val) {
          return val === this.password;
        },
        message: "Wrong password confirm"
      }
    },
    photo: {
      type: String,
      default: "avatar.png"
    },
    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "admin"],
      default: "user"
    },
    resetToken: String,
    resetTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.pre("save", async function(next) {
  //password hashing
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
});
userSchema.methods.checkPassword = function(newPassword) {
  // password comparison

  return bcrypt.compare(newPassword, this.password);
};
userSchema.methods.tokenGenerator = function() {
  const token = crypto.randomBytes(32).toString("hex");

  this.resetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};
module.exports = mongoose.model("User", userSchema);

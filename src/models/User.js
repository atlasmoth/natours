const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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
    }
  },
  {
    timestamps: true
  }
);
userSchema.pre("save", async function(next) {
  //password hashing
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
});
userSchema.methods.checkPassword = async function(newPassword) {
  // password comparison
  return bcrypt.compare(newPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

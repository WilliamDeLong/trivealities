const mongoose = require("mongoose");

//user schema/model
const newUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      label: "username",
      unique: true,
    },
    email: {
      type: String,
      required: true,
      label: "email",
      unique: true,
    },
    password: {
      required: true,
      type: String,
      min : 8
    },
    profileImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfileImage",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    accountLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountXp: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { collection: "users" }
);

module.exports = mongoose.models.users || mongoose.model("users", newUserSchema);
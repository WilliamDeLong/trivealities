const mongoose = require("mongoose");

const profileImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: "/user-icon.png", // OR "/images/user-icon.png"
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "profileImages" }
);

module.exports = mongoose.model("ProfileImage", profileImageSchema);
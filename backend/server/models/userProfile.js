const mongoose = require("mongoose");

const profileImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      default: "/user-icon.png",
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
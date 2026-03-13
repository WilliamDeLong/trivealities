const mongoose = require("mongoose");

const profileImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: "/user-icon.png",
    },
    imageKey: {
      type: String,
      default: null,
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

module.exports = mongoose.model("profileImage", profileImageSchema);
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
    level: {
      type: Number, default: 1, min: 1
    },
    
    xp:{ 
      type: Number, default: 0, min: 0 
    }, 
    // XP within current level (carry remainder on level-up)
    totalXp: { type: Number, default: 0, min: 0 }, // optional: lifetime XP

  },
  { collection: "profileImages" }
);

module.exports = mongoose.model("ProfileImage", profileImageSchema);
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const newUserModel = require("../models/userModel"); // ✅ IMPORTANT

// GET /user/levels
router.get("/levels", async (req, res) => {
  try {
    const users = await newUserModel.find({})
      .select("username accountLevel accountXp")
      .sort({ accountLevel: -1, accountXp: -1 });

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /user/:id/level
router.get("/:id/level", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await newUserModel.findById(id).select("username accountLevel accountXp");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
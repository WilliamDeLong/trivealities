const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const newUserModel = require("../models/userModel");

const xp_per_level = 100;

// helps prevent floating point leftovers like 49.9999999997
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

router.post("/:id/xp", async (req, res) => {
  try {
    const { id } = req.params;
    const xpToAdd = Number(req.body.xp);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (!Number.isFinite(xpToAdd) || xpToAdd <= 0) {
      return res.status(400).json({ message: "XP must be a positive number" });
    }

    const user = await newUserModel.findById(id).select("accountLevel accountXp");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof user.accountLevel !== "number") user.accountLevel = 0;
    if (typeof user.accountXp !== "number") user.accountXp = 0;

    user.accountXp = round2(user.accountXp + xpToAdd);

    const levelsGained = Math.floor(user.accountXp / xp_per_level);
    user.accountLevel += levelsGained;

    user.accountXp = round2(user.accountXp % xp_per_level);

    await user.save();

    return res.json({
      message: "XP added",
      levelsGained,
      accountLevel: user.accountLevel,
      accountXp: user.accountXp,
      xpNeededForNextLevel: round2(xp_per_level - user.accountXp),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
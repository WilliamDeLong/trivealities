const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userModel");

// Every 100 XP = +1 level
const XP_PER_LEVEL = 100;

/**
 * POST /user/:id/xp
 * Body: { xp: number }
 * - Adds XP
 * - Every 100 XP => +1 level
 * - Keeps remainder XP in accountXp
 */
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

    const user = await User.findById(id).select("accountLevel accountXp");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Defensive defaults (for older docs)
    if (typeof user.accountLevel !== "number") user.accountLevel = 0;
    if (typeof user.accountXp !== "number") user.accountXp = 0;

    user.accountXp += xpToAdd;

    const levelsGained = Math.floor(user.accountXp / XP_PER_LEVEL);
    user.accountLevel += levelsGained;
    user.accountXp = user.accountXp % XP_PER_LEVEL;

    await user.save();

    return res.json({
      message: "XP added",
      levelsGained,
      accountLevel: user.accountLevel,
      accountXp: user.accountXp,
      xpNeededForNextLevel: XP_PER_LEVEL - user.accountXp,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

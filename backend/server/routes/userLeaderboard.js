const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

router.get("/leaderboard", async (req, res) => {
  try {
    const mode = req.query.mode === "multiplayer" ? "multiplayer" : "single";
    const order = req.query.order === "asc" ? "asc" : "desc";

    const levelField = mode === "multiplayer" ? "multiplayerLevel" : "accountLevel";
    const xpField = mode === "multiplayer" ? "multiplayerXp" : "accountXp";

    const users = await User.find({})
      .select(`username profileImage ${levelField} ${xpField}`)
      .populate("profileImage");

    const sortedEntries = users
      .map((user) => ({
        userId: user._id.toString(),
        username: user.username,
        profileImageUrl: user.profileImage?.imageUrl || "/user-icon.png",
        level: user[levelField] || 0,
        xp: user[xpField] || 0,
      }))
      .sort((a, b) => {
        if (order === "desc") {
          if (b.level !== a.level) return b.level - a.level;
          if (b.xp !== a.xp) return b.xp - a.xp;
          return a.username.localeCompare(b.username);
        }

        if (a.level !== b.level) return a.level - b.level;
        if (a.xp !== b.xp) return a.xp - b.xp;
        return a.username.localeCompare(b.username);
      });

    let previousEntry = null;
    let previousRank = 0;

    const leaderboard = sortedEntries.map((entry, index) => {
      let rank;

      if (
        previousEntry &&
        previousEntry.level === entry.level &&
        previousEntry.xp === entry.xp
      ) {
        rank = previousRank;
      } else {
        rank = index + 1;
      }

      previousEntry = entry;
      previousRank = rank;

      return {
        ...entry,
        rank,
      };
    });

    return res.status(200).json({
      mode,
      order,
      leaderboard,
    });
  } catch (error) {
    console.error("LEADERBOARD ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch leaderboard.",
    });
  }
});

module.exports = router;
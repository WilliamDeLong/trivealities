const mongoose = require("mongoose");
const User = require("../models/userModel");

const XP_PER_LEVEL = 100;

const defaultSinglePlayerProgress = () => ({
  easyCompleted: false,
  mediumCompleted: false,
  hardCompleted: false,
});

const round2 = (num) => {
  return Math.round(num * 100) / 100;
};

const addXp = async (req, res) => {
  try {
    const { id } = req.params;
    const { xp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (
      xp === undefined ||
      xp === null ||
      xp === "" ||
      Array.isArray(xp)
    ) {
      return res.status(400).json({
        message: "XP must be a valid number greater than 0",
      });
    }

    const parsedXp = Number(xp);

    if (!Number.isFinite(parsedXp) || parsedXp <= 0) {
      return res.status(400).json({
        message: "XP must be a valid number greater than 0",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let updatedXp = round2((user.accountXp || 0) + parsedXp);
    let updatedLevel = user.accountLevel || 0;
    let levelsGained = 0;

    while (updatedXp >= XP_PER_LEVEL) {
      updatedXp = round2(updatedXp - XP_PER_LEVEL);
      updatedLevel += 1;
      levelsGained += 1;
    }

    user.accountXp = updatedXp;
    user.accountLevel = updatedLevel;

    await user.save();

    return res.status(200).json({
      message: "XP added successfully",
      accountLevel: user.accountLevel,
      accountXp: user.accountXp,
      levelsGained,
      xpNeededForNextLevel: round2(XP_PER_LEVEL - user.accountXp),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while adding XP",
      error: error.message,
    });
  }
};

const resetXpAndLevel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.accountXp = 0;
    user.accountLevel = 0;

    await user.save();

    return res.status(200).json({
      message: "XP and level reset successfully",
      user: {
        ...user.toObject(),
        levelsGained: 0,
        xpNeededForNextLevel: XP_PER_LEVEL,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while resetting XP and level",
      error: error.message,
    });
  }
};

const getUserLevel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      accountLevel: user.accountLevel || 0,
      accountXp: user.accountXp || 0,
      xpNeededForNextLevel: round2(XP_PER_LEVEL - (user.accountXp || 0)),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching user level",
      error: error.message,
    });
  }
};

const addMultiplayerXp = async (req, res) => {
  try {
    const { id } = req.params;
    const { xp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (
      xp === undefined ||
      xp === null ||
      xp === "" ||
      Array.isArray(xp) ||
      typeof xp === "object"
    ) {
      return res.status(400).json({
        message: "XP must be a valid number greater than 0",
      });
    }

    const parsedXp = Number(xp);

    if (!Number.isFinite(parsedXp) || parsedXp <= 0) {
      return res.status(400).json({
        message: "XP must be a valid number greater than 0",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalXp = round2(user.multiplayerXp + parsedXp);
    const levelsGained = Math.floor(totalXp / XP_PER_LEVEL);

    user.multiplayerLevel += levelsGained;
    user.multiplayerXp = round2(totalXp % XP_PER_LEVEL);

    await user.save();

    return res.status(200).json({
      message: "Multiplayer XP added successfully",
      userId: user._id,
      username: user.username,
      multiplayerLevel: user.multiplayerLevel,
      multiplayerXp: user.multiplayerXp,
      xpNeededForNextLevel: round2(XP_PER_LEVEL - user.multiplayerXp),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error adding multiplayer XP",
      error: error.message,
    });
  }
};

const getAllUserLevels = async (req, res) => {
  try {
    const users = await User.find({})
      .select("username email accountLevel accountXp")
      .sort({ accountLevel: -1, accountXp: -1 });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching user levels",
      error: error.message,
    });
  }
};

const getSinglePlayerProgress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("singlePlayerProgress");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.singlePlayerProgress) {
      user.singlePlayerProgress = defaultSinglePlayerProgress();
      await user.save();
    }

    return res.status(200).json({
      singlePlayerProgress: user.singlePlayerProgress,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching single player progress",
      error: error.message,
    });
  }
};
const AdminChangeSinglePlayerProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { easyCompleted, mediumCompleted, hardCompleted } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.singlePlayerProgress = {
      easyCompleted,
      mediumCompleted,
      hardCompleted,
    };

    await user.save();

    return res.json({
      message: "Single-player progress updated",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
const updateSinglePlayerProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { difficulty } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({
        message: "Invalid difficulty",
      });
    }

    const user = await User.findById(id).select("singlePlayerProgress");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.singlePlayerProgress) {
      user.singlePlayerProgress = defaultSinglePlayerProgress();
    }

    if (difficulty === "easy") {
      user.singlePlayerProgress.easyCompleted = true;
    }

    if (difficulty === "medium") {
      user.singlePlayerProgress.mediumCompleted = true;
    }

    if (difficulty === "hard") {
      user.singlePlayerProgress.hardCompleted = true;
    }

    user.markModified("singlePlayerProgress");
    await user.save();

    return res.status(200).json({
      message: "Single player progress updated successfully",
      singlePlayerProgress: user.singlePlayerProgress,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating single player progress",
      error: error.message,
    });
  }
};

module.exports = {
  addXp,
  resetXpAndLevel,
  getUserLevel,
  getAllUserLevels,
  getSinglePlayerProgress,
  updateSinglePlayerProgress,
  addMultiplayerXp,
  AdminChangeSinglePlayerProgress,
};
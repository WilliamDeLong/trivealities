const express = require("express");
const router = express.Router();

const {
  addXp,
  resetXpAndLevel,
  getUserLevel,
  getAllUserLevels,
  getSinglePlayerProgress,
  updateSinglePlayerProgress,
} = require("../controllers/userController");

router.post("/:id/xp", addXp);
router.put("/:id/reset-xp", resetXpAndLevel);
router.get("/:id/level", getUserLevel);
router.get("/levels", getAllUserLevels);
router.get("/:id/singleplayer-progress", getSinglePlayerProgress);
router.put("/:id/singleplayer-progress", updateSinglePlayerProgress);

module.exports = router;
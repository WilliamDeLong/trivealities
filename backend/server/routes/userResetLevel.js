const express = require("express");
const router = express.Router();
const { addXp, resetXpAndLevel } = require("../controllers/userController");

router.post("/:id/xp", addXp);
router.put("/:id/reset-xp", resetXpAndLevel);

module.exports = router;
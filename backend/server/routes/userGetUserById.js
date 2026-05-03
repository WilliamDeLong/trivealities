const express = require("express");
const router = express.Router();
const newUserModel = require("../models/userModel");

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await newUserModel.findById(id).populate("profileImage");

    if (!user) {
      return res.status(404).send({ message: "userId does not exist." });
    }

    const { password: _, ...safeUser } = user.toObject();
    return res.status(200).json({ user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: err.message });
  }
});

module.exports = router;

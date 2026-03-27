const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const newUserModel = require("../models/userModel");

router.put("/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).send({
        message: "Current password, new password, and confirm password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).send({
        message: "New password must be 8 characters or more.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send({
        message: "New password and confirm password do not match.",
      });
    }

    const user = await newUserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).send({ message: "Password updated successfully." });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

module.exports = router;
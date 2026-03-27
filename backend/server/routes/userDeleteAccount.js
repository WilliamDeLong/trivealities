const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const newUserModel = require("../models/userModel");
const profileImage = require("../models/profileImage");

const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../utilities/s3-credentials");

router.delete("/:id/delete-account", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).send({ message: "Password is required to delete account." });
    }

    const user = await newUserModel.findById(req.params.id).populate("profileImage");

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Incorrect password." });
    }

    const currentProfileImage = user.profileImage;

    // Delete custom profile image only
    if (currentProfileImage && !currentProfileImage.isDefault) {
      if (currentProfileImage.imageKey) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: currentProfileImage.imageKey,
        });

        await s3Client.send(deleteCommand);
      }

      await profileImage.findByIdAndDelete(currentProfileImage._id);
    }

    await newUserModel.findByIdAndDelete(req.params.id);

    return res.status(200).send({ message: "User account deleted successfully." });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return res.status(500).send({ message: err.message });
  }
});

module.exports = router;
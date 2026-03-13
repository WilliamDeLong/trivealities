const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const User = require("../models/userModel");
const profileImage = require("../models/profileImage");

const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../utilities/s3-credentials");

const router = express.Router();

// Multer (memory storage) so we can upload req.file.buffer to S3
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only PNG, JPG, JPEG, or WEBP allowed."), ok);
  },
});

/**
 * GET /:id
 * Returns the user with populated profileImage
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("profileImage");

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    return res.status(200).send({ user });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

/**
 * POST /:id/profile-image
 * Uploads an image to S3, creates a ProfileImage doc, links it to the user,
 * deletes the old custom image, and keeps the shared default image.
 */
router.post("/:id/profile-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "No image uploaded." });
    }

    const userId = req.params.id;

    // Ensure user exists and get current profile image
    const user = await User.findById(userId).populate("profileImage");
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const oldProfileImage = user.profileImage;

    // Build S3 key: profile-images/<userId>/<random>.<ext>
    const ext = path.extname(req.file.originalname) || "";
    const key = `profile-images/${userId}/${crypto.randomUUID()}${ext}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    const uploadResult = await s3Client.send(uploadCommand);

    if (uploadResult?.$metadata?.httpStatusCode !== 200) {
      return res.status(500).send({ message: "S3 upload failed." });
    }

    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Create new ProfileImage doc
    const imgDoc = await profileImage.create({
      imageUrl,
      imageKey: key,
      isDefault: false,
    });

    // Update user to new profile image
    user.profileImage = imgDoc._id;
    await user.save();

    // Delete old custom image (never delete shared default image)
    if (oldProfileImage && !oldProfileImage.isDefault) {
      if (oldProfileImage.imageKey) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: oldProfileImage.imageKey,
        });

        await s3Client.send(deleteCommand);
      }

      await profileImage.findByIdAndDelete(oldProfileImage._id);
    }

    const updatedUser = await User.findById(userId).populate("profileImage");

    return res.status(200).send({
      message: "Profile image uploaded.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).send({ message: err.message });
  }
});

module.exports = router;
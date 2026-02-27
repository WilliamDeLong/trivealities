// backend/server/routes/profileImageUpload.js
const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const User = require("../models/userModel");            // adjust if your user model filename differs
const ProfileImage = require("../models/ProfileImage"); // adjust if your ProfileImage filename differs

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../utilities/s3-credentials");  // adjust path to your s3-credentials file

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
 * GET /users/:id
 * Returns the user with populated profileImage (includes default imageUrl if assigned on signup)
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("profileImage");
    if (!user) return res.status(404).send({ message: "User not found." });

    return res.status(200).send({ user });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

/**
 * POST /users/:id/profile-image
 * Uploads an image to S3, creates a ProfileImage doc, and links it to the user.
 * Expects multipart/form-data with file field name: "image"
 */
router.post("/:id/profile-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send({ message: "No image uploaded." });

    const userId = req.params.id;

    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found." });

    // Build S3 key: profile-images/<userId>/<random>.<ext>
    const ext = path.extname(req.file.originalname) || "";
    const key = `profile-images/${userId}/${crypto.randomUUID()}${ext}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    const data = await s3Client.send(command);
    if (data?.$metadata?.httpStatusCode !== 200) {
      return res.status(500).send({ message: "S3 upload failed." });
    }

    // Public URL (works if your bucket/object is readable)
    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Create ProfileImage doc
    const imgDoc = await ProfileImage.create({
      imageUrl,
      isDefault: false,
    });

    // Link it to user
    user.profileImage = imgDoc._id;
    await user.save();

    // Return updated user with populated profile image
    const updatedUser = await User.findById(userId).populate("profileImage");

    return res.status(200).send({
      message: "Profile image uploaded.",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

module.exports = router;
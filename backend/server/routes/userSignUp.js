const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { newUserValidation } = require("../models/userValidator");
const newUserModel = require("../models/userModel");
const profileImage = require("../models/profileImage"); // ✅ add this

router.post("/signup", async (req, res) => {
  const { error } = newUserValidation(req.body);
  if (error) {
    return res.status(400).send({ message: error.errors[0].message });
  }

  const { username, email, password } = req.body;

  try {
    // Check if username already exists
    const existingUsername = await newUserModel.findOne({ username });
    if (existingUsername) {
      return res.status(409).send({ message: "Username is taken, pick another" });
    }

    // Check if email already exists
    const existingEmail = await newUserModel.findOne({ email });
    if (existingEmail) {
      return res.status(409).send({ message: "Email already registered" });
    }

    // Generate salt + hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create default profile image doc
    let defaultProfileImage = await profileImage.findOne({ isDefault: true });

    if (!defaultProfileImage) {
      defaultProfileImage = await profileImage.create({
        imageUrl: "/user-icon.png",
        imageKey: null, 
        isDefault: true,
      });
    }

    // Create user with reference to default profile image
    const createUser = new newUserModel({
      username,
      email,
      password: hashPassword,
      profileImage: defaultProfileImage._id,
    });

    const savedUser = await createUser.save();

    // Remove password before sending response
    const { password: _, ...safeUser } = savedUser.toObject();

    return res.status(201).send(safeUser);
  } catch (err) {
    return res.status(500).send({ message: "Error trying to create new user" });
  }
});

module.exports = router;
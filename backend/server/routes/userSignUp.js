const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { newUserValidation } = require('../models/userValidator');
const newUserModel = require('../models/userModel');

router.post('/signup', async (req, res) => {
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

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
    const hashPassword = await bcrypt.hash(password, salt);

    // Create user
    const createUser = new newUserModel({
      username,
      email,
      password: hashPassword,
    });

    const savedUser = await createUser.save();

    // Remove password before sending response
    const { password: _, ...safeUser } = savedUser.toObject();

    res.status(201).send(safeUser);

  } catch (err) {
    res.status(500).send({ message: "Error trying to create new user" });
  }
});

module.exports = router;
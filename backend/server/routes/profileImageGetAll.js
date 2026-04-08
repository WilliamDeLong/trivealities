const express = require("express");
const router = express.Router();
const profileImage = require("../models/profileImage");

router.get('/getProfileAll', async (req, res) => {
    const profileImag = await profileImage.find();
    return res.json(profileImag)
  })

  module.exports = router;
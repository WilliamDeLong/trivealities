const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const profileImage = require("../models/profileImage");

router.post("/deletePiID", async (req, res) => {
  var { profileId } = req.body;
  
  profileImage.deleteOne({_id: profileId}, function (err, image) {
    if (err) {
      console.log(err);
    }
    if (image==null) {
      res.status(404).send("Profile Image Id does not exist.");
    } 
    else {
      return res.json(image);
    }
  });
});

module.exports = router;

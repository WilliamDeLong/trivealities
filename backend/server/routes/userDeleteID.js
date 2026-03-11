const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const newUserModel = require("../models/userModel");

router.post("/deleteUID", async (req, res) => {
  var { userId } = req.body;
  
  newUserModel.deleteOne({_id: userId}, function (err, user) {
    if (err) {
      console.log(err);
    }
    if (user==null) {
      res.status(404).send("userId does not exist.");
    } 
    else {
      return res.json(user);
    }
  });
});

module.exports = router;

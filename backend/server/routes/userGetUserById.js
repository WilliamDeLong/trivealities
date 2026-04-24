const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const newUserModel = require("../models/userModel");

router.get("/:id", async (req, res) => {
  var { id } = req.params;

  newUserModel.findById(id, function (err, user) {
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

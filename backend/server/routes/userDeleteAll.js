const express = require("express");
const router = express.Router();
const newUserModel = require('../models/userModel')

router.post('/deleteAll', async (req, res) => {
    res.status(404).send("Function does not exist.");
    //return;
  })

  module.exports = router;
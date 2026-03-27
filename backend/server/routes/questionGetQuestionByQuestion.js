const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const newQuestionModel = require("../models/questionModel");

router.get("/getQuestionByQuestion", async (req, res) => {
  var { prompt } = req.body;

  newQuestionModel.findOne({question: prompt}, function (err, question2) {
    if (err) {
      console.log(err);
    }
    if (question2==null) {
      res.status(404).send("prompt does not exist.");
    } 
    else {
      return res.json(question2);
    }
  });
});

module.exports = router;

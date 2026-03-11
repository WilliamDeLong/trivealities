const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const newQuestionModel = require("../models/questionModel");

router.post("/deleteQID", async (req, res) => {
  var { questionId } = req.body;
  
  newQuestionModel.deleteOne({_id: questionId}, function (err, question) {
    if (err) {
      console.log(err);
    }
    if (question==null) {
      res.status(404).send("questionId does not exist.");
    } 
    else {
      return res.json(question);
    }
  });
});

module.exports = router;

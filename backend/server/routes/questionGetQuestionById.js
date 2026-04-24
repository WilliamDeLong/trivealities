const express = require("express");
const router = express.Router();
const z = require("zod");
const bcrypt = require("bcrypt");

const newQuestionModel = require("../models/questionModel");

router.get("/id=:id", async (req, res) => {
  var { id } = req.params;
  //console.log(req.params);
  //console.log(id);
  newQuestionModel.findById(id, function (err, question) {
    if (err) {
      console.log(err);
    }
    if (question==null) {
      res.status(404).send("QuestionId does not exist.");
    } 
    else {
      return res.json(question);
    }
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();

const newQuestionModel = require("../models/questionModel");

router.get("/:id", async (req, res) => {
  newQuestionModel.findById(req.params.id, function (err, question) {
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

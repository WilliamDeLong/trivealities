const express = require("express");
const router = express.Router({ mergeParams: true });
const z = require("zod");
const bcrypt = require("bcrypt");

const newQuestionModel = require("../models/questionModel");

router.param('findQuestion', (req, res, next, id) => {
  console.log("Hi")
  //console.log(req.params)
  next()
})

router.get("/findQuestion", async (req, res) => {
  const query = newQuestionModel.find();
  //console.log(req.query);
  //console.log(req.body);
  //console.log(req);
  var { question_prompt, q_category, q_difficulty} = req.body;
  if (question_prompt != null) {
    query.find({question: { "$regex": question_prompt}});
  }
  if (q_category != null) {
    query.find({category: q_category});
  }
  if (q_difficulty != null) {
    query.find({difficulty: q_difficulty});
  }
  query.getFilter();
  
  query.exec(function (err, ques) {
    if (err) {
      console.log(err);
    }
    if (ques.length==0) {
      res.status(404).send("A Question matching the parameters could not be found.");
    } 
    else {
      return res.json(ques);
    }
  });
});



module.exports = router;
const express = require("express");
const router = express.Router();
const newQuestionModel = require('../models/questionModel')

router.get('/getAll', async (req, res) => {
    const question = await newQuestionModel.find();
    return res.json(question)
  })

  module.exports = router;
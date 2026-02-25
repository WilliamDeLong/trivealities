const express = require("express");
const router = express.Router();
const newQuestionModel = require('../models/questionModel')

router.post('/deleteAll', async (req, res) => {
    const question = await newQuestionModel.deleteMany();
    return res.json(question)
  })

  module.exports = router;
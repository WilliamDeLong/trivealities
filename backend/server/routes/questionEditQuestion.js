const express = require("express");
const router = express.Router();
const z = require('zod')
const bcrypt = require("bcrypt");
const newQuestionModel = require("../models/questionModel");
//const { newUserValidation } = require('../models/userValidator');
const { generateAccessToken } = require('../utilities/generateToken');

router.post('/editQuestion', async (req, res) =>
{
    // store new question information
    const {questionId, question, correct_answer, incorrect_answer1, incorrect_answer2, incorrect_answer3, category, difficulty} = req.body

    // check if question already exists or not.
    const ques = await newQuestionModel.findOne({ question: question })
    if (ques) questionIdReg = JSON.stringify(ques._id).replace(/["]+/g, '')
    if (ques && questionIdReg !== questionId) return res.status(409).send({ message: "There is already a question with the same wording in the database. Please create another." })

    // generates the hash
    const generateHash = await bcrypt.genSalt(Number(10))

    // parse the generated hash into the correct answer
    const hashCorrect_Answer = await bcrypt.hash(correct_answer, generateHash)

    // find and update question using stored information
    newQuestionModel.findByIdAndUpdate(questionId, {
        question : question, 
        correct_answer : hashCorrect_Answer, 
        incorrect_answer1: incorrect_answer1,
		incorrect_answer2: incorrect_answer2,
		incorrect_answer3: incorrect_answer3,
        category: category,
        difficulty: difficulty,
    } ,function (err, ques) {
    if (err){
        console.log(err);
    } else {
        // create and send new access token to local storage
        const accessToken = generateAccessToken(ques._id, question, hashCorrect_Answer, incorrect_answer1, incorrect_answer2, incorrect_answer3, category, difficulty)  
        res.header('Authorization', accessToken).send({ accessToken: accessToken })
    }
    });

})

module.exports = router;
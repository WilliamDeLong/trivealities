const express = require("express");
const router = express.Router();
const z = require('zod')
const bcrypt = require("bcrypt");
//const { newUserValidation } = require('../models/userValidator')
const newQuestionModel = require('../models/questionModel')

router.post('/create', async (req, res) => {
    //const { error } = newUserValidation(req.body);
    //console.log(error)
    //if (error) return res.status(400).send({ message: error.errors[0].message });

    const { question, correct_answer, incorrect_answer1, incorrect_answer2, incorrect_answer3, category, difficulty } = req.body

    //check if email already exists
    const ques = await newQuestionModel.findOne({ question: question })
    if (ques)
        return res.status(409).send({ message: "There is already a question with that wording in the database. Please create a new one." })

    //generates the hash
    //const generateHash = await bcrypt.genSalt(Number(10))

    //parse the generated hash into the password
    //const hashed_answer = await bcrypt.hash(correct_answer, generateHash)
    //const hashed_answer2 = await bcrypt.hash(incorrect_answer1, generateHash)
    //const hashed_answer3 = await bcrypt.hash(incorrect_answer2, generateHash)
    //const hashed_answer4 = await bcrypt.hash(incorrect_answer3, generateHash)

    //creates a new user
    const createQuestion = new newQuestionModel({
        question: question,
        correct_answer: correct_answer,
        incorrect_answer1: incorrect_answer1,
		incorrect_answer2: incorrect_answer2,
		incorrect_answer3: incorrect_answer3,
        category: category,
        difficulty: difficulty,
		
    });

   
    try {
        const saveNewQuestion = await createQuestion.save();
        res.send(saveNewQuestion);
    } catch (error) {
        res.status(400).send({ message: "Error trying to create new question" });
    }

})

module.exports = router;
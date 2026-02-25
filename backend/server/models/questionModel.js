const { Int32 } = require("mongodb");
const mongoose = require("mongoose");

//user schema/model
const newQuestionSchema = new mongoose.Schema(
  {
	question: {
	  type: String,
	  required: true,
	  label: "Question Prompt",
	  min : 1
	},
	correct_answer: {
	  type: String,
	  required: true,
	  label: "Correct Answer",
	},
	incorrect_answer1: {
	  type: String,
	  required: true,
	  label: "Incorrect Answer 1",
	},
	incorrect_answer2: {
	  type: String,
	  required: true,
	  label: "Incorrect Answer 2",
	},
	incorrect_answer3: {
	  type: String,
	  required: true,
	  label: "Incorrect Answer 3",
	},
	category: {
	  type: Number, 
	  required: true,
	  label : "Question categories"

	},
	difficulty : {
		type: Number,
		required: true,
		label : "Question difficulty."
	},
	date: {
	  type: Date,
	  default: Date.now,
	},
  },
  { collection: "questions" }
);

module.exports = mongoose.model('questions', newQuestionSchema)
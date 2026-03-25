const axios = require("axios");
const he = require("he");

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const getQuestions = async (req, res) => {
  try {
    const {
      amount = 10,
      difficulty,
      type,
      category,
    } = req.query;

    const parsedAmount = Number(amount);

    // ✅ Validation: must be a valid positive number
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number",
      });
    }

    // 🚨 Validation: limit to 50 questions max
    if (parsedAmount > 50) {
      return res.status(400).json({
        message: "Cannot request more than 50 questions at once",
      });
    }

    let url = `https://opentdb.com/api.php?amount=${parsedAmount}`;

    if (difficulty) url += `&difficulty=${difficulty}`;
    if (type) url += `&type=${type}`;
    if (category) url += `&category=${category}`;

    const response = await axios.get(url);

    if (response.data.response_code !== 0) {
      return res.status(400).json({
        message: "Could not fetch questions from API",
        responseCode: response.data.response_code,
      });
    }

    const questions = response.data.results.map((q) => {
      const answers = shuffleArray([
        q.correct_answer,
        ...q.incorrect_answers,
      ]).map((a) => he.decode(a));

      return {
        prompt: he.decode(q.question),
        difficulty: q.difficulty,
        type: q.type,
        category: he.decode(q.category),
        correctAnswer: he.decode(q.correct_answer),
        answers,
      };
    });

    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching questions",
      error: error.message,
    });
  }
};

module.exports = { getQuestions };
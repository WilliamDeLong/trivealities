import React, { useMemo, useState } from "react";

const QuestionCard = ({ question }) => {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);

  const answers = useMemo(() => {
    const allAnswers = [
      question.correct_answer,
      question.incorrect_answer1,
      question.incorrect_answer2,
      question.incorrect_answer3,
    ];

    return allAnswers.sort(() => Math.random() - 0.5);
  }, [question]);

  const handleAnswerClick = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
  };

  const getButtonClass = (answer) => {
    if (!showResult) return "answer-button";

    if (answer === question.correct_answer) {
      return "answer-button correct";
    }

    if (answer === selectedAnswer && answer !== question.correct_answer) {
      return "answer-button incorrect";
    }

    return "answer-button";
  };

  return (
    <div className="question-card">
      <h2 className="question-text">{question.question}</h2>

      <div className="question-meta">
        <span>Category: {question.category}</span>
        <span>Difficulty: {question.difficulty}</span>
      </div>

      <div className="answers-container">
        {answers.map((answer, index) => (
          <button
            key={index}
            className={getButtonClass(answer)}
            onClick={() => handleAnswerClick(answer)}
          >
            {answer}
          </button>
        ))}
      </div>

      {showResult && (
        <p className="result-text">
          {selectedAnswer === question.correct_answer
            ? "Correct!"
            : `Wrong! Correct answer: ${question.correct_answer}`}
        </p>
      )}
    </div>
  );
};
console.log(questions[currentIndex]);
export default QuestionCard;
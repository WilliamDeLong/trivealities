import { useState } from "react";
import axios from "axios";

function SinglePlayerPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [questionAmount, setQuestionAmount] = useState(10);

  const currentQuestion = questions[currentQuestionIndex];

  const startGame = async () => {
    setLoading(true);
    setError("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setGameStarted(false);
    setGameFinished(false);

    try {
      const params = {
        amount: Number(questionAmount),
        type: "multiple",
      };

      if (difficulty) params.difficulty = difficulty;
      if (category) params.category = category;

      const res = await axios.get("http://localhost:8081/questions", { params });

      if (!Array.isArray(res.data) || res.data.length === 0) {
        setError("No questions found.");
        return;
      }

      setQuestions(res.data);
      setGameStarted(true);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load questions."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (answer) => {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(answer);

    if (answer === currentQuestion.correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
    } else {
      setGameFinished(true);
      setGameStarted(false);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setGameStarted(false);
    setGameFinished(false);
    setLoading(false);
    setError("");
  };

  return (
    <div className="single-player-page">
      <div className="single-player-card">
        <h1>Single Player Trivealities</h1>

        {!gameStarted && !gameFinished && (
          <div className="setup-section">
            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">Any Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Any Category</option>
                <option value="9">General Knowledge</option>
                <option value="18">Computers</option>
                <option value="21">Sports</option>
                <option value="23">History</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Questions</label>
              <input
                type="number"
                min="1"
                max="50"
                value={questionAmount}
                onChange={(e) => setQuestionAmount(e.target.value)}
              />
            </div>

            <button onClick={startGame} disabled={loading}>
              {loading ? "Loading..." : "Start Game"}
            </button>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {gameStarted && currentQuestion && (
          <div className="question-section">
            <p className="question-count">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>

            <p className="score-display">Score: {score}</p>

            <p className="question-meta">
              {currentQuestion.category} • {currentQuestion.difficulty}
            </p>

            <h2 className="question-text">{currentQuestion.prompt}</h2>

            <div className="answers-container">
              {currentQuestion.answers.map((answer, index) => {
                let className = "answer-button";

                if (selectedAnswer) {
                  if (answer === currentQuestion.correctAnswer) {
                    className = "answer-button correct";
                  } else if (answer === selectedAnswer) {
                    className = "answer-button incorrect";
                  }
                }

                return (
                  <button
                    key={index}
                    className={className}
                    onClick={() => handleAnswerClick(answer)}
                    disabled={!!selectedAnswer}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>

            {selectedAnswer && (
              <button className="next-button" onClick={handleNextQuestion}>
                {currentQuestionIndex + 1 === questions.length
                  ? "Finish Game"
                  : "Next Question"}
              </button>
            )}
          </div>
        )}

        {gameFinished && (
          <div className="results-section">
            <h2>Game Over</h2>
            <p>
              Final Score: {score} / {questions.length}
            </p>
            <button onClick={handleRestart}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SinglePlayerPage;
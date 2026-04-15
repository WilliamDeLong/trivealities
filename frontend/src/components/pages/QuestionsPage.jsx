import React, { useEffect, useState } from "react";
import API_BASE from "../../api";
const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/questions`);

        if (!res.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading questions...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Trivia Questions</h1>

      {questions.length === 0 ? (
        <p>No questions found.</p>
      ) : (
        questions.map((question) => (
          <div
            key={question._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: "#fff",
            }}
          >
            <h2>{question.question}</h2>
            <p><strong>Correct Answer:</strong> {question.correct_answer}</p>
            <p><strong>Incorrect Answer 1:</strong> {question.incorrect_answer1}</p>
            <p><strong>Incorrect Answer 2:</strong> {question.incorrect_answer2}</p>
            <p><strong>Incorrect Answer 3:</strong> {question.incorrect_answer3}</p>
            <p><strong>Category:</strong> {question.category}</p>
            <p><strong>Difficulty:</strong> {question.difficulty}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default QuestionsPage;
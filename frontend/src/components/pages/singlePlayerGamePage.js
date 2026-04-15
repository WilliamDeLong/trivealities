import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import { UserContext } from "../../App";

const difficultyConfig = {
  easy: {
    title: "Easy",
    amount: 10,
    difficulty: "easy",
    color: "#22c55e",
  },
  medium: {
    title: "Medium",
    amount: 20,
    difficulty: "medium",
    color: "#3b82f6",
  },
  hard: {
    title: "Hard",
    amount: 30,
    difficulty: "hard",
    color: "#ef4444",
  },
};

function SinglePlayerGamePage() {
  const { difficulty } = useParams();
  const navigate = useNavigate();
  const { isLightMode } = useContext(UserContext);

  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [awardedXp, setAwardedXp] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [error, setError] = useState("");

  const config = difficultyConfig[difficulty];

  useEffect(() => {
    const decodedUser = getUserInfo();
    setUser(decodedUser || null);
  }, []);

  useEffect(() => {
    if (!config) {
      setError("Invalid difficulty selected.");
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("http://localhost:8081/api/questions", {
          params: {
            amount: config.amount,
            difficulty: config.difficulty,
            type: "multiple",
          },
        });

        if (!Array.isArray(res.data) || res.data.length === 0) {
          setError("No questions were returned.");
          setLoading(false);
          return;
        }

        setQuestions(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load single player questions."
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [config]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isPerfectRun = gameFinished && totalQuestions > 0 && score === totalQuestions;

  useEffect(() => {
    const sendXp = async () => {
      if (!gameFinished || awardedXp || !user) return;
      if (!earnedXp) {
        setAwardedXp(true);
        return;
      }

      const userId = user._id || user.id;

      if (!userId) {
        setAwardedXp(true);
        return;
      }

      try {
        await axios.post(`http://localhost:8081/user/${userId}/xp`, {
          xp: earnedXp,
        });
      } catch (err) {
        console.log("XP award failed:", err.response?.data || err.message);
      } finally {
        setAwardedXp(true);
      }
    };

    sendXp();
  }, [gameFinished, awardedXp, earnedXp, user]);

  useEffect(() => {
    const saveProgress = async () => {
      if (!gameFinished || !isPerfectRun || progressSaved || !user) return;

      const userId = user._id || user.id;

      if (!userId) {
        setProgressSaved(true);
        return;
      }

      try {
        await axios.put(
          `http://localhost:8081/user/${userId}/singleplayer-progress`,
          { difficulty }
        );
      } catch (err) {
        console.log("Progress save failed:", err.response?.data || err.message);
      } finally {
        setProgressSaved(true);
      }
    };

    saveProgress();
  }, [gameFinished, isPerfectRun, progressSaved, user, difficulty]);

  const handleAnswerClick = (answer) => {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(answer);

    if (answer === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      setEarnedXp((prev) => prev + 5);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
    } else {
      setGameFinished(true);
    }
  };

  const handleBackToMenu = () => {
    navigate("/singleplayer");
  };

  const handleReplay = () => {
    navigate(0);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: isLightMode
            ? "linear-gradient(135deg, #dbeafe, #bfdbfe, #e0f2fe)"
            : "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
          color: isLightMode ? "#0f172a" : "#ffffff",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        Loading {config?.title || "Single Player"}...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          background: isLightMode
            ? "linear-gradient(135deg, #dbeafe, #bfdbfe, #e0f2fe)"
            : "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            background: isLightMode ? "#ffffff" : "rgba(15,23,42,0.78)",
            color: isLightMode ? "#0f172a" : "#ffffff",
            padding: "28px",
            borderRadius: "18px",
            textAlign: "center",
            boxShadow: "0 14px 32px rgba(0,0,0,0.28)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Single Player Error</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={handleBackToMenu}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (gameFinished) {
    const nextUnlockText =
      difficulty === "easy"
        ? "Medium Unlocked"
        : difficulty === "medium"
        ? "Hard Unlocked"
        : "Final Difficulty Cleared";

    return (
      <div
        style={{
          minHeight: "100vh",
          background: isLightMode
            ? "linear-gradient(135deg, #dbeafe, #bfdbfe, #e0f2fe)"
            : "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "760px",
            background: isLightMode ? "rgba(255,255,255,0.9)" : "rgba(15,23,42,0.72)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "22px",
            padding: "32px 28px",
            textAlign: "center",
            boxShadow: "0 18px 38px rgba(0,0,0,0.3)",
            color: isLightMode ? "#0f172a" : "#ffffff",
            animation: "fadeInScale 0.45s ease forwards",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "12px",
            }}
          >
            {isPerfectRun ? "🏆" : "🎮"}
          </div>

          <h1
            style={{
              marginTop: 0,
              marginBottom: "10px",
              color: config.color,
              textShadow: isLightMode ? "none" : `0 0 18px ${config.color}44`,
            }}
          >
            {config.title} Complete
          </h1>

          <p
            style={{
              marginTop: 0,
              fontSize: "1.1rem",
              color: isLightMode ? "#334155" : "#cbd5e1",
            }}
          >
            Final Score: {score} / {totalQuestions}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                background: "rgba(34,197,94,0.18)",
                color: "#22c55e",
                border: "1px solid rgba(34,197,94,0.35)",
                padding: "8px 12px",
                borderRadius: "999px",
                fontWeight: "bold",
              }}
            >
              XP Earned: {earnedXp}
            </span>

            <span
              style={{
                background: isPerfectRun
                  ? "rgba(59,130,246,0.18)"
                  : "rgba(148,163,184,0.16)",
                color: isPerfectRun ? "#3b82f6" : "#94a3b8",
                border: `1px solid ${
                  isPerfectRun
                    ? "rgba(59,130,246,0.35)"
                    : "rgba(148,163,184,0.25)"
                }`,
                padding: "8px 12px",
                borderRadius: "999px",
                fontWeight: "bold",
              }}
            >
              {isPerfectRun
                ? nextUnlockText
                : "Perfect score required to unlock next difficulty"}
            </span>
          </div>

          {isPerfectRun ? (
            <div
              style={{
                marginBottom: "22px",
                padding: "16px",
                borderRadius: "14px",
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.28)",
                color: "#22c55e",
                fontWeight: "bold",
              }}
            >
              You answered every question correctly.
            </div>
          ) : (
            <div
              style={{
                marginBottom: "22px",
                padding: "16px",
                borderRadius: "14px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.28)",
                color: "#f87171",
                fontWeight: "bold",
              }}
            >
              You need a perfect run to unlock the next difficulty.
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleReplay}
              style={{
                background: config.color,
                color: "#ffffff",
                border: "none",
                padding: "12px 22px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: `0 10px 24px ${config.color}44`,
              }}
            >
              Play Again
            </button>

            <button
              type="button"
              onClick={handleBackToMenu}
              style={{
                background: "transparent",
                color: isLightMode ? "#0f172a" : "#ffffff",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "12px 22px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Back to Difficulty Menu
            </button>
          </div>

          <style>
            {`
              @keyframes fadeInScale {
                from {
                  opacity: 0;
                  transform: scale(0.96);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  const progressPercent =
    totalQuestions > 0
      ? ((currentQuestionIndex + (selectedAnswer ? 1 : 0)) / totalQuestions) * 100
      : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isLightMode
          ? "linear-gradient(135deg, #dbeafe, #bfdbfe, #e0f2fe)"
          : "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
        padding: "24px 18px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "920px",
          margin: "0 auto",
          animation: "fadeInUp 0.55s ease forwards",
        }}
      >
        <div
          style={{
            marginBottom: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleBackToMenu}
            style={{
              background: "transparent",
              color: isLightMode ? "#0f172a" : "#ffffff",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Back
          </button>

          <div
            style={{
              color: config.color,
              fontWeight: "bold",
              fontSize: "1.2rem",
              textShadow: isLightMode ? "none" : `0 0 14px ${config.color}44`,
            }}
          >
            {config.title} Mode
          </div>
        </div>

        <div
          style={{
            width: "100%",
            background: isLightMode ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.68)",
            borderRadius: "16px",
            padding: "14px",
            marginBottom: "18px",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "10px",
              color: isLightMode ? "#0f172a" : "#ffffff",
              fontWeight: "bold",
            }}
          >
            <span>
              Question {currentQuestionIndex + 1} / {totalQuestions}
            </span>
            <span>Score: {score}</span>
            <span>XP Earned: {earnedXp}</span>
          </div>

          <div
            style={{
              height: "12px",
              borderRadius: "999px",
              background: "rgba(148,163,184,0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${config.color}, #00d0ff)`,
                transition: "width 0.35s ease",
              }}
            />
          </div>
        </div>

        {currentQuestion && (
          <div
            style={{
              background: isLightMode ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.72)",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 18px 36px rgba(0,0,0,0.28)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              style={{
                marginBottom: "12px",
                color: config.color,
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              {currentQuestion.category} • {currentQuestion.difficulty}
            </div>

            <h2
              style={{
                marginTop: 0,
                marginBottom: "22px",
                color: isLightMode ? "#0f172a" : "#ffffff",
                lineHeight: 1.4,
                fontSize: "1.8rem",
              }}
            >
              {currentQuestion.prompt}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
              }}
            >
              {currentQuestion.answers.map((answer, index) => {
                const isCorrect = answer === currentQuestion.correctAnswer;
                const isSelected = answer === selectedAnswer;

                let background = isLightMode ? "#f8fafc" : "rgba(30,41,59,0.88)";
                let color = isLightMode ? "#0f172a" : "#ffffff";
                let border = "1px solid rgba(148,163,184,0.18)";

                if (selectedAnswer) {
                  if (isCorrect) {
                    background = "rgba(34,197,94,0.16)";
                    color = "#22c55e";
                    border = "1px solid rgba(34,197,94,0.35)";
                  } else if (isSelected) {
                    background = "rgba(239,68,68,0.16)";
                    color = "#ef4444";
                    border = "1px solid rgba(239,68,68,0.35)";
                  }
                }

                return (
                  <button
                    key={`${answer}-${index}`}
                    type="button"
                    onClick={() => handleAnswerClick(answer)}
                    disabled={!!selectedAnswer}
                    style={{
                      textAlign: "left",
                      padding: "18px",
                      borderRadius: "16px",
                      border,
                      background,
                      color,
                      cursor: selectedAnswer ? "default" : "pointer",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      boxShadow: selectedAnswer
                        ? "none"
                        : "0 8px 18px rgba(0,0,0,0.12)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAnswer) return;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.12)";
                    }}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>

            {selectedAnswer && (
              <div
                style={{
                  marginTop: "22px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    color:
                      selectedAnswer === currentQuestion.correctAnswer
                        ? "#22c55e"
                        : "#f87171",
                    fontWeight: "bold",
                  }}
                >
                  {selectedAnswer === currentQuestion.correctAnswer
                    ? "+5 XP for a correct answer"
                    : "No XP for an incorrect answer"}
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  style={{
                    background: config.color,
                    color: "#ffffff",
                    border: "none",
                    padding: "12px 22px",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: `0 10px 24px ${config.color}44`,
                  }}
                >
                  {currentQuestionIndex + 1 === totalQuestions
                    ? "Finish Run"
                    : "Next Question"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

export default SinglePlayerGamePage;
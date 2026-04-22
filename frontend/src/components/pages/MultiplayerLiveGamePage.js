import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../../socket";
import getUserInfo from "../../utilities/decodeJwt";
import { connectSocket } from "../../socket";
import GameChatPanel from "../chat/GameChatPanel";

function MultiplayerLiveGamePage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const user = getUserInfo();

  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answerLocked, setAnswerLocked] = useState(false);
  const [message, setMessage] = useState("");
  const [localCorrectCount, setLocalCorrectCount] = useState(0);
  const [localStreak, setLocalStreak] = useState(0);
  const [highestLocalStreak, setHighestLocalStreak] = useState(0);

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    const handleRoomUpdated = (updatedRoom) => {
      if (updatedRoom.roomCode === roomCode) {
        setRoom(updatedRoom);
      }
    };

    const handleGameStarted = ({
      roomCode: startedRoomCode,
      questions: startedQuestions,
    }) => {
      if (startedRoomCode === roomCode) {
        setQuestions(startedQuestions || []);
        setLoadingQuestions(false);
      }
    };

    const handleGameFinished = ({
      roomCode: finishedRoomCode,
      leaderboard,
      highestStreakHolder,
    }) => {
      if (finishedRoomCode === roomCode) {
        navigate(`/multiplayer/results/${roomCode}`, {
          state: { leaderboard, highestStreakHolder },
        });
      }
    };

    socket.on("room_updated", handleRoomUpdated);
    socket.on("multiplayer_game_started", handleGameStarted);
    socket.on("multiplayer_game_finished", handleGameFinished);

    return () => {
      socket.off("room_updated", handleRoomUpdated);
      socket.off("multiplayer_game_started", handleGameStarted);
      socket.off("multiplayer_game_finished", handleGameFinished);
    };
  }, [navigate, roomCode]);

  useEffect(() => {
    setLoadingQuestions(true);
    setMessage("");

    socket.emit("get_multiplayer_room_by_code", { roomCode }, async (response) => {
      if (!response?.success) {
        setMessage(response?.message || "Room not found");
        setLoadingQuestions(false);
        return;
      }

      const currentRoom = response.room;
      setRoom(currentRoom);

      if (currentRoom.questionSource !== "opentdb") {
        setMessage(
          "This room is not using OpenTriviaDB yet. Database mode can be connected next."
        );
        setQuestions([]);
        setLoadingQuestions(false);
        return;
      }

      if (currentRoom.questions && currentRoom.questions.length > 0) {
        setQuestions(currentRoom.questions);
        setLoadingQuestions(false);
        return;
      }

      setMessage("Waiting for host to start the game...");
      setLoadingQuestions(false);
    });
  }, [roomCode]);

  const currentPlayer = room?.players?.find(
    (player) => player.userId === (user?._id || user?.id)
  );

  const isHost = currentPlayer?.isHost;

  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex] || null;
  }, [questions, currentQuestionIndex]);

  const handleAnswerClick = (answer) => {
    if (!currentQuestion || answerLocked) return;

    setSelectedAnswer(answer);
    setAnswerLocked(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    socket.emit("submit_multiplayer_answer_result", {
      roomCode,
      isCorrect,
    });

    if (isCorrect) {
      setLocalCorrectCount((prev) => prev + 1);
      setLocalStreak((prev) => {
        const next = prev + 1;
        setHighestLocalStreak((highest) => Math.max(highest, next));
        return next;
      });
    } else {
      setLocalStreak(0);
    }

    setTimeout(() => {
      const isLastQuestion = currentQuestionIndex >= questions.length - 1;

      if (isLastQuestion) {
        if (isHost) {
          socket.emit("finish_multiplayer_game", { roomCode }, (response) => {
            if (response?.success) {
              navigate(`/multiplayer/results/${roomCode}`, {
                state: {
                  leaderboard: response.leaderboard,
                  highestStreakHolder: response.highestStreakHolder,
                },
              });
            } else {
              setMessage(response?.message || "Could not finish the game.");
            }
          });
        } else {
          setMessage("Waiting for the host to finish the game...");
        }
        return;
      }

      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setAnswerLocked(false);
    }, 1200);
  };

  if (loadingQuestions) {
    return (
      <GameChatPanel roomId={roomCode} allowFreeChat={false}>
        <div style={pageStyle}>
          <div style={panelStyle}>
            <h1 style={{ color: "#00d0ff", marginTop: 0 }}>Loading Game...</h1>
            <p style={{ color: "#cbd5e1" }}>Fetching multiplayer questions.</p>
          </div>
        </div>
      </GameChatPanel>
    );
  }

  if (!currentQuestion) {
    return (
      <GameChatPanel roomId={roomCode}>
        <div style={pageStyle}>
          <div style={panelStyle}>
            <h1 style={{ color: "#00d0ff", marginTop: 0 }}>No Questions Loaded</h1>
            <p style={{ color: "#fca5a5" }}>
              {message || "Could not load the live game questions."}
            </p>
            <button
              style={buttonStyle}
              onClick={() => navigate(`/multiplayer/room/${roomCode}`)}
            >
              Back to Room
            </button>
          </div>
        </div>
      </GameChatPanel>
    );
  }

  return (
    <GameChatPanel roomId={roomCode}>
      <div style={pageStyle}>
        <div style={panelStyle}>
          <div style={topBarStyle}>
            <div>
              <h1 style={{ color: "#00d0ff", margin: 0 }}>Live Multiplayer Game</h1>
              <p style={{ color: "#cbd5e1", marginTop: "6px" }}>
                Room {roomCode} • OpenTriviaDB
              </p>
            </div>

            <div style={scoreBoxStyle}>
              <div>Correct: {localCorrectCount}</div>
              <div>Streak: {localStreak}</div>
              <div>Best Streak: {highestLocalStreak}</div>
            </div>
          </div>

          <div style={questionMetaStyle}>
            <span>
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span>{currentQuestion.category}</span>
            <span style={{ textTransform: "capitalize" }}>
              {currentQuestion.difficulty}
            </span>
          </div>

          <div style={questionCardStyle}>
            <h2 style={{ color: "white", marginTop: 0, lineHeight: 1.5 }}>
              {currentQuestion.question}
            </h2>
          </div>

          <div style={answersGridStyle}>
            {currentQuestion.answers.map((answer) => {
              const isCorrect = answer === currentQuestion.correctAnswer;
              const isSelected = selectedAnswer === answer;

              let background = "rgba(30,41,59,0.88)";
              let border = "1px solid rgba(255,255,255,0.08)";

              if (answerLocked && isCorrect) {
                background = "rgba(34,197,94,0.22)";
                border = "1px solid rgba(34,197,94,0.5)";
              } else if (answerLocked && isSelected && !isCorrect) {
                background = "rgba(239,68,68,0.22)";
                border = "1px solid rgba(239,68,68,0.5)";
              }

              return (
                <button
                  key={answer}
                  style={{
                    ...answerButtonStyle,
                    background,
                    border,
                    cursor: answerLocked ? "default" : "pointer",
                  }}
                  onClick={() => handleAnswerClick(answer)}
                  disabled={answerLocked}
                >
                  {answer}
                </button>
              );
            })}
          </div>

          {message && (
            <p style={{ color: "#facc15", textAlign: "center", marginTop: "20px" }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </GameChatPanel>
  );
}

const shuffleArray = (array) => {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
  padding: "24px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const panelStyle = {
  width: "100%",
  maxWidth: "900px",
  background: "rgba(15,23,42,0.9)",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const scoreBoxStyle = {
  background: "rgba(30,41,59,0.85)",
  color: "white",
  padding: "14px",
  borderRadius: "12px",
  minWidth: "170px",
  lineHeight: 1.8,
};

const questionMetaStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "18px",
  marginBottom: "18px",
  color: "#cbd5e1",
  fontSize: "0.95rem",
};

const questionCardStyle = {
  background: "rgba(30,41,59,0.88)",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "20px",
};

const answersGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const answerButtonStyle = {
  padding: "18px",
  borderRadius: "14px",
  color: "white",
  fontSize: "1rem",
  textAlign: "left",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "16px",
};

export default MultiplayerLiveGamePage;
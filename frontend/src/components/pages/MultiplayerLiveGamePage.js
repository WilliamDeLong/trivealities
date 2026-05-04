import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../../socket";
import getUserInfo from "../../utilities/decodeJwt";
import { connectSocket } from "../../socket";
import GameChatPanel from "../chat/GameChatPanel";
import API_BASE from "../../api";
import { useMusic } from "../../context/MusicContext";

function MultiplayerLiveGamePage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const user = getUserInfo();
  const {
    isMuted,
    hasStartedMusic,
    startMusic,
    setMusicVolume,
    getMusicVolume,
  } = useMusic();
  const rightSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const previousVolumeRef = useRef(1);
  const [timeLeft, setTimeLeft] = useState(20);
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
    rightSoundRef.current = new Audio("/right-answer-sound.mp3");
    wrongSoundRef.current = new Audio("/wrong-answer-sound.mp3");
  
    rightSoundRef.current.preload = "auto";
    wrongSoundRef.current.preload = "auto";
    rightSoundRef.current.volume = 1;
    wrongSoundRef.current.volume = 1;
  
    return () => {
      if (rightSoundRef.current) {
        rightSoundRef.current.pause();
        rightSoundRef.current.currentTime = 0;
      }
  
      if (wrongSoundRef.current) {
        wrongSoundRef.current.pause();
        wrongSoundRef.current.currentTime = 0;
      }
  
      setMusicVolume(previousVolumeRef.current || 1);
    };
  }, [setMusicVolume]);
  
  useEffect(() => {
    if (!isMuted && !hasStartedMusic) {
      startMusic().catch((err) => {
        console.log("Multiplayer music auto-start failed:", err?.message || err);
      });
    }
  }, [isMuted, hasStartedMusic, startMusic]);

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
    const handleQuestionUpdate = ({
      roomCode: updatedRoomCode,
      questionIndex,
      timeLeft,
    }) => {
      if (updatedRoomCode === roomCode) {
        setCurrentQuestionIndex(questionIndex);
        setTimeLeft(timeLeft);
        setSelectedAnswer("");
        setAnswerLocked(false);
        setMessage("");
      }
    };

    const handleTimerTick = ({ roomCode: updatedRoomCode, timeLeft }) => {
      if (updatedRoomCode === roomCode) {
        setTimeLeft(timeLeft);
      }
    };
    socket.on("question_update", handleQuestionUpdate);
    socket.on("timer_tick", handleTimerTick);
    socket.on("room_updated", handleRoomUpdated);
    socket.on("multiplayer_game_started", handleGameStarted);
    socket.on("multiplayer_game_finished", handleGameFinished);

    return () => {
      socket.off("room_updated", handleRoomUpdated);
      socket.off("multiplayer_game_started", handleGameStarted);
      socket.off("multiplayer_game_finished", handleGameFinished);
      socket.off("question_update", handleQuestionUpdate);
      socket.off("timer_tick", handleTimerTick);
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

  useEffect(() => {
    if (!currentQuestion || answerLocked) return;

    if (timeLeft === 0) {
      setAnswerLocked(true);
      setSelectedAnswer("");

      socket.emit("submit_multiplayer_answer_result", {
        roomCode,
        isCorrect: false,
      });
    }
  }, [timeLeft, currentQuestion, answerLocked, roomCode]);

  const playAnswerSound = async (isCorrect) => {
    if (isMuted) return;

    const sound = isCorrect ? rightSoundRef.current : wrongSoundRef.current;
    if (!sound) return;

    try {
      previousVolumeRef.current = getMusicVolume();
      setMusicVolume(0.18);

      sound.currentTime = 0;
      sound.volume = 1;

      const restoreVolume = () => {
        sound.removeEventListener("ended", restoreVolume);
        setMusicVolume(previousVolumeRef.current || 1);
      };

      sound.addEventListener("ended", restoreVolume, { once: true });
      await sound.play();
    } catch (err) {
      console.log("Answer sound failed:", err.message);
      setMusicVolume(previousVolumeRef.current || 1);
    }
  };
  
  const handleAnswerClick = async (answer) => {
    if (!currentQuestion || answerLocked || timeLeft <= 0) return;

    setSelectedAnswer(answer);
    setAnswerLocked(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    playAnswerSound(isCorrect);

    socket.emit("submit_multiplayer_answer_result", {
      roomCode,
      isCorrect,
    });

    if (isCorrect) {
      const userId = user?._id || user?.id;

        if (userId) {
          try {
            await fetch(`${API_BASE}/user/${userId}/multiplayer-xp`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
              body: JSON.stringify({ xp: 20 }),
            });
          } catch (error) {
            console.error("XP award error:", error);
          }
        }

      setLocalCorrectCount((prev) => prev + 1);
      setLocalStreak((prev) => {
        const next = prev + 1;
        setHighestLocalStreak((highest) => Math.max(highest, next));
        return next;
      });
    } else {
      setLocalStreak(0);
    }
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
      <GameChatPanel roomId={roomCode} allowFreeChat={false}>
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
    <GameChatPanel roomId={roomCode} allowFreeChat={false}>
      <div style={pageStyle}>
        <div style={panelStyle}>
          <div style={topBarStyle}>
            <div>
              <h1 style={{ color: "#00d0ff", margin: 0 }}>Live Multiplayer Game</h1>
              <p style={{ color: "#cbd5e1", marginTop: "6px" }}>
              Room {roomCode} • {room?.questionSource === "database" ? "User Database" : "OpenTriviaDB"}
              </p>
            </div>

            <div style={scoreBoxStyle}>
              <div>Correct: {localCorrectCount}</div>
              <div>Streak: {localStreak}</div>
              <div>Best Streak: {highestLocalStreak}</div>
              <div style={{ color: "#facc15", fontWeight: "bold" }}>⏱ {timeLeft}s</div>
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
  padding: "64px 360px 24px 24px",
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
};

const panelStyle = {
  width: "100%",
  maxWidth: "900px",
  background: "rgba(15,23,42,0.9)",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  margin: "0 auto",
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
  width: "100%", // 🔥 THIS FIXES IT
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
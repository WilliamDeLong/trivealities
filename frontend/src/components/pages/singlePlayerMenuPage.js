import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import { UserContext } from "../../App";
import API_BASE from "../../api";

function SinglePlayerMenuPage() {
  const navigate = useNavigate();
  const { isLightMode } = useContext(UserContext);

  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({
    easyCompleted: false,
    mediumCompleted: false,
    hardCompleted: false,
  });
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    const decodedUser = getUserInfo();
    setUser(decodedUser || null);
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setLoadingProgress(false);
        return;
      }

      const userId = user._id || user.id;

      if (!userId) {
        setLoadingProgress(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE}/user/${userId}/singleplayer-progress`
        );

        setProgress(
          res.data.singlePlayerProgress || {
            easyCompleted: false,
            mediumCompleted: false,
            hardCompleted: false,
          }
        );
      } catch (error) {
        console.log(
          "Failed to fetch single player progress:",
          error.response?.data || error.message
        );
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [user]);

  const difficulties = [
    {
      key: "easy",
      title: "Easy",
      subtitle: "10 random easy questions",
      color: "#22c55e",
      locked: false,
      completed: progress.easyCompleted,
    },
    {
      key: "medium",
      title: "Medium",
      subtitle: "20 random medium questions",
      color: "#3b82f6",
      locked: !progress.easyCompleted,
      completed: progress.mediumCompleted,
    },
    {
      key: "hard",
      title: "Hard",
      subtitle: "30 random hard questions",
      color: "#ef4444",
      locked: !progress.mediumCompleted,
      completed: progress.hardCompleted,
    },
  ];

  const handleStartDifficulty = (difficultyKey, locked) => {
    if (locked) return;
    navigate(`/singleplayer/${difficultyKey}`);
  };

  const cardBaseStyle = {
    width: "100%",
    maxWidth: "280px",
    minHeight: "220px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "24px 20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  };

  if (loadingProgress) {
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
          fontWeight: "bold",
          fontSize: "1.2rem",
        }}
      >
        Loading Single Player...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: isLightMode
          ? "linear-gradient(135deg, #dbeafe, #bfdbfe, #e0f2fe)"
          : "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isLightMode
            ? "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.65), transparent 30%), radial-gradient(circle at 80% 30%, rgba(59,130,246,0.18), transparent 25%), radial-gradient(circle at 50% 80%, rgba(34,197,94,0.14), transparent 22%)"
            : "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.18), transparent 25%), radial-gradient(circle at 80% 30%, rgba(34,197,94,0.14), transparent 20%), radial-gradient(circle at 50% 80%, rgba(239,68,68,0.14), transparent 20%)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1080px",
            textAlign: "center",
            animation: "fadeInUp 0.8s ease forwards",
          }}
        >
          <p
            style={{
              color: isLightMode ? "#0f172a" : "#ffffff",
              fontWeight: "bold",
              marginBottom: "8px",
              letterSpacing: "1px",
            }}
          >
            SINGLE PLAYER
          </p>

          <h1
            style={{
              color: isLightMode ? "#0f172a" : "#00d0ff",
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "10px",
              textShadow: isLightMode ? "none" : "0 0 18px rgba(0,208,255,0.35)",
            }}
          >
            Select Difficulty
          </h1>

          <p
            style={{
              color: isLightMode ? "#1e293b" : "#e2e8f0",
              fontSize: "1.05rem",
              marginBottom: "32px",
            }}
          >
            Beat a difficulty with a perfect score to unlock the next one.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "22px",
              flexWrap: "wrap",
            }}
          >
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.key}
                type="button"
                onClick={() =>
                  handleStartDifficulty(difficulty.key, difficulty.locked)
                }
                disabled={difficulty.locked}
                style={{
                  ...cardBaseStyle,
                  background: difficulty.locked
                    ? isLightMode
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(15,23,42,0.82)"
                    : isLightMode
                    ? "rgba(255,255,255,0.82)"
                    : "rgba(15,23,42,0.66)",
                  opacity: difficulty.locked ? 0.65 : 1,
                  filter: difficulty.locked ? "grayscale(0.35)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (difficulty.locked) return;
                  e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 36px rgba(0,0,0,0.32)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0,0,0,0.28)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-30px",
                    right: "-30px",
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    background: `${difficulty.color}22`,
                  }}
                />

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "72px",
                    height: "72px",
                    borderRadius: "16px",
                    background: difficulty.locked
                      ? "rgba(148,163,184,0.2)"
                      : `${difficulty.color}22`,
                    border: `1px solid ${
                      difficulty.locked
                        ? "rgba(148,163,184,0.25)"
                        : `${difficulty.color}66`
                    }`,
                    marginBottom: "18px",
                    fontSize: "1.6rem",
                    fontWeight: "bold",
                    color: difficulty.locked ? "#94a3b8" : difficulty.color,
                    boxShadow: difficulty.locked
                      ? "none"
                      : `0 0 16px ${difficulty.color}44`,
                  }}
                >
                  {difficulty.locked ? "🔒" : difficulty.title[0]}
                </div>

                <h2
                  style={{
                    margin: 0,
                    marginBottom: "10px",
                    color: isLightMode ? "#0f172a" : "#ffffff",
                    fontSize: "1.6rem",
                    fontWeight: "bold",
                  }}
                >
                  {difficulty.title}
                </h2>

                <p
                  style={{
                    margin: 0,
                    marginBottom: "16px",
                    color: isLightMode ? "#334155" : "#cbd5e1",
                    lineHeight: 1.5,
                  }}
                >
                  {difficulty.subtitle}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {difficulty.completed && (
                    <span
                      style={{
                        background: "rgba(34,197,94,0.18)",
                        color: "#22c55e",
                        border: "1px solid rgba(34,197,94,0.35)",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                      }}
                    >
                      Completed
                    </span>
                  )}

                  {difficulty.locked && (
                    <span
                      style={{
                        background: "rgba(148,163,184,0.16)",
                        color: "#94a3b8",
                        border: "1px solid rgba(148,163,184,0.25)",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                      }}
                    >
                      Locked
                    </span>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    color: difficulty.locked ? "#94a3b8" : difficulty.color,
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                  }}
                >
                  {difficulty.locked ? "Unlock Required" : "Play Now"}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            style={{
              marginTop: "28px",
              background: "transparent",
              color: isLightMode ? "#0f172a" : "#ffffff",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "12px 20px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(24px);
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

export default SinglePlayerMenuPage;
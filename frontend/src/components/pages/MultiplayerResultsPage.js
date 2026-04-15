import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function MultiplayerResultsPage() {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const location = useLocation();

  const leaderboard = location.state?.leaderboard || [];
  const highestStreakHolder = location.state?.highestStreakHolder || null;

  return (
    <div style={pageStyle}>
      <div style={panelStyle}>
        <h1 style={{ color: "#00d0ff", marginTop: 0 }}>Game Results</h1>
        <p style={{ color: "#cbd5e1" }}>Room {roomCode}</p>

        <h2 style={{ color: "white" }}>Leaderboard</h2>
        <div style={{ display: "grid", gap: "10px" }}>
          {leaderboard.map((entry, index) => (
            <div key={entry.socketId} style={rowStyle}>
              <span>
                #{index + 1} {entry.username}
              </span>
              <span>{entry.correctAnswers} correct</span>
            </div>
          ))}
        </div>

        <h2 style={{ color: "white", marginTop: "24px" }}>Highest Streak</h2>
        <div style={highlightCard}>
          {highestStreakHolder ? (
            <>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                {highestStreakHolder.username}
              </div>
              <div style={{ color: "#cbd5e1" }}>
                Highest streak: {highestStreakHolder.highestStreak}
              </div>
            </>
          ) : (
            <div style={{ color: "#cbd5e1" }}>No streak data available.</div>
          )}
        </div>

        <button
          style={primaryButton}
          onClick={() => navigate(`/multiplayer/room/${roomCode}`)}
        >
          Back to Room
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

const panelStyle = {
  width: "100%",
  maxWidth: "700px",
  background: "rgba(15,23,42,0.88)",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "rgba(30,41,59,0.85)",
  color: "white",
};

const highlightCard = {
  padding: "16px",
  borderRadius: "14px",
  background: "rgba(30,41,59,0.85)",
  color: "white",
};

const primaryButton = {
  width: "100%",
  marginTop: "24px",
  padding: "12px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

export default MultiplayerResultsPage;
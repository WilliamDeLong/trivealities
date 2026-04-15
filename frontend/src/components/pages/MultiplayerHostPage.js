import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import socket from "../../socket";
import { connectSocket } from "../../socket";

function MultiplayerHostPage() {
  const navigate = useNavigate();
  const user = getUserInfo();

  const [roomName, setRoomName] = useState(
    `${user?.username || "Host"}'s room`
  );
  const [questionSource, setQuestionSource] = useState("database");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [questionCount, setQuestionCount] = useState(10);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    if (creating) return;

    setMessage("");

    if (!socket.connected) {
      setMessage("Socket is not connected to the server.");
      return;
    }

    setCreating(true);

    const payload = {
      userId: user?._id || user?.id || null,
      username: user?.username || "Host",
      profileImage: user?.profileImage || "",
      accountLevel: user?.accountLevel || 0,
      roomName,
      questionSource,
      maxPlayers: Number(maxPlayers),
      questionCount: Number(questionCount),
    };

    console.log("Creating room with payload:", payload);
    console.log("Socket connected:", socket.connected);
    console.log("Socket id:", socket.id);

    let didRespond = false;

    const timeoutId = setTimeout(() => {
      if (didRespond) return;
      setCreating(false);
      setMessage("Server did not respond while creating the room.");
      console.log("create_multiplayer_room timed out");
    }, 5000);

    socket.emit("create_multiplayer_room", payload, (response) => {
      didRespond = true;
      clearTimeout(timeoutId);
      setCreating(false);

      console.log("create_multiplayer_room response:", response);

      if (!response?.success) {
        setMessage(response?.message || "Could not create room");
        return;
      }

      navigate(`/multiplayer/room/${response.roomCode}`);
    });
  };

  return (
    <div style={pageStyle}>
      <div style={panelStyle}>
        <h1 style={titleStyle}>Host Multiplayer Room</h1>

        <div style={fieldStyle}>
          <label>Room Name</label>
          <input
            style={inputStyle}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </div>

        <div style={fieldStyle}>
          <label>Question Source</label>
          <select
            style={inputStyle}
            value={questionSource}
            onChange={(e) => setQuestionSource(e.target.value)}
          >
            <option value="database">User-Created Questions</option>
            <option value="opentdb">OpenTriviaDB</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label>Room Size (2-10, locked after creation)</label>
          <input
            style={inputStyle}
            type="number"
            min="2"
            max="10"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
          />
        </div>

        <div style={fieldStyle}>
          <label>Question Count (1-20)</label>
          <input
            style={inputStyle}
            type="number"
            min="1"
            max="20"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
          />
        </div>

        <button style={primaryButton} onClick={handleCreate} disabled={creating}>
          {creating ? "Creating..." : "Create Room"}
        </button>

        {message && <p style={{ color: "#fca5a5" }}>{message}</p>}

        <button style={secondaryButton} onClick={() => navigate("/multiplayer")}>
          Back
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
  padding: "20px",
};

const panelStyle = {
  width: "100%",
  maxWidth: "500px",
  background: "rgba(15,23,42,0.85)",
  color: "white",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.1)",
};

const titleStyle = {
  marginTop: 0,
  color: "#00d0ff",
  textAlign: "center",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginBottom: "16px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#0f172a",
  color: "white",
};

const primaryButton = {
  width: "100%",
  padding: "12px",
  background: "#8b5cf6",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: "12px",
};

const secondaryButton = {
  width: "100%",
  padding: "12px",
  background: "transparent",
  color: "white",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "10px",
  cursor: "pointer",
};

export default MultiplayerHostPage;
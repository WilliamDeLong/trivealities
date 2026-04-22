import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import socket from "../../socket";

function MultiplayerJoinPage() {
  const navigate = useNavigate();
  const user = getUserInfo();

  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.emit("get_multiplayer_rooms", (response) => {
      if (response?.success) {
        setRooms(response.rooms || []);
      }
    });

    const handleRoomsUpdated = (updatedRooms) => {
      setRooms(updatedRooms || []);
    };

    socket.on("multiplayer_rooms_updated", handleRoomsUpdated);

    return () => {
      socket.off("multiplayer_rooms_updated", handleRoomsUpdated);
    };
  }, []);

  const handleJoin = (room) => {
    const enteredCode = window.prompt(
      `Enter the 4-digit code for ${room.roomName}`
    );

    if (!enteredCode) return;

    socket.emit(
      "join_multiplayer_room",
      {
        roomCode: room.roomCode,
        enteredCode,
        userId: user?._id || user?.id || null,
        username: user?.username || "Player",
        profileImage: user?.profileImage?.imageUrl || user?.profileImage || "",        accountLevel: user?.accountLevel || 0,
      },
      (response) => {
        if (!response?.success) {
          setMessage(response?.message || "Could not join room");
          return;
        }

        navigate(`/multiplayer/room/${response.roomCode}`);
      }
    ); 
  };

  return (
    <div style={pageStyle}>
      <div style={panelStyle}>
        <h1 style={titleStyle}>Join Multiplayer Room</h1>
        <p style={{ textAlign: "center", color: "#cbd5e1" }}>
          Click a room, then enter its 4-digit code.
        </p>

        {message && <p style={{ color: "#fca5a5", textAlign: "center" }}>{message}</p>}

        <div style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
          {rooms.length === 0 ? (
            <div style={emptyStyle}>No available rooms right now.</div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.roomCode}
                style={roomCardStyle}
                onClick={() => handleJoin(room)}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    {room.roomName}
                  </div>
                  <div style={{ color: "#cbd5e1", marginTop: "4px" }}>
                    Host: {room.hostUsername}
                  </div>
                  <div style={{ color: "#94a3b8", marginTop: "4px" }}>
                    {room.playerCount}/{room.maxPlayers} players •{" "}
                    {room.questionSource === "database"
                      ? "User Questions"
                      : "OpenTriviaDB"}{" "}
                    • {room.questionCount} questions
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

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
  maxWidth: "720px",
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

const roomCardStyle = {
  width: "100%",
  textAlign: "left",
  padding: "16px",
  borderRadius: "14px",
  background: "rgba(30,41,59,0.8)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
};

const emptyStyle = {
  padding: "18px",
  textAlign: "center",
  borderRadius: "14px",
  background: "rgba(30,41,59,0.8)",
  color: "#cbd5e1",
};

const secondaryButton = {
  width: "100%",
  padding: "12px",
  marginTop: "16px",
  background: "transparent",
  color: "white",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "10px",
  cursor: "pointer",
};

export default MultiplayerJoinPage;
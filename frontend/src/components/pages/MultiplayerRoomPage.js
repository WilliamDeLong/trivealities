import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import socket from "../../socket";
import GameChatPanel from "../chat/GameChatPanel";
import API_BASE from "../../api";

function MultiplayerRoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const user = getUserInfo();

  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [playerImageMap, setPlayerImageMap] = useState({});
  useEffect(() => {
    socket.emit("get_multiplayer_room_by_code", { roomCode }, (response) => {
      if (!response?.success) {
        setMessage(response?.message || "Room not found");
        return;
      }
  
      setRoom(response.room);
    });

    const handleRoomUpdated = (updatedRoom) => {
      if (updatedRoom.roomCode === roomCode) {
        setRoom(updatedRoom);
      }
    };

    const handleGameStarted = ({ roomCode: startedRoomCode }) => {
      if (startedRoomCode === roomCode) {
        navigate(`/multiplayer/live/${roomCode}`);
      }
    };

    const handleGameFinished = ({ roomCode: finishedRoomCode, leaderboard, highestStreakHolder }) => {
      if (finishedRoomCode === roomCode) {
        navigate(`/multiplayer/results/${roomCode}`, {
          state: { leaderboard, highestStreakHolder },
        });
      }
    };

    const handleRoomDisbanded = ({ roomCode: disbandedCode, message }) => {
      if (disbandedCode === roomCode) {
        alert(message || "Room disbanded");
        navigate("/multiplayer");
      }
    };

    socket.on("room_updated", handleRoomUpdated);
    socket.on("multiplayer_game_started", handleGameStarted);
    socket.on("multiplayer_game_finished", handleGameFinished);
    socket.on("room_disbanded", handleRoomDisbanded);

    return () => {
      socket.off("room_updated", handleRoomUpdated);
      socket.off("multiplayer_game_started", handleGameStarted);
      socket.off("multiplayer_game_finished", handleGameFinished);
      socket.off("room_disbanded", handleRoomDisbanded);
    };
  }, [navigate, roomCode]);
  useEffect(() => {
  const fetchPlayerImages = async () => {
    if (!room?.players?.length) return;

    const entries = await Promise.all(
      room.players.map(async (player) => {
        if (!player.userId) {
          return [player.socketId, "/user-icon.png"];
        }

        try {
          const res = await fetch(`${API_BASE}/user/${player.userId}`);
          if (!res.ok) {
            return [player.socketId, "/user-icon.png"];
          }

          const data = await res.json();
          const imageUrl = data?.user?.profileImage?.imageUrl || "/user-icon.png";
          return [player.socketId, imageUrl];
        } catch (error) {
          return [player.socketId, "/user-icon.png"];
        }
      })
    );

    setPlayerImageMap(Object.fromEntries(entries));
  };

  fetchPlayerImages();
}, [room]);
  const currentPlayer = room?.players?.find(
    (player) => player.userId === (user?._id || user?.id)
  );

  const isHost = currentPlayer?.isHost;

  const handleStartGame = () => {
    socket.emit("start_multiplayer_game", { roomCode }, (response) => {
      if (!response?.success) {
        setMessage(response?.message || "Could not start game");
      }
    });
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_multiplayer_room", { roomCode }, () => {
      navigate("/multiplayer");
    });
  };

  const handleDisbandRoom = () => {
    socket.emit("disband_multiplayer_room", { roomCode }, (response) => {
      if (!response?.success) {
        setMessage(response?.message || "Could not disband room");
      } else {
        navigate("/multiplayer");
      }
    });
  };

  return (
    <GameChatPanel roomId={roomCode} allowFreeChat={true}>
      <div style={pageStyle}>
        <div style={panelStyle}>
          <h1 style={{ color: "#00d0ff", marginTop: 0 }}>{room?.roomName || "Room"}</h1>
          <p style={{ color: "#cbd5e1" }}>Code: {roomCode}</p>

          <div style={metaGrid}>
            <div style={metaCard}>
              <strong>Timer</strong>
              <div>20 seconds per question</div>
            </div>
            <div style={metaCard}>
              <strong>Question Source</strong>
              <div>
                {room?.questionSource === "database"
                  ? "User-Created Questions"
                  : "OpenTriviaDB"}
              </div>
            </div>

            <div style={metaCard}>
              <strong>Players</strong>
              <div>
                {room?.playerCount || 0}/{room?.maxPlayers || 0}
              </div>
            </div>

            <div style={metaCard}>
              <strong>Question Count</strong>
              <div>{room?.questionCount || 0}</div>
            </div>

            <div style={metaCard}>
              <strong>Status</strong>
              <div>{room?.status || "lobby"}</div>
            </div>
          </div>

          <h2 style={{ color: "white", marginTop: "24px" }}>Players</h2>

          <div style={playerGrid}>
            {room?.players?.map((player) => (
              <div
                key={player.socketId}
                style={{
                  ...playerCard,
                  border: player.isHost
                    ? "1px solid rgba(250,204,21,0.6)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: player.isHost
                    ? "0 0 18px rgba(250,204,21,0.4)"
                    : "0 10px 20px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={playerImageMap[player.socketId] || "/user-icon.png"}
                  alt={player.username}
                  onError={(e) => {
                    e.currentTarget.src = "/user-icon.png";
                  }}
                  style={{
                    width: "70%",
                    height: "70%",
                    maxWidth: "140px",
                    maxHeight: "140px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: player.isHost
                      ? "2px solid #facc15"
                      : "2px solid rgba(255,255,255,0.15)",
                  }}
                />

                <div style={{ marginTop: "10px", fontWeight: "bold", color: "white" }}>
                  {player.username}
                </div>

                <div style={{ color: "#cbd5e1", fontSize: "0.92rem" }}>
                  Level {player.accountLevel || 0}
                </div>

                {player.isHost && (
                  <div style={hostBadge}>
                    Host
                  </div>
                )}
              </div>
            ))}
          </div>

          {room?.latestResults?.length > 0 && (
            <>
              <h2 style={{ color: "white", marginTop: "24px" }}>Last Game Results</h2>
              <div style={{ display: "grid", gap: "10px" }}>
                {room.latestResults.map((entry, index) => (
                  <div key={entry.socketId} style={leaderboardRow}>
                    <span>
                      #{index + 1} {entry.username}
                    </span>
                    <span>
                      {entry.correctAnswers} correct • Streak {entry.highestStreak}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {message && <p style={{ color: "#fca5a5" }}>{message}</p>}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "22px" }}>
            {isHost && (
              <>
                <button style={primaryButton} onClick={handleStartGame}>
                  Start Game
                </button>

                <button style={dangerButton} onClick={handleDisbandRoom}>
                  Disband Room
                </button>
              </>
            )}

            {!isHost && (
              <button style={secondaryButton} onClick={handleLeaveRoom}>
                Leave Room
              </button>
            )}

            <button style={secondaryButton} onClick={() => navigate("/multiplayer")}>
              Back
            </button>
          </div>
        </div>
      </div>
    </GameChatPanel>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
  padding: "24px 380px 24px 24px",
  width: "100%",
  boxSizing: "border-box",
};

const panelStyle = {
  width: "100%",
  maxWidth: "1100px",
  margin: "0",
  background: "rgba(15,23,42,0.85)",
  padding: "28px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxSizing: "border-box",
};

const metaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
};

const metaCard = {
  background: "rgba(30,41,59,0.85)",
  padding: "16px",
  borderRadius: "14px",
  color: "white",
};

const playerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 220px))",
  justifyContent: "center", // 🔥 centers cards instead of stretching
  gap: "14px",
};

const playerCard = {
  background: "rgba(30,41,59,0.9)",
  borderRadius: "16px",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  aspectRatio: "1 / 1",   // 🔥 THIS makes it a square
  width: "100%",
  maxWidth: "220px",      // 🔥 controls size (tweak this)

  margin: "0 auto",       // 🔥 centers it if only 1 player
  padding: "16px",
};

const hostBadge = {
  marginTop: "8px",
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(250,204,21,0.16)",
  color: "#facc15",
  border: "1px solid rgba(250,204,21,0.35)",
  fontWeight: "bold",
};

const leaderboardRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "rgba(30,41,59,0.85)",
  color: "white",
};

const primaryButton = {
  padding: "12px 18px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const dangerButton = {
  padding: "12px 18px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "12px 18px",
  background: "transparent",
  color: "white",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "10px",
  cursor: "pointer",
};

export default MultiplayerRoomPage;
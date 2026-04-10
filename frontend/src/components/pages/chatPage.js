import React, { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../../service/socket";

const ChatPage = ({ roomId = "room-1" }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = connectSocket(token);

    socket.emit("chat_join_room", { roomId });

    socket.on("chat_receive_message", (incomingMessage) => {
      setMessages((prev) => [...prev, incomingMessage]);
    });

    socket.on("chat_error", (error) => {
      console.error("Chat error:", error.message);
    });

    return () => {
      socket.emit("chat_leave_room", { roomId });
      socket.off("chat_receive_message");
      socket.off("chat_error");
      disconnectSocket();
    };
  }, [roomId]);

  const sendMessage = () => {
    const socket = getSocket();
    if (!socket || !message.trim()) return;

    socket.emit("chat_send_text_message", {
      roomId,
      message,
    });

    setMessage("");
  };

  const sendPreset = (preset) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("chat_send_preset_message", {
      roomId,
      preset,
    });
  };

  const sendEmoji = (emoji) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("chat_send_emoji", {
      roomId,
      emoji,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Chat Test</h3>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          minHeight: "200px",
          padding: "10px",
          marginBottom: "10px",
          background: "white",
          color: "black",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "8px" }}>
            <strong>{msg.username}</strong> [{msg.type}]: {msg.content}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        style={{ marginRight: "10px", padding: "8px" }}
      />
      <button onClick={sendMessage}>Send</button>

      <div style={{ marginTop: "12px" }}>
        <button onClick={() => sendPreset("Good luck!")}>Good luck!</button>
        <button onClick={() => sendPreset("Nice one!")} style={{ marginLeft: "8px" }}>
          Nice one!
        </button>
      </div>

      <div style={{ marginTop: "12px" }}>
        <button onClick={() => sendEmoji("🔥")}>🔥</button>
        <button onClick={() => sendEmoji("😂")} style={{ marginLeft: "8px" }}>
          😂
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
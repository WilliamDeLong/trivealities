import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../App";
import getUserInfo from "../../utilities/decodeJwt";
import { connectSocket, getSocket } from "../../services/socket";
import ChatMessageItem from "./chatMessageItem";
import ChatToast from "./ChatToast";
import CHAT_PRESETS from "./constants/chatPresets";
import CHAT_EMOJIS from "./constants/chatEmojis";
import "./gameChatPanel.css";

const GameChatPanel = ({ roomId, children, allowFreeChat = false }) => {
  const { isLightMode } = useContext(UserContext);
  const currentUser = useMemo(() => getUserInfo(), []);
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [textMessage, setTextMessage] = useState("");
  const endRef = useRef(null);

  const storageKey = `chat-history-${roomId}`;

  useEffect(() => {
    if (!roomId) return;

    try {
      const savedMessages = sessionStorage.getItem(storageKey);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load chat history from sessionStorage:", error);
      setMessages([]);
    }
  }, [roomId, storageKey]);

  useEffect(() => {
    if (!roomId) return;

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history to sessionStorage:", error);
    }
  }, [messages, roomId, storageKey]);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = connectSocket(token);

    socket.emit("chat_join_room", { roomId });

    const handleReceiveMessage = async (incomingMessage) => {
      if (incomingMessage.roomId !== roomId) return;

      setMessages((prev) => {
        const alreadyExists = prev.some((msg) => msg.id === incomingMessage.id);
        if (alreadyExists) return prev;
        return [...prev, incomingMessage];
      });

      const isSystem = incomingMessage.type === "system";

      if (!isOpen && !isSystem) {
        setUnreadCount((prev) => prev + 1);
      }

      if (isSystem) {
        let profileUrl = "/user-icon.png";

        if (incomingMessage.userId) {
          try {
            const res = await fetch(`http://localhost:8081/user/${incomingMessage.userId}`);
            if (res.ok) {
              const data = await res.json();
              profileUrl = data?.user?.profileImage?.imageUrl || "/user-icon.png";
            }
          } catch (error) {
            console.error("Failed to fetch toast profile image:", error);
          }
        }

        const toastId = `${incomingMessage.id}-toast`;

        setToasts((prev) => [
          ...prev,
          {
            id: toastId,
            username: incomingMessage.username,
            text: incomingMessage.systemType === "join" ? "joined the chat" : "left the chat",
            profileUrl,
          },
        ]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
        }, 2500);
      }
    };

    const handleRoomUsers = ({ roomId: updatedRoomId, users }) => {
      if (updatedRoomId !== roomId) return;
      setOnlineCount(users?.length || 0);
    };

    const handleChatError = (error) => {
      console.error("Chat error:", error.message);
    };

    socket.on("chat_receive_message", handleReceiveMessage);
    socket.on("chat_room_users", handleRoomUsers);
    socket.on("chat_error", handleChatError);

    return () => {
      socket.emit("chat_leave_room", { roomId });
      socket.off("chat_receive_message", handleReceiveMessage);
      socket.off("chat_room_users", handleRoomUsers);
      socket.off("chat_error", handleChatError);
    };
  }, [roomId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => [...prev]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendTextMessage = () => {
    const socket = getSocket();
    const trimmedMessage = textMessage.trim();

    if (!socket || !roomId || !trimmedMessage) return;
    if (trimmedMessage.length > 120) return;

    socket.emit("chat_send_text_message", {
      roomId,
      message: trimmedMessage,
    });

    setTextMessage("");
  };

  const handleTextKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const sendPreset = (preset) => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    socket.emit("chat_send_preset_message", {
      roomId,
      preset,
    });
  };

  const sendEmoji = (emoji) => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    socket.emit("chat_send_emoji", {
      roomId,
      emoji,
    });
  };

  return (
    <div className="game-layout">
      <div className={`game-content ${isOpen ? "with-chat" : ""}`}>
        {children}
      </div>

      <div className="chat-toast-stack">
        {toasts.map((toast) => (
          <ChatToast key={toast.id} toast={toast} isLightMode={isLightMode} />
        ))}
      </div>

      {isOpen ? (
        <aside className={`game-chat-panel ${isLightMode ? "light" : "dark"}`}>
          <div className="game-chat-header">
            <div className="game-chat-title">
              <h3>Game Chat</h3>
              <span>{onlineCount} online</span>
            </div>

            <div className="game-chat-actions">
              <button
                className="game-chat-icon-btn"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="game-chat-body">
            {messages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                isOwnMessage={message.userId === currentUser?.id}
              />
            ))}
            <div ref={endRef} />
          </div>

          <div className="game-chat-controls">
            {allowFreeChat && (
              <div>
                <div className="chat-section-label">Message</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value.slice(0, 120))}
                    onKeyDown={handleTextKeyDown}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: "none",
                      outline: "none",
                      background: isLightMode ? "#ffffff" : "#374151",
                      color: isLightMode ? "#111827" : "#f9fafb",
                    }}
                  />
                  <button
                    type="button"
                    onClick={sendTextMessage}
                    className="chat-preset-btn"
                  >
                    Send
                  </button>
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "0.75rem",
                    opacity: 0.7,
                  }}
                >
                  {textMessage.length}/120
                </div>
              </div>
            )}

            <div>
              <div className="chat-section-label">Quick messages</div>
              <div className="chat-preset-row">
                {CHAT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    className="chat-preset-btn"
                    type="button"
                    onClick={() => sendPreset(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="chat-section-label">Reactions</div>
              <div className="chat-emoji-row">
                {CHAT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className="chat-emoji-btn"
                    type="button"
                    onClick={() => sendEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      ) : (
        <button
          type="button"
          className={`chat-closed-button ${isLightMode ? "light" : "dark"}`}
          onClick={() => setIsOpen(true)}
        >
          Open Chat
          {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount}</span>}
        </button>
      )}
    </div>
  );
};

export default GameChatPanel;
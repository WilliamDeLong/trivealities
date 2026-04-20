import React, { useContext } from "react";
import { UserContext } from "../../App";
import GameChatPanel from "../chat/GameChatPanel";

const ChatPage = () => {
  const { isLightMode } = useContext(UserContext);

  return (
    <GameChatPanel roomId="room-1" allowFreeChat={true}>
      <div
        style={{
          minHeight: "100vh",
          background: isLightMode
            ? "linear-gradient(135deg, #f8fafc, #dbeafe, #ede9fe)"
            : "linear-gradient(135deg, #020617, #0f172a, #1e1b4b)",
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            background: isLightMode
              ? "rgba(255,255,255,0.78)"
              : "rgba(15,23,42,0.88)",
            padding: "32px",
            borderRadius: "22px",
            border: isLightMode
              ? "1px solid rgba(0,0,0,0.08)"
              : "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "10px",
              color: isLightMode ? "#7c3aed" : "#00d0ff",
            }}
          >
            Chat Demo Page
          </h1>

          <p
            style={{
              color: isLightMode ? "#374151" : "#cbd5e1",
              marginBottom: "24px",
              fontSize: "1rem",
            }}
          >
            This is a preview of the multiplayer side chat panel.
            The panel is open by default, can be closed, and supports
            preset messages, emojis, join/leave system messages, unread count,
            and theme-aware styling.
          </p>

          <div
            style={{
              display: "grid",
              gap: "14px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: isLightMode
                  ? "rgba(124,58,237,0.08)"
                  : "rgba(30,41,59,0.85)",
                color: isLightMode ? "#1f2937" : "white",
              }}
            >
              <strong>Demo Notes</strong>
              <div style={{ marginTop: "8px", opacity: 0.9 }}>
                • Right-side panel
                <br />
                • Open by default
                <br />
                • Close to a small unread-count button
                <br />
                • Preset messages only
                <br />
                • Emoji reactions
                <br />
                • Join/leave confirmations
                <br />
                • Profile image, username, and time since sent
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: isLightMode
                  ? "rgba(59,130,246,0.08)"
                  : "rgba(30,41,59,0.85)",
                color: isLightMode ? "#1f2937" : "white",
              }}
            >
              <strong>Test Tip</strong>
              <div style={{ marginTop: "8px", opacity: 0.9 }}>
                Open this page in another browser or incognito window with a
                different logged-in user and use the same room id to test live chat.
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameChatPanel>
  );
};

export default ChatPage;
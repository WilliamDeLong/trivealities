import React, { useEffect, useState } from "react";
import API_BASE from '../../api';

const timeAgo = (isoTime) => {
  const now = Date.now();
  const then = new Date(isoTime).getTime();
  const diffSeconds = Math.max(1, Math.floor((now - then) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}h ago`;
};

const ChatMessageItem = ({ message, isOwnMessage }) => {
  const [profileUrl, setProfileUrl] = useState("/user-icon.png");

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!message?.userId || message.type === "system") return;

      try {
        const res = await fetch(`${API_BASE}/user/${message.userId}`);
        if (!res.ok) return;
        const data = await res.json();
        const imageUrl = data?.user?.profileImage?.imageUrl;
        if (imageUrl) setProfileUrl(imageUrl);
      } catch (error) {
        console.error("Failed to fetch message profile image:", error);
      }
    };

    fetchProfileImage();
  }, [message]);

  if (message.type === "system") {
    return (
      <div className="chat-message-row system">
        <div className="chat-message-bubble system">{message.content}</div>
      </div>
    );
  }

  return (
    <div className={`chat-message-row ${isOwnMessage ? "own" : "other"}`}>
      <div className={`chat-message-bubble ${isOwnMessage ? "own" : "other"}`}>
        {!isOwnMessage && (
          <img
            src={profileUrl}
            alt={message.username}
            className="chat-avatar"
            onError={() => setProfileUrl("/user-icon.png")}
          />
        )}

        <div className="chat-message-content">
          <div className="chat-message-top">
            <span className="chat-username">{message.username}</span>
            <span className="chat-time">{timeAgo(message.createdAt)}</span>
          </div>
          <div className="chat-text">{message.content}</div>
        </div>

        {isOwnMessage && (
          <img
            src={profileUrl}
            alt={message.username}
            className="chat-avatar"
            onError={() => setProfileUrl("/user-icon.png")}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
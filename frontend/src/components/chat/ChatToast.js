import React from "react";

const ChatToast = ({ toast, isLightMode }) => {
  const profileUrl = toast.profileUrl || "/user-icon.png";

  return (
    <div className={`chat-toast ${isLightMode ? "light" : "dark"}`}>
      <div className="chat-toast-top">
        <img
          src={profileUrl}
          alt={toast.username}
          className="chat-avatar"
          onError={(e) => {
            e.currentTarget.src = "/user-icon.png";
          }}
        />
        <div className="chat-toast-text">
          <strong>{toast.username}</strong>
          <span>{toast.text}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatToast;
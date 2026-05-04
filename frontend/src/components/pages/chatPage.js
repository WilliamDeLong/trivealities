import React, { useEffect } from "react";
import GameChatPanel from "../chat/GameChatPanel";

const ChatPage = () => {
  useEffect(() => {
    sessionStorage.setItem("communityChatUnread", "0");
    window.dispatchEvent(
      new CustomEvent("community-chat-unread-updated", {
        detail: { unread: 0 },
      })
    );

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <GameChatPanel
      roomId="room-1"
      allowFreeChat={true}
      fullHeightPanel={true}
      fullScreenPanel={true}
      hideCloseButton={true}
      panelSideInset={12}
      subHeaderText="Disclaimer: opinions in this chat may be spicy, unserious, or typed before coffee."
    />
  );
};

export default ChatPage;
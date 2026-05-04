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
      panelSideInset={0}
      panelTopOffset={64}
      subHeaderText="disclaimer: Trivealities is in no way responsible for communication in this chat. If offended, please contact the trivia police at 1-800-TRIVIA-HELP. Remember to play nice and keep it trivia-friendly!"
    />
  );
};

export default ChatPage;
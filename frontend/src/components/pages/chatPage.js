import React, { useContext, useEffect } from "react";
import { UserContext } from "../../App";
import GameChatPanel from "../chat/GameChatPanel";

const ChatPage = () => {
  const { isLightMode } = useContext(UserContext);

  useEffect(() => {
    sessionStorage.setItem("communityChatUnread", "0");
    window.dispatchEvent(
      new CustomEvent("community-chat-unread-updated", {
        detail: { unread: 0 },
      })
    );
  }, []);

  return (
    <GameChatPanel
      roomId="room-1"
      allowFreeChat={true}
      fullHeightPanel={true}
      fullScreenPanel={true}
    >
    </GameChatPanel>
  );
};

export default ChatPage;
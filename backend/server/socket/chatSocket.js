const CHAT_PRESETS = require("../constants/chatPresets");
const CHAT_EMOJIS = require("../constants/chatEmojis");

const activeRoomUsers = new Map();

const buildMessage = ({ roomId, userId, username, type, content }) => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    roomId,
    userId,
    username,
    type, // "text" | "preset" | "emoji"
    content,
    createdAt: new Date().toISOString(),
  };
};

const addUserToRoom = (roomId, user) => {
  if (!activeRoomUsers.has(roomId)) {
    activeRoomUsers.set(roomId, new Map());
  }

  activeRoomUsers.get(roomId).set(user.id, {
    userId: user.id,
    username: user.username,
  });
};

const removeUserFromRoom = (roomId, userId) => {
  if (!activeRoomUsers.has(roomId)) return;

  activeRoomUsers.get(roomId).delete(userId);

  if (activeRoomUsers.get(roomId).size === 0) {
    activeRoomUsers.delete(roomId);
  }
};

const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Chat socket connected: ${socket.id} (${socket.user.username})`);

    socket.on("chat_join_room", ({ roomId }) => {
      try {
        if (!roomId || typeof roomId !== "string") {
          return socket.emit("chat_error", { message: "Valid roomId is required." });
        }

        socket.join(roomId);
        socket.currentChatRoomId = roomId;

        addUserToRoom(roomId, socket.user);

        socket.emit("chat_room_joined", {
          roomId,
          message: `Joined chat room ${roomId}`,
        });

        io.to(roomId).emit("chat_room_users", {
          roomId,
          users: Array.from(activeRoomUsers.get(roomId)?.values() || []),
        });
      } catch (error) {
        socket.emit("chat_error", { message: error.message });
      }
    });

    socket.on("chat_leave_room", ({ roomId }) => {
      try {
        if (!roomId || typeof roomId !== "string") return;

        socket.leave(roomId);
        removeUserFromRoom(roomId, socket.user.id);

        io.to(roomId).emit("chat_room_users", {
          roomId,
          users: Array.from(activeRoomUsers.get(roomId)?.values() || []),
        });
      } catch (error) {
        socket.emit("chat_error", { message: error.message });
      }
    });

    socket.on("chat_send_text_message", ({ roomId, message }) => {
      try {
        if (!roomId || typeof roomId !== "string") {
          return socket.emit("chat_error", { message: "Valid roomId is required." });
        }

        if (!message || typeof message !== "string") {
          return socket.emit("chat_error", { message: "Message must be a string." });
        }

        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
          return socket.emit("chat_error", { message: "Message cannot be empty." });
        }

        if (trimmedMessage.length > 120) {
          return socket.emit("chat_error", {
            message: "Message cannot be longer than 120 characters.",
          });
        }

        const payload = buildMessage({
          roomId,
          userId: socket.user.id,
          username: socket.user.username,
          type: "text",
          content: trimmedMessage,
        });

        io.to(roomId).emit("chat_receive_message", payload);
      } catch (error) {
        socket.emit("chat_error", { message: error.message });
      }
    });

    socket.on("chat_send_preset_message", ({ roomId, preset }) => {
      try {
        if (!roomId || typeof roomId !== "string") {
          return socket.emit("chat_error", { message: "Valid roomId is required." });
        }

        if (!CHAT_PRESETS.includes(preset)) {
          return socket.emit("chat_error", { message: "Invalid preset message." });
        }

        const payload = buildMessage({
          roomId,
          userId: socket.user.id,
          username: socket.user.username,
          type: "preset",
          content: preset,
        });

        io.to(roomId).emit("chat_receive_message", payload);
      } catch (error) {
        socket.emit("chat_error", { message: error.message });
      }
    });

    socket.on("chat_send_emoji", ({ roomId, emoji }) => {
      try {
        if (!roomId || typeof roomId !== "string") {
          return socket.emit("chat_error", { message: "Valid roomId is required." });
        }

        if (!CHAT_EMOJIS.includes(emoji)) {
          return socket.emit("chat_error", { message: "Invalid emoji." });
        }

        const payload = buildMessage({
          roomId,
          userId: socket.user.id,
          username: socket.user.username,
          type: "emoji",
          content: emoji,
        });

        io.to(roomId).emit("chat_receive_message", payload);
      } catch (error) {
        socket.emit("chat_error", { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      if (socket.currentChatRoomId) {
        removeUserFromRoom(socket.currentChatRoomId, socket.user.id);

        io.to(socket.currentChatRoomId).emit("chat_room_users", {
          roomId: socket.currentChatRoomId,
          users: Array.from(activeRoomUsers.get(socket.currentChatRoomId)?.values() || []),
        });
      }

      console.log(`Chat socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupChatSocket;
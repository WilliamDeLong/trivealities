import { io } from "socket.io-client";
import API_BASE from "../api";

let socket = null;

export const connectSocket = (token) => {
  if (socket && socket.connected) return socket;

  socket = io(API_BASE, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
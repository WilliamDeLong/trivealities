import { io } from "socket.io-client";
import API_BASE from "./api";

const socket = io(API_BASE, {
  transports: ["websocket"],
  auth: {
    token: localStorage.getItem("accessToken"),
  },
  autoConnect: false, // IMPORTANT
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.auth = {
      token: localStorage.getItem("accessToken"),
    };
    socket.connect();
  }
};

export default socket;
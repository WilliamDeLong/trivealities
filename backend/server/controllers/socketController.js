module.exports = (io, rooms, generateRoomCode) => {
  io.on("connection", (socket) => {

    // CREATE ROOM
    socket.on("create_room", ({ username, userId } = {}, callback) => {
      if (!username || !username.trim()) {
        if (typeof callback === "function") {
          return callback({ success: false });
        }
        return;
      }

      let roomCode;
      do {
        roomCode = generateRoomCode();
      } while (rooms[roomCode]);

      rooms[roomCode] = {
        roomCode,
        hostId: socket.id,
        players: [{
          socketId: socket.id,
          userId: userId || null,
          username: username.trim(),
          score: 0,
          answered: false
        }],
        gameState: "lobby"
      };

      socket.join(roomCode);

      if (typeof callback === "function") {
        callback({ success: true, roomCode, room: rooms[roomCode] });
      }
    });

    // JOIN ROOM
    socket.on("join_room", ({ roomCode, username, userId } = {}, callback) => {
      if (!roomCode || !username || !username.trim()) {
        if (typeof callback === "function") {
          return callback({ success: false });
        }
        return;
      }

      const room = rooms[roomCode];
      if (!room || !room.players || !Array.isArray(room.players)) {
        if (typeof callback === "function") {
          return callback({ success: false });
        }
        return;
      }

      const newPlayer = {
        socketId: socket.id,
        userId: userId || null,
        username: username.trim(),
        score: 0,
        answered: false
      };

      room.players.push(newPlayer);
      socket.join(roomCode);

      if (typeof callback === "function") {
        callback({ success: true, room });
      }
    });

    // LEAVE ROOM
    socket.on("leave_room", ({ roomCode } = {}, callback) => {
      const room = rooms[roomCode];
      if (!room || !room.players || !Array.isArray(room.players)) {
        if (typeof callback === "function") {
          return callback({ success: false });
        }
        return;
      }

      const index = room.players.findIndex((p) => p.socketId === socket.id);
      if (index === -1) {
        if (typeof callback === "function") {
          return callback({ success: false });
        }
        return;
      }

      room.players.splice(index, 1);
      socket.leave(roomCode);

      if (room.players.length === 0) {
        delete rooms[roomCode];
        if (typeof callback === "function") {
          return callback({ success: true });
        }
        return;
      }

      if (room.hostId === socket.id) {
        room.hostId = room.players[0].socketId;
      }

      if (typeof callback === "function") {
        callback({ success: true });
      }
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      for (const code in rooms) {
        const room = rooms[code];

        if (!room || !room.players || !Array.isArray(room.players)) {
          continue;
        }

        const index = room.players.findIndex((p) => p.socketId === socket.id);

        if (index !== -1) {
          room.players.splice(index, 1);

          if (room.players.length === 0) {
            delete rooms[code];
          } else if (room.hostId === socket.id) {
            room.hostId = room.players[0].socketId;
          }

          break;
        }
      }
    });

  });
};
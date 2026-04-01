module.exports = (io, rooms, generateRoomCode) => {
  io.on("connection", (socket) => {

    // CREATE ROOM
    socket.on("create_room", ({ username, userId }, callback) => {
      if (!username || !username.trim()) {
        return callback({ success: false });
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
      callback({ success: true, roomCode, room: rooms[roomCode] });
    });

    // JOIN ROOM
    socket.on("join_room", ({ roomCode, username, userId }, callback) => {
      if (!roomCode || !username || !username.trim()) {
        return callback({ success: false });
      }

      const room = rooms[roomCode];
      if (!room) return callback({ success: false });

      const newPlayer = {
        socketId: socket.id,
        userId: userId || null,
        username: username.trim(),
        score: 0,
        answered: false
      };

      room.players.push(newPlayer);
      socket.join(roomCode);

      callback({ success: true, room });
    });

    // LEAVE ROOM
    socket.on("leave_room", ({ roomCode }, callback) => {
      const room = rooms[roomCode];
      if (!room) return callback({ success: false });

      const index = room.players.findIndex(p => p.socketId === socket.id);
      if (index === -1) return callback({ success: false });

      room.players.splice(index, 1);

      if (room.players.length === 0) {
        delete rooms[roomCode];
        return callback({ success: true });
      }

      if (room.hostId === socket.id) {
        room.hostId = room.players[0].socketId;
      }

      callback({ success: true });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      for (const code in rooms) {
        const room = rooms[code];
        const index = room.players.findIndex(p => p.socketId === socket.id);

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
const axios = require("axios");
const he = require("he");
const QUESTION_TIME = 20;
const {
  createRoom,
  getRoom,
  getPublicRooms,
  addPlayerToRoom,
  removePlayerFromRoom,
  disbandRoom,
  setRoomStatus,
  updatePlayerAnswerStats,
  finalizeGameResults,
  findRoomBySocketId,
  setRoomQuestions,
} = require("./multiplayerRooms");


const shuffleArray = (array) => {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
};
const emitRoomList = (io) => {
  io.emit("multiplayer_rooms_updated", getPublicRooms());
};

const emitRoomState = (io, room) => {
  if (!room) return;

  io.to(room.roomCode).emit("room_updated", {
    roomCode: room.roomCode,
    roomName: room.roomName,
    questionSource: room.questionSource,
    maxPlayers: room.maxPlayers,
    questionCount: room.questionCount,
    playerCount: room.players.length,
    status: room.status,
    players: room.players.map((player) => ({
      socketId: player.socketId,
      userId: player.userId,
      username: player.username,
      profileImage: player.profileImage,
      accountLevel: player.accountLevel,
      isHost: player.isHost,
    })),
    latestResults: room.latestResults || [],
    highestStreakHolder: room.highestStreakHolder || null,
  });
};
function startQuestionTimer(io, roomCode) {
  const room = getRoom(roomCode);
  if (!room) return;

  if (room.questionTimer) {
    clearInterval(room.questionTimer);
  }

  room.questionTimeLeft = QUESTION_TIME;
  room.answersReceived = {};

  io.to(roomCode).emit("question_update", {
    roomCode,
    questionIndex: room.currentQuestionIndex,
    timeLeft: room.questionTimeLeft,
  });

  room.questionTimer = setInterval(() => {
    const activeRoom = getRoom(roomCode);
    if (!activeRoom) return;

    activeRoom.questionTimeLeft--;

    io.to(roomCode).emit("timer_tick", {
      roomCode,
      timeLeft: activeRoom.questionTimeLeft,
    });

    if (activeRoom.questionTimeLeft <= 0) {
      clearInterval(activeRoom.questionTimer);
      activeRoom.questionTimer = null;

      moveToNextQuestionOrFinish(io, roomCode);
    }
  }, 1000);
}
function moveToNextQuestionOrFinish(io, roomCode) {
  const room = getRoom(roomCode);
  if (!room) return;

  const isLast =
    room.currentQuestionIndex >= room.questions.length - 1;

  if (isLast) {
    const result = finalizeGameResults(roomCode);

    if (!result) return;

    io.to(roomCode).emit("multiplayer_game_finished", {
      roomCode,
      leaderboard: result.leaderboard,
      highestStreakHolder: result.highestStreakHolder,
    });

    return;
  }

  room.currentQuestionIndex++;

  startQuestionTimer(io, roomCode);
}
const registerMultiplayerHandlers = (io, socket) => {
  socket.on("get_multiplayer_rooms", (callback) => {
    const rooms = getPublicRooms();
    if (callback) callback({ success: true, rooms });
  });

socket.on("get_multiplayer_room_by_code", ({ roomCode }, callback) => {
  const room = getRoom(roomCode);

  if (!room) {
    return callback?.({
      success: false,
      message: "Room not found",
    });
  }

  callback?.({
    success: true,
    room: {
      roomCode: room.roomCode,
      roomName: room.roomName,
      questionSource: room.questionSource,
      maxPlayers: room.maxPlayers,
      questionCount: room.questionCount,
      playerCount: room.players.length,
      status: room.status,
      players: room.players.map((player) => ({
        socketId: player.socketId,
        userId: player.userId,
        username: player.username,
        profileImage: player.profileImage,
        accountLevel: player.accountLevel,
        isHost: player.isHost,
      })),
      latestResults: room.latestResults || [],
      highestStreakHolder: room.highestStreakHolder || null,

      // 🔥 ADD THESE TWO LINES
      questions: room.questions || [],
      currentQuestionIndex: room.currentQuestionIndex || 0,
    },
  });
});

  socket.on("create_multiplayer_room", (payload, callback) => {
        console.log("create_multiplayer_room received:", payload);
        console.log("socket user in create room:", socket.user);
    try {
      const room = createRoom({
        hostSocketId: socket.id,
        hostUserId: payload.userId || null,
        hostUsername: payload.username,
        hostProfileImage: payload.profileImage || "",
        hostLevel: payload.accountLevel || 0,
        roomName: payload.roomName,
        questionSource: payload.questionSource,
        maxPlayers: payload.maxPlayers,
        questionCount: payload.questionCount,
      });

      socket.join(room.roomCode);

      emitRoomList(io);
      emitRoomState(io, room);

      if (callback) {
        callback({
          success: true,
          roomCode: room.roomCode,
          room,
        });
      }
    } catch (error) {
      if (callback) {
        callback({
          success: false,
          message: error.message || "Could not create room",
        });
      }
    }
  });

  socket.on("join_multiplayer_room", (payload, callback) => {
    try {
      const room = getRoom(payload.roomCode);

      if (!room) {
        return callback?.({
          success: false,
          message: "Room not found",
        });
      }

      if (String(payload.enteredCode) !== String(room.roomCode)) {
        return callback?.({
          success: false,
          message: "Incorrect room code",
        });
      }

      const updatedRoom = addPlayerToRoom({
        roomCode: room.roomCode,
        socketId: socket.id,
        userId: payload.userId || null,
        username: payload.username,
        profileImage: payload.profileImage || "",
        accountLevel: payload.accountLevel || 0,
      });

      socket.join(updatedRoom.roomCode);

      emitRoomList(io);
      emitRoomState(io, updatedRoom);

      callback?.({
        success: true,
        roomCode: updatedRoom.roomCode,
        room: updatedRoom,
      });
    } catch (error) {
      callback?.({
        success: false,
        message: error.message || "Could not join room",
      });
    }
  });

  socket.on("leave_multiplayer_room", ({ roomCode }, callback) => {
    const result = removePlayerFromRoom(roomCode, socket.id);
    socket.leave(roomCode);

    if (!result) {
      return callback?.({ success: false, message: "Room not found" });
    }

    if (result.deleted) {
      emitRoomList(io);
      return callback?.({ success: true, deleted: true });
    }

    emitRoomList(io);
    emitRoomState(io, result.room);

    callback?.({
      success: true,
      deleted: false,
      roomCode: result.room.roomCode,
    });
  });

  socket.on("disband_multiplayer_room", ({ roomCode }, callback) => {
    const room = getRoom(roomCode);

    if (!room) {
      return callback?.({ success: false, message: "Room not found" });
    }

    if (room.hostSocketId !== socket.id) {
      return callback?.({
        success: false,
        message: "Only the host can disband this room",
      });
    }

    io.to(room.roomCode).emit("room_disbanded", {
      roomCode,
      message: "The host disbanded the room",
    });

    room.players.forEach((player) => {
      const client = io.sockets.sockets.get(player.socketId);
      client?.leave(room.roomCode);
    });

    disbandRoom(roomCode);
    emitRoomList(io);

    callback?.({ success: true });
  });

  socket.on("start_multiplayer_game", async ({ roomCode }, callback) => {
  const room = getRoom(roomCode);

  if (!room) {
    return callback?.({ success: false, message: "Room not found" });
  }

  if (room.hostSocketId !== socket.id) {
    return callback?.({
      success: false,
      message: "Only the host can start the game",
    });
  }

  try {
    let questions = [];

    if (room.questionSource === "opentdb") {
      const url = `https://opentdb.com/api.php?amount=${room.questionCount}&type=multiple`;
      const response = await axios.get(url);

      if (response.data.response_code !== 0) {
        return callback?.({
          success: false,
          message: "Could not fetch questions from OpenTriviaDB",
        });
      }

      questions = response.data.results.map((q, index) => {
        const correctAnswer = he.decode(q.correct_answer);
        const incorrectAnswers = q.incorrect_answers.map((a) => he.decode(a));

        return {
          id: `${index}-${correctAnswer}`,
          question: he.decode(q.question),
          category: he.decode(q.category),
          difficulty: he.decode(q.difficulty),
          correctAnswer,
          answers: shuffleArray([correctAnswer, ...incorrectAnswers]),
        };
      });
    }

    // database mode can be added here later
    if (room.questionSource === "database") {
      return callback?.({
        success: false,
        message: "Database question mode is not connected yet.",
      });
    }

    setRoomQuestions(roomCode, questions);
    setRoomStatus(roomCode, "in-game");

    const updatedRoom = getRoom(roomCode);

    emitRoomList(io);
    emitRoomState(io, updatedRoom);

    io.to(roomCode).emit("multiplayer_game_started", {
      
      roomCode,
      questionSource: updatedRoom.questionSource,
      questionCount: updatedRoom.questionCount,
      questions: updatedRoom.questions,
    });
    // ✅ START TIMER
    startQuestionTimer(io, roomCode);

    callback?.({ success: true });
  } catch (error) {
    console.log("start_multiplayer_game error:", error.message);
    callback?.({
      success: false,
      message: "Failed to start multiplayer game",
    });
  }
});
socket.on("submit_multiplayer_answer_result", ({ roomCode, isCorrect }) => {
  const room = getRoom(roomCode);
  if (!room) return;

  // prevent double answering
  if (!room.answersReceived) room.answersReceived = {};

  if (room.answersReceived[socket.id]) return;

  room.answersReceived[socket.id] = true;

  updatePlayerAnswerStats({
    roomCode,
    socketId: socket.id,
    isCorrect,
  });

  const totalPlayers = room.players.length;
  const answeredCount = Object.keys(room.answersReceived).length;

  // if everyone answered early → skip timer
  if (answeredCount >= totalPlayers) {
    clearInterval(room.questionTimer);
    room.questionTimer = null;

    setTimeout(() => {
      moveToNextQuestionOrFinish(io, roomCode);
    }, 1200);
  }
});
  
  socket.on("disconnect", () => {
    const room = findRoomBySocketId(socket.id);
    if (!room) return;

    const result = removePlayerFromRoom(room.roomCode, socket.id);

    if (!result) return;

    if (result.deleted) {
      emitRoomList(io);
      return;
    }

    emitRoomList(io);
    emitRoomState(io, result.room);
  });
};

module.exports = registerMultiplayerHandlers;
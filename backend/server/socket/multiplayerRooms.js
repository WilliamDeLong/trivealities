const rooms = {};

const MAX_GLOBAL_ROOM_SIZE = 10;

const generateRoomCode = () => {
  let code;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms[code]);
  return code;
};

const sanitizeQuestionSource = (value) => {
  return value === "database" ? "database" : "opentdb";
};

const normalizeRoomSize = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  if (parsed < 2 || parsed > MAX_GLOBAL_ROOM_SIZE) return null;
  return parsed;
};

const createRoom = ({
  hostSocketId,
  hostUserId = null,
  hostUsername,
  hostProfileImage = "",
  hostLevel = 0,
  roomName,
  questionSource,
  maxPlayers,
  questionCount,
}) => {
  const normalizedMaxPlayers = normalizeRoomSize(maxPlayers);
  const normalizedQuestionCount = Number(questionCount);

  if (!hostUsername || !hostUsername.trim()) {
    throw new Error("Host username is required");
  }

  if (!normalizedMaxPlayers) {
    throw new Error("Room size must be between 2 and 10");
  }

  if (
    !Number.isInteger(normalizedQuestionCount) ||
    normalizedQuestionCount < 1 ||
    normalizedQuestionCount > 20
  ) {
    throw new Error("Question count must be between 1 and 20");
  }

  const roomCode = generateRoomCode();

  const hostPlayer = {
    socketId: hostSocketId,
    userId: hostUserId,
    username: hostUsername.trim(),
    profileImage: hostProfileImage || "",
    accountLevel: Number(hostLevel) || 0,
    isHost: true,
    correctAnswers: 0,
    highestStreak: 0,
    currentStreak: 0,
  };

  rooms[roomCode] = {
    roomCode,
    roomName: roomName?.trim() || `${hostUsername.trim()}'s room`,
    hostSocketId,
    hostUserId: hostUserId || null,
    questionSource: sanitizeQuestionSource(questionSource),
    maxPlayers: normalizedMaxPlayers,
    questionCount: normalizedQuestionCount,
    players: [hostPlayer],
    status: "lobby",
    createdAt: Date.now(),
    latestResults: [],
    highestStreakHolder: null,
    questions: [],
    currentQuestionIndex: 0,
    questionTimer: null,
    questionTimeLeft: 20,
    answersReceived: {},
  };

  return rooms[roomCode];
};

const getPublicRooms = () => {
  return Object.values(rooms)
    .filter((room) => room.status === "lobby")
    .map((room) => ({
      roomCode: room.roomCode,
      roomName: room.roomName,
      hostUsername:
        room.players.find((player) => player.isHost)?.username || "Host",
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      questionSource: room.questionSource,
      questionCount: room.questionCount,
      status: room.status,
    }));
};

const getRoom = (roomCode) => rooms[roomCode];

const addPlayerToRoom = ({
  roomCode,
  socketId,
  userId = null,
  username,
  profileImage = "",
  accountLevel = 0,
}) => {
  const room = rooms[roomCode];

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.status !== "lobby") {
    throw new Error("This room is not accepting players right now");
  }

  if (room.players.length >= room.maxPlayers) {
    throw new Error("Room is full");
  }

  const alreadyExists = room.players.some(
    (player) => player.socketId === socketId || player.userId === userId
  );

  if (alreadyExists) {
    return room;
  }

  room.players.push({
    socketId,
    userId,
    username: username?.trim() || "Player",
    profileImage: profileImage || "",
    accountLevel: Number(accountLevel) || 0,
    isHost: false,
    correctAnswers: 0,
    highestStreak: 0,
    currentStreak: 0,
  });

  return room;
};

const removePlayerFromRoom = (roomCode, socketId) => {
  const room = rooms[roomCode];
  if (!room) return null;

  const leavingPlayer = room.players.find((player) => player.socketId === socketId);
  room.players = room.players.filter((player) => player.socketId !== socketId);

  if (room.players.length === 0) {
    delete rooms[roomCode];
    return { deleted: true, room: null, leavingPlayer };
  }

  if (room.hostSocketId === socketId) {
    const newHost = room.players[0];
    newHost.isHost = true;
    room.hostSocketId = newHost.socketId;
    room.hostUserId = newHost.userId || null;
    room.players = room.players.map((player) => ({
      ...player,
      isHost: player.socketId === newHost.socketId,
    }));
  }

  return { deleted: false, room, leavingPlayer };
};

const disbandRoom = (roomCode) => {
  const room = rooms[roomCode];
  if (!room) return null;
  delete rooms[roomCode];
  return room;
};

const setRoomStatus = (roomCode, status) => {
  const room = rooms[roomCode];
  if (!room) return null;
  room.status = status;
  return room;
};

const updatePlayerAnswerStats = ({ roomCode, socketId, isCorrect }) => {
  const room = rooms[roomCode];
  if (!room) return null;

  const player = room.players.find((entry) => entry.socketId === socketId);
  if (!player) return null;

  if (isCorrect) {
    player.correctAnswers += 1;
    player.currentStreak += 1;
    if (player.currentStreak > player.highestStreak) {
      player.highestStreak = player.currentStreak;
    }
  } else {
    player.currentStreak = 0;
  }

  return room;
};

const finalizeGameResults = (roomCode) => {
  const room = rooms[roomCode];
  if (!room) return null;

  const leaderboard = [...room.players]
    .map((player) => ({
      socketId: player.socketId,
      userId: player.userId,
      username: player.username,
      profileImage: player.profileImage,
      accountLevel: player.accountLevel,
      isHost: player.isHost,
      correctAnswers: player.correctAnswers,
      highestStreak: player.highestStreak,
    }))
    .sort((a, b) => {
      if (b.correctAnswers !== a.correctAnswers) {
        return b.correctAnswers - a.correctAnswers;
      }
      return b.highestStreak - a.highestStreak;
    });

  const topStreakPlayer = [...leaderboard].sort(
    (a, b) => b.highestStreak - a.highestStreak
  )[0] || null;

  room.latestResults = leaderboard;
  room.highestStreakHolder = topStreakPlayer;
  room.status = "lobby";

  room.players = room.players.map((player) => ({
    ...player,
    correctAnswers: 0,
    currentStreak: 0,
    highestStreak: 0,
  }));

  return {
    room,
    leaderboard,
    highestStreakHolder: topStreakPlayer,
  };
};

const findRoomBySocketId = (socketId) => {
  return Object.values(rooms).find((room) =>
    room.players.some((player) => player.socketId === socketId)
  );
};
const setRoomQuestions = (roomCode, questions) => {
  const room = rooms[roomCode];
  if (!room) return null;

  room.questions = questions;
  room.currentQuestionIndex = 0;
  
  room.questionTimeLeft = 20;
  room.answersReceived = {};

  if (room.questionTimer) {
    clearInterval(room.questionTimer);
    room.questionTimer = null;
  }

  return room;
};
module.exports = {
  rooms,
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

};
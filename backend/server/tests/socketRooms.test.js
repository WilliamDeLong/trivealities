const { io: Client } = require("socket.io-client");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const socketController = require("../controllers/socketController");

let io;
let server;
let client1;
let client2;
let port;

jest.setTimeout(5000);
const rooms = {};
function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

beforeAll((done) => {
  const app = express();
  server = http.createServer(app);

  io = new Server(server, {
    cors: { origin: "*" },
  });
    socketController(io, rooms, generateRoomCode);
  server.listen(() => {
    port = server.address().port;
    done();
  });
});

afterAll(() => {
  io.close();
  server.close();
});

afterEach(() => {
  if (client1?.connected) client1.disconnect();
  if (client2?.connected) client2.disconnect();

  Object.keys(rooms).forEach((k) => delete rooms[k]);
});

test("create room works", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.on("connect", () => {
    client1.emit("create_room", { username: "Host" }, (res) => {
      expect(res.success).toBe(true);
      expect(res.room.players.length).toBe(1);
      done();
    });
  });
});

test("join room works", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.once("connect", () => {
    client1.emit("create_room", { username: "Host" }, (res) => {
      const roomCode = res.roomCode;

      client2 = new Client(`http://localhost:${port}`, {
        autoConnect: false,
      });

      client2.once("connect", () => {
        client2.emit(
          "join_room",
          { roomCode, username: "Player2" },
          (joinRes) => {
            try {
              expect(joinRes.success).toBe(true);
              expect(joinRes.room.players.length).toBe(2);
              done();
            } catch (err) {
              done(err);
            }
          }
        );
      });

      client2.connect();
    });
  });
});

test("leave room works", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.on("connect", () => {
    client1.emit("create_room", { username: "Host" }, (res) => {
      const roomCode = res.roomCode;

      client1.emit("leave_room", { roomCode }, (leaveRes) => {
        expect(leaveRes.success).toBe(true);
        done();
      });
    });
  });
});

test("join non-existent room fails", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.once("connect", () => {
    client1.emit(
      "join_room",
      { roomCode: "FAKE01", username: "Player" },
      (res) => {
        expect(res.success).toBe(false);
        done();
      }
    );
  });
});

test("create room without username fails", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.once("connect", () => {
    client1.emit("create_room", { username: "" }, (res) => {
      expect(res.success).toBe(false);
      done();
    });
  });
});

test("join room without username fails", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.once("connect", () => {
    client1.emit("create_room", { username: "Host" }, (createRes) => {
      const roomCode = createRes.roomCode;

      client1.emit(
        "join_room",
        { roomCode, username: "" },
        (joinRes) => {
          try {
            expect(joinRes.success).toBe(false);
            done();
          } catch (err) {
            done(err);
          }
        }
      );
    });
  });
});

test("leave non-existent room fails", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.once("connect", () => {
    client1.emit("leave_room", { roomCode: "FAKE01" }, (res) => {
      expect(res.success).toBe(false);
      done();
    });
  });
});

test("multiple players join room", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.once("connect", () => {
    client1.emit("create_room", { username: "Host" }, (createRes) => {
      const roomCode = createRes.roomCode;

      client2 = new Client(`http://localhost:${port}`, { autoConnect: false });

      client2.once("connect", () => {
        client2.emit(
          "join_room",
          { roomCode, username: "Player2" },
          (joinRes) => {
            expect(joinRes.room.players.length).toBe(2);
            done();
          }
        );
      });

      client2.connect();
    });
  });
});

test("room deleted when last player leaves", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.once("connect", () => {
    client1.emit("create_room", { username: "Host" }, (res) => {
      const roomCode = res.roomCode;

      client1.emit("leave_room", { roomCode }, (leaveRes) => {
        try {
          expect(leaveRes.success).toBe(true);
          expect(rooms[roomCode]).toBeUndefined();
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});

test("host transfers when host leaves", (done) => {
  client1 = new Client(`http://localhost:${port}`);
  client2 = new Client(`http://localhost:${port}`, { autoConnect: false });

  client1.once("connect", () => {
    client1.emit("create_room", { username: "Host" }, (createRes) => {
      const roomCode = createRes.roomCode;

      client2.once("connect", () => {
        client2.emit(
          "join_room",
          { roomCode, username: "Player2" },
          () => {
            const newHostId = client2.id;

            client1.emit("leave_room", { roomCode }, () => {
              try {
                expect(rooms[roomCode].hostId).toBe(newHostId);
                done();
              } catch (err) {
                done(err);
              }
            });
          }
        );
      });

      client2.connect();
    });
  });
});

test("disconnect removes player and deletes room if empty", (done) => {
  client1 = new Client(`http://localhost:${port}`);

  client1.once("connect", () => {
    client1.emit("create_room", { username: "Host" }, (res) => {
      const roomCode = res.roomCode;

      client1.disconnect();

      // 🔥 wait a bit for server to process disconnect
      setTimeout(() => {
        try {
          expect(rooms[roomCode]).toBeUndefined();
          done();
        } catch (err) {
          done(err);
        }
      }, 50); // small delay fixes async issue
    });
  });
});
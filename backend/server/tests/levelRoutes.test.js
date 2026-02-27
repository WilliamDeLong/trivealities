const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const userAddXpRoute = require("../routes/userAddXp");
const userGetLevelsRoute = require("../routes/userGetLevels");
const User = require("../models/userModel");
console.log("Schema has accountLevel:", !!User.schema.paths.accountLevel);
console.log("Schema has accountXp:", !!User.schema.paths.accountXp);

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);

  app = express();
  app.use(express.json());

  app.use("/user", userAddXpRoute);
  app.use("/user", userGetLevelsRoute);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Account Level + XP System", () => {

  test("New user defaults to level 0 and xp 0", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(user.accountLevel).toBe(0);
    expect(user.accountXp).toBe(0);
  });

  test("Adds XP without leveling up", async () => {
    const user = await User.create({
      username: "xpuser",
      email: "xp@example.com",
      password: "password123",
    });

    const res = await request(app)
      .post(`/user/${user._id}/xp`)
      .send({ xp: 50 });

    expect(res.status).toBe(200);
    expect(res.body.accountLevel).toBe(0);
    expect(res.body.accountXp).toBe(50);
  });

test("Levels up correctly when 100 XP is reached", async () => {
  const user = await User.create({
    username: "leveluser",
    email: "level@example.com",
    password: "password123",
  });

  const res = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: 120 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(1);
  expect(res.body.accountXp).toBe(20);
});

test("Can level up multiple times with large XP", async () => {
  const user = await User.create({
    username: "multilevel",
    email: "multi@example.com",
    password: "password123",
  });

  const res = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: 260 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(2);
  expect(res.body.accountXp).toBe(60);
});

  test("Rejects invalid user ID", async () => {
    const res = await request(app)
      .post("/user/notanid/xp")
      .send({ xp: 10 });

    expect(res.status).toBe(400);
  });

  test("Rejects negative XP", async () => {
    const user = await User.create({
      username: "badxp",
      email: "badxp@example.com",
      password: "password123",
    });

    const res = await request(app)
      .post(`/user/${user._id}/xp`)
      .send({ xp: -20 });

    expect(res.status).toBe(400);
  });

  test("GET /user/levels returns sorted leaderboard", async () => {
    await User.create([
      { username: "a", email: "a@a.com", password: "password123", accountLevel: 2, accountXp: 5 },
      { username: "b", email: "b@b.com", password: "password123", accountLevel: 3, accountXp: 0 },
      { username: "c", email: "c@c.com", password: "password123", accountLevel: 2, accountXp: 50 },
    ]);

    const res = await request(app).get("/user/levels");

    expect(res.status).toBe(200);
    expect(res.body[0].username).toBe("b");
    expect(res.body[1].username).toBe("c");
    expect(res.body[2].username).toBe("a");
  });

  test("GET /user/:id/level returns correct data", async () => {
    const user = await User.create({
      username: "single",
      email: "single@example.com",
      password: "password123",
      accountLevel: 4,
      accountXp: 33,
    });

    const res = await request(app)
      .get(`/user/${user._id}/level`);

    expect(res.status).toBe(200);
    expect(res.body.accountLevel).toBe(4);
    expect(res.body.accountXp).toBe(33);
  });
test("Exactly 100 XP gives +1 level and 0 leftover XP", async () => {
  const user = await User.create({
    username: "exact100",
    email: "exact100@example.com",
    password: "password123",
  });

  const res = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: 100 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(1);
  expect(res.body.accountXp).toBe(0);
  expect(res.body.levelsGained).toBe(1);
});
test("XP carries over across multiple requests and levels up correctly", async () => {
  const user = await User.create({
    username: "multiReq",
    email: "multireq@example.com",
    password: "password123",
  });

  // Add 60 XP
  const res1 = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: 60 });

  expect(res1.status).toBe(200);
  expect(res1.body.accountLevel).toBe(0);
  expect(res1.body.accountXp).toBe(60);
  expect(res1.body.levelsGained).toBe(0);

  // Add 50 XP more -> total 110 => level 1, xp 10
  const res2 = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: 50 });

  expect(res2.status).toBe(200);
  expect(res2.body.accountLevel).toBe(1);
  expect(res2.body.accountXp).toBe(10);
  expect(res2.body.levelsGained).toBe(1);
});
test("Large XP grants many levels at once (e.g., 999 XP => +9 levels, 99 XP leftover)", async () => {
  const user = await User.create({
    username: "bigxp",
    email: "bigxp@example.com",
    password: "password123",
  });

  const res = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: 999 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(9);
  expect(res.body.accountXp).toBe(99);
  expect(res.body.levelsGained).toBe(9);
});
test("Adds XP correctly when user already has level and leftover XP", async () => {
  const user = await User.create({
    username: "existing",
    email: "existing@example.com",
    password: "password123",
    accountLevel: 3,
    accountXp: 80,
  });

  // +50 => 130 => +1 level, 30 leftover
  const res = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: 50 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(4);
  expect(res.body.accountXp).toBe(30);
  expect(res.body.levelsGained).toBe(1);
});

test("Returns 404 when user id is valid but user does not exist", async () => {
  const fakeId = new mongoose.Types.ObjectId();

  const res = await request(app)
    .post(`/user/${fakeId}/xp`)
    .send({ xp: 25 });

  expect(res.status).toBe(404);
  expect(res.body.message).toMatch(/not found/i);
});
test("Rejects request when xp is missing", async () => {
  const user = await User.create({
    username: "missingxp",
    email: "missingxp@example.com",
    password: "password123",
  });

  const res = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({});

  expect(res.status).toBe(400);
});
test("Rejects xp = 0", async () => {
  const user = await User.create({
    username: "zeroxp",
    email: "zeroxp@example.com",
    password: "password123",
  });

  const res = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: 0 });

  expect(res.status).toBe(400);
});

test("Rejects non-numeric xp", async () => {
  const user = await User.create({
    username: "stringxp",
    email: "stringxp@example.com",
    password: "password123",
  });

  const res = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: "abc" });

  expect(res.status).toBe(400);
});
test("GET /user/:id/level rejects invalid id", async () => {
  const res = await request(app).get("/user/notanid/level");
  expect(res.status).toBe(400);
});

});
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
// 1) 99 XP -> no level up, xpNeeded should be 1
test("Adding 99 XP does not level up and xpNeededForNextLevel is 1", async () => {
  const user = await User.create({
    username: "u99",
    email: "u99@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 99 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(0);
  expect(res.body.accountXp).toBe(99);
  expect(res.body.levelsGained).toBe(0);
  expect(res.body.xpNeededForNextLevel).toBe(1);
});

// 2) 100 XP -> level +1 and remainder 0
test("Adding exactly 100 XP gives +1 level and 0 XP remainder", async () => {
  const user = await User.create({
    username: "u100",
    email: "u100@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 100 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(1);
  expect(res.body.accountXp).toBe(0);
  expect(res.body.levelsGained).toBe(1);
  expect(res.body.xpNeededForNextLevel).toBe(100);
});

// 3) 101 XP -> level +1 and remainder 1
test("Adding 101 XP gives +1 level and 1 XP remainder", async () => {
  const user = await User.create({
    username: "u101",
    email: "u101@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 101 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(1);
  expect(res.body.accountXp).toBe(1);
  expect(res.body.levelsGained).toBe(1);
  expect(res.body.xpNeededForNextLevel).toBe(99);
});

// 4) Decimal XP is accepted (0.5 XP)
test("Decimal XP (0.5) is accepted and stored", async () => {
  const user = await User.create({
    username: "udec",
    email: "udec@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 0.5 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(0);
  expect(res.body.accountXp).toBeCloseTo(0.5);
  expect(res.body.levelsGained).toBe(0);
});

// 5) Numeric string XP "50" is accepted
test('XP as numeric string "50" is accepted', async () => {
  const user = await User.create({
    username: "ustr50",
    email: "ustr50@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: "50" });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(0);
  expect(res.body.accountXp).toBe(50);
});

// 6) Whitespace numeric string " 50 " is accepted
test('XP as whitespace string " 50 " is accepted', async () => {
  const user = await User.create({
    username: "ustrws",
    email: "ustrws@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: " 50 " });

  expect(res.status).toBe(200);
  expect(res.body.accountXp).toBe(50);
});

// 7) null XP is rejected (Number(null)=0)
test("XP null is rejected (400)", async () => {
  const user = await User.create({
    username: "unull",
    email: "unull@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: null });
  expect(res.status).toBe(400);
});

// 8) empty string XP "" is rejected (Number('')=0)
test('XP as empty string "" is rejected (400)', async () => {
  const user = await User.create({
    username: "uempty",
    email: "uempty@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: "" });
  expect(res.status).toBe(400);
});

// 9) boolean true XP becomes 1 and is accepted
test("XP boolean true is accepted as 1", async () => {
  const user = await User.create({
    username: "ubool",
    email: "ubool@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: true });

  expect(res.status).toBe(200);
  expect(res.body.accountXp).toBe(1);
  expect(res.body.accountLevel).toBe(0);
});

// 10) array XP [10] becomes 10 and is accepted (Number([10]) = 10)
test("XP array [10] is accepted as 10", async () => {
  const user = await User.create({
    username: "uarr",
    email: "uarr@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: [10] });

  expect(res.status).toBe(200);
  expect(res.body.accountXp).toBe(10);
});

// 11) object XP is rejected
test("XP object is rejected (400)", async () => {
  const user = await User.create({
    username: "uobj",
    email: "uobj@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: { v: 10 } });
  expect(res.status).toBe(400);
});

// 12) negative decimal XP rejected
test("Negative decimal XP is rejected (400)", async () => {
  const user = await User.create({
    username: "unegdec",
    email: "unegdec@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: -1.2 });
  expect(res.status).toBe(400);
});

// 13) GET /user/levels returns [] when empty
test("GET /user/levels returns empty array when no users exist", async () => {
  const res = await request(app).get("/user/levels");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(0);
});

// 14) GET /user/:id/level returns 404 for valid ObjectId not in DB
test("GET /user/:id/level returns 404 for non-existent valid ObjectId", async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const res = await request(app).get(`/user/${fakeId}/level`);
  expect(res.status).toBe(404);
});

// 15) /levels should not leak password field (because you select username/accountLevel/accountXp)
test("GET /user/levels does not include password field", async () => {
  await User.create({
    username: "noleak",
    email: "noleak@example.com",
    password: "password123",
    accountLevel: 1,
    accountXp: 10,
  });

  const res = await request(app).get("/user/levels");
  expect(res.status).toBe(200);
  expect(res.body[0].password).toBeUndefined();
});

// 16) xpNeededForNextLevel correct after 25 XP => 75
test("xpNeededForNextLevel is correct after adding 25 XP", async () => {
  const user = await User.create({
    username: "need75",
    email: "need75@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 25 });
  expect(res.status).toBe(200);
  expect(res.body.accountXp).toBe(25);
  expect(res.body.xpNeededForNextLevel).toBe(75);
});

// 17) xpNeededForNextLevel correct after leveling to exact boundary (100 => 100)
test("xpNeededForNextLevel is 100 after landing on exact level boundary", async () => {
  const user = await User.create({
    username: "need100",
    email: "need100@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 100 });
  expect(res.status).toBe(200);
  expect(res.body.accountXp).toBe(0);
  expect(res.body.xpNeededForNextLevel).toBe(100);
});

// 18) Adding XP should not create extra users
test("Adding XP does not create new users (count unchanged)", async () => {
  const user = await User.create({
    username: "count1",
    email: "count1@example.com",
    password: "password123",
  });

  const before = await User.countDocuments();
  await request(app).post(`/user/${user._id}/xp`).send({ xp: 10 });
  const after = await User.countDocuments();

  expect(before).toBe(1);
  expect(after).toBe(1);
});

// 19) Multiple requests accumulate correctly (30 + 30 + 50 => level 1, xp 10)
test("Multiple XP requests accumulate (30+30+50 => level 1, xp 10)", async () => {
  const user = await User.create({
    username: "accum",
    email: "accum@example.com",
    password: "password123",
  });

  await request(app).post(`/user/${user._id}/xp`).send({ xp: 30 });
  await request(app).post(`/user/${user._id}/xp`).send({ xp: 30 });
  const res3 = await request(app).post(`/user/${user._id}/xp`).send({ xp: 50 });

  expect(res3.status).toBe(200);
  expect(res3.body.accountLevel).toBe(1);
  expect(res3.body.accountXp).toBe(10);
});

// 20) levelsGained when big add in one request (350 => +3 levels remainder 50)
test("Large single add returns correct levelsGained (350 => +3, remainder 50)", async () => {
  const user = await User.create({
    username: "lg350",
    email: "lg350@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 350 });

  expect(res.status).toBe(200);
  expect(res.body.levelsGained).toBe(3);
  expect(res.body.accountLevel).toBe(3);
  expect(res.body.accountXp).toBe(50);
});

// 21) Start at level 2 xp 90, add 15 => +1 level, xp 5
test("Existing user (L2 XP90) +15 => L3 XP5", async () => {
  const user = await User.create({
    username: "start290",
    email: "start290@example.com",
    password: "password123",
    accountLevel: 2,
    accountXp: 90,
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 15 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(3);
  expect(res.body.accountXp).toBe(5);
  expect(res.body.levelsGained).toBe(1);
});

// 22) Add 200 => +2 levels, remainder 0
test("Adding 200 XP gives +2 levels and 0 remainder", async () => {
  const user = await User.create({
    username: "u200",
    email: "u200@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 200 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(2);
  expect(res.body.accountXp).toBe(0);
  expect(res.body.levelsGained).toBe(2);
});

// 23) If DB has weird starting XP (e.g., 250), route normalizes on next add
test("If user starts with accountXp 250, next add normalizes levels properly", async () => {
  const user = await User.create({
    username: "weirdxp",
    email: "weirdxp@example.com",
    password: "password123",
    accountLevel: 0,
    accountXp: 250,
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 1 });

  // 251 => +2 levels, remainder 51
  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(2);
  expect(res.body.accountXp).toBe(51);
});

// 24) /levels sorting: same level, higher xp first
test("Leaderboard sorting: same level sorts by XP desc", async () => {
  await User.create([
    { username: "sx1", email: "sx1@example.com", password: "password123", accountLevel: 5, accountXp: 10 },
    { username: "sx2", email: "sx2@example.com", password: "password123", accountLevel: 5, accountXp: 90 },
    { username: "sx3", email: "sx3@example.com", password: "password123", accountLevel: 4, accountXp: 99 },
  ]);

  const res = await request(app).get("/user/levels");

  expect(res.status).toBe(200);
  expect(res.body[0].username).toBe("sx2"); // L5 XP90
  expect(res.body[1].username).toBe("sx1"); // L5 XP10
  expect(res.body[2].username).toBe("sx3"); // L4 XP99
});

// 25) GET /user/:id/level rejects invalid id "123"
test('GET /user/:id/level rejects invalid id "123" (400)', async () => {
  const res = await request(app).get("/user/123/level");
  expect(res.status).toBe(400);
});

// 26) POST /user/:id/xp valid ObjectId but not found => 404
test("POST /user/:id/xp returns 404 for non-existent valid ObjectId", async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const res = await request(app).post(`/user/${fakeId}/xp`).send({ xp: 10 });

  expect(res.status).toBe(404);
});

// 27) Decimal leveling across boundary: start 99, add 1.5 => level 1 xp 0.5
test("Decimal crossing boundary: 99 + 1.5 => level 1, xp 0.5", async () => {
  const user = await User.create({
    username: "decCross",
    email: "decCross@example.com",
    password: "password123",
    accountXp: 99,
    accountLevel: 0,
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 1.5 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(1);
  expect(res.body.accountXp).toBeCloseTo(0.5);
  expect(res.body.levelsGained).toBe(1);
});

// 28) Response message exists
test('XP route response includes message "XP added"', async () => {
  const user = await User.create({
    username: "msg",
    email: "msg@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 10 });
  expect(res.status).toBe(200);
  expect(res.body.message).toMatch(/xp added/i);
});

// 29) Response numeric fields are numbers (not strings)
test("XP route returns numeric fields as numbers", async () => {
  const user = await User.create({
    username: "types",
    email: "types@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 10 });

  expect(res.status).toBe(200);
  expect(typeof res.body.accountLevel).toBe("number");
  expect(typeof res.body.accountXp).toBe("number");
  expect(typeof res.body.xpNeededForNextLevel).toBe("number");
  expect(typeof res.body.levelsGained).toBe("number");
});

// 30) Extra body fields should be ignored and still work
test("XP route ignores extra body fields and still adds XP", async () => {
  const user = await User.create({
    username: "extra",
    email: "extra@example.com",
    password: "password123",
  });

  const res = await request(app)
    .post(`/user/${user._id}/xp`)
    .send({ xp: 10, foo: "bar", hack: 9999 });

  expect(res.status).toBe(200);
  expect(res.body.accountXp).toBe(10);
});

// 31) Verify DB saved values match response after XP add
test("After adding XP, DB values match the response", async () => {
  const user = await User.create({
    username: "dbmatch",
    email: "dbmatch@example.com",
    password: "password123",
  });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 145 });

  const fresh = await User.findById(user._id);
  expect(res.status).toBe(200);
  expect(fresh.accountLevel).toBe(res.body.accountLevel);
  expect(fresh.accountXp).toBe(res.body.accountXp);
});

// 32) /levels returns users with required fields present
test("GET /user/levels returns objects with username/accountLevel/accountXp", async () => {
  await User.create({
    username: "fields",
    email: "fields@example.com",
    password: "password123",
    accountLevel: 1,
    accountXp: 5,
  });

  const res = await request(app).get("/user/levels");
  expect(res.status).toBe(200);
  expect(res.body[0].username).toBeDefined();
  expect(res.body[0].accountLevel).toBeDefined();
  expect(res.body[0].accountXp).toBeDefined();
});

// 33) If accountLevel/accountXp were missing (undefined), route sets defaults and works
test("Route defensively handles missing accountLevel/accountXp values", async () => {
  const user = await User.create({
    username: "defensive",
    email: "defensive@example.com",
    password: "password123",
  });

  // Manually unset fields to simulate older docs
  await User.updateOne({ _id: user._id }, { $unset: { accountLevel: "", accountXp: "" } });

  const res = await request(app).post(`/user/${user._id}/xp`).send({ xp: 10 });

  expect(res.status).toBe(200);
  expect(res.body.accountLevel).toBe(0);
  expect(res.body.accountXp).toBe(10);
});
});
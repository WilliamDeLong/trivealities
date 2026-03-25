const request = require("supertest");
const express = require("express");
const axios = require("axios");

jest.mock("axios");

const openTriviaDBquestionGetter = require("../routes/openTriviaDBquestionGetter");

const app = express();
app.use(express.json());
app.use("/api", openTriviaDBquestionGetter);

describe("GET /api/questions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 and formatted questions with default amount", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [
          {
            type: "boolean",
            difficulty: "medium",
            category: "General Knowledge",
            question: "The sky is blue?",
            correct_answer: "True",
            incorrect_answers: ["False"],
          },
        ],
      },
    });

    const res = await request(app).get("/api/questions");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);

    expect(res.body[0]).toHaveProperty("prompt", "The sky is blue?");
    expect(res.body[0]).toHaveProperty("difficulty", "medium");
    expect(res.body[0]).toHaveProperty("type", "boolean");
    expect(res.body[0]).toHaveProperty("category", "General Knowledge");
    expect(res.body[0]).toHaveProperty("correctAnswer", "True");
    expect(res.body[0]).toHaveProperty("answers");
    expect(res.body[0].answers).toEqual(expect.arrayContaining(["True", "False"]));

    expect(axios.get).toHaveBeenCalledWith(
      "https://opentdb.com/api.php?amount=10"
    );
  });

  test("should use custom amount from query", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [],
      },
    });

    const res = await request(app).get("/api/questions?amount=15");

    expect(res.status).toBe(200);
    expect(axios.get).toHaveBeenCalledWith(
      "https://opentdb.com/api.php?amount=15"
    );
  });

  test("should include difficulty in API url", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [],
      },
    });

    const res = await request(app).get("/api/questions?difficulty=easy");

    expect(res.status).toBe(200);
    expect(axios.get).toHaveBeenCalledWith(
      "https://opentdb.com/api.php?amount=10&difficulty=easy"
    );
  });

  test("should include type in API url", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [],
      },
    });

    const res = await request(app).get("/api/questions?type=boolean");

    expect(res.status).toBe(200);
    expect(axios.get).toHaveBeenCalledWith(
      "https://opentdb.com/api.php?amount=10&type=boolean"
    );
  });

  test("should include category in API url", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [],
      },
    });

    const res = await request(app).get("/api/questions?category=9");

    expect(res.status).toBe(200);
    expect(axios.get).toHaveBeenCalledWith(
      "https://opentdb.com/api.php?amount=10&category=9"
    );
  });

  test("should include amount, difficulty, type, and category together", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [],
      },
    });

    const res = await request(app).get(
      "/api/questions?amount=20&difficulty=hard&type=multiple&category=18"
    );

    expect(res.status).toBe(200);
    expect(axios.get).toHaveBeenCalledWith(
      "https://opentdb.com/api.php?amount=20&difficulty=hard&type=multiple&category=18"
    );
  });

  test("should decode HTML entities in question and answers", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [
          {
            type: "multiple",
            difficulty: "easy",
            category: "Science &amp; Nature",
            question: "&quot;Water&quot; is H&#039;2O?",
            correct_answer: "True",
            incorrect_answers: ["False"],
          },
        ],
      },
    });

    const res = await request(app).get("/api/questions");

    expect(res.status).toBe(200);
    expect(res.body[0].prompt).toBe('"Water" is H\'2O?');
    expect(res.body[0].category).toBe("Science & Nature");
    expect(res.body[0].answers).toEqual(expect.arrayContaining(["True", "False"]));
  });

  test("should return 400 when API response_code is not 0", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 1,
        results: [],
      },
    });

    const res = await request(app).get("/api/questions");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Could not fetch questions from API");
    expect(res.body).toHaveProperty("responseCode", 1);
  });

  test("should return 500 when axios throws an error", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));

    const res = await request(app).get("/api/questions");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty(
      "message",
      "Server error while fetching questions"
    );
    expect(res.body).toHaveProperty("error", "Network Error");
  });

  test("should return answers array containing correct and incorrect answers", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [
          {
            type: "multiple",
            difficulty: "medium",
            category: "General Knowledge",
            question: "Pick the correct one",
            correct_answer: "Correct",
            incorrect_answers: ["Wrong1", "Wrong2", "Wrong3"],
          },
        ],
      },
    });

    const res = await request(app).get("/api/questions");

    expect(res.status).toBe(200);
    expect(res.body[0].answers).toHaveLength(4);
    expect(res.body[0].answers).toEqual(
      expect.arrayContaining(["Correct", "Wrong1", "Wrong2", "Wrong3"])
    );
  });

  test("should return empty array when API returns no results but response_code is 0", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [],
      },
    });

    const res = await request(app).get("/api/questions");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("should preserve question difficulty exactly as returned", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [
          {
            type: "boolean",
            difficulty: "hard",
            category: "History",
            question: "Was this hard?",
            correct_answer: "True",
            incorrect_answers: ["False"],
          },
        ],
      },
    });

    const res = await request(app).get("/api/questions");

    expect(res.status).toBe(200);
    expect(res.body[0].difficulty).toBe("hard");
  });

  test("should preserve question type exactly as returned", async () => {
    axios.get.mockResolvedValue({
      data: {
        response_code: 0,
        results: [
          {
            type: "multiple",
            difficulty: "easy",
            category: "Sports",
            question: "Which one?",
            correct_answer: "A",
            incorrect_answers: ["B", "C", "D"],
          },
        ],
      },
    });

    const res = await request(app).get("/api/questions");

    expect(res.status).toBe(200);
    expect(res.body[0].type).toBe("multiple");
  });
});
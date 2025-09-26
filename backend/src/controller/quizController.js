// quizzes.controller.js
const Quiz = require("../model/quizModel");
const mongoose = require("mongoose");
const crypto = require("crypto");
const { customAlphabet } = require("nanoid");




const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; 
const nanoid = customAlphabet(alphabet, 7);

async function generateUniqueQuizCode() {
  let code;
  let exists = true;

  while (exists) {
    code = nanoid();
    exists = await Quiz.findOne({ quizCode: code });
  }

  return code;
}

function validateLatex(text) {
  if (typeof text !== "string") return false;
  const unsafePattern = /<[^>]*>|&lt;|&gt;|script/i;
  return !unsafePattern.test(text);
}

async function verifyTeacherOwnership(teacherId, quizId) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new Error("Quiz not found");
  if (!quiz.teacherId.equals(teacherId)) throw new Error("Unauthorized");
  return quiz;
}

// -------------------- Controllers --------------------

// POST /api/v1/quizzes
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions, startAt, endAt, settings, pin } =
      req.body;

    // Validate required
    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Title and questions are required" });
    }

    for (const q of questions) {
      if (!validateLatex(q.prompt)) {
        return res
          .status(400)
          .json({ error: "Invalid characters in question prompt" }); 
      }
      if (q.options) {
        for (const opt of q.options) {
          if (!validateLatex(opt.text)) {
            return res
              .status(400)
              .json({ error: "Invalid characters in options" });
          }
        }
      }
    }

    const quizCode = await generateUniqueQuizCode();
    const joinUrl = `${process.env.FRONTEND_URL}/q/${quizCode}`;

    const quiz = await Quiz.create({
      teacherId: req.user.id,
      title,
      description,
      questions,
      quizCode,
      pin,
      startAt,
      endAt,
      settings,
      joinUrl, 
    });

    res.status(201).json({
      quiz,
      joinUrl, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/v1/quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await verifyTeacherOwnership(req.user.id, req.params.id);

    const { title, description, questions, startAt, endAt, settings, pin } =
      req.body;

    if (questions) {
      for (const q of questions) {
        if (!validateLatex(q.prompt)) {
          return res
            .status(400)
            .json({ error: "Invalid characters in question prompt" });
        }
        if (q.options) {
          for (const opt of q.options) {
            if (!validateLatex(opt.text)) {
              return res
                .status(400)
                .json({ error: "Invalid characters in options" });
            }
          }
        }
      }
      quiz.questions = questions;
    }

    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (startAt) quiz.startAt = startAt;
    if (endAt) quiz.endAt = endAt;
    if (settings) quiz.settings = settings;
    if (pin) quiz.pin = pin;

    await quiz.save();

    res.json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/v1/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await verifyTeacherOwnership(req.user.id, req.params.id);
    await quiz.deleteOne();
    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    const { published, activeOnly } = req.query;
    const now = new Date();

    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ error: "Invalid token (no user id)" });
    }

    let filter = { teacherId };

    if (published !== undefined) {
      filter.published = published === "true";
    }

    if (activeOnly === "true") {
      filter.startAt = { $lte: now };
      filter.endAt = { $gte: now };
    }

    const quizzes = await Quiz.find(filter);
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
// GET /api/v1/quizzes/:id
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const now = new Date();

    if (req.user.role === "student") {
      if (
        !quiz.published ||
        (quiz.startAt && quiz.startAt > now) ||
        (quiz.endAt && quiz.endAt < now)
      ) {
        return res.status(403).json({ error: "Quiz not available" });
      }

      const safeQuestions = quiz.questions.map((qs) => {
        const { correctAnswer, ...rest } = qs.toObject();
        return rest;
      });
      return res.json({ ...quiz.toObject(), questions: safeQuestions });
    }

    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/quizzes/:id/publish <- to publish a quiz
exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await verifyTeacherOwnership(req.user.id, req.params.id);
    quiz.published = true;
    await quiz.save();
    res.json({ message: "Quiz published", quiz });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};


exports.validatePin = async (req, res) => {
  try {
    const { quizCode, pin } = req.body;
    if (!quizCode) return res.status(400).json({ error: "quizCode required" });

    const quiz = await Quiz.findOne({ quizCode });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // If quiz has a pin, ensure equality (coerce both to string, trim)
    if (quiz.pin) {
      const stored = String(quiz.pin).trim();
      const provided =
        typeof pin === "undefined" || pin === null ? "" : String(pin).trim();

      if (stored !== provided) {
        return res.status(403).json({ error: "Incorrect PIN" });
      }
    }

    // return meta so frontend can use published/startAt info
    res.json({
      valid: true,
      quizId: quiz._id,
      published: !!quiz.published,
      startAt: quiz.startAt,
      endAt: quiz.endAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/quizzes/public/:quizCode <- returns small public metadata
exports.getPublicQuiz = async (req, res) => {
  try {
    const { quizCode } = req.params;
    if (!quizCode) return res.status(400).json({ error: "quizCode required" });

    const quiz = await Quiz.findOne({ quizCode }).select(
      "title description quizCode pin published startAt endAt createdAt quizCode joinUrl"
    );
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    res.json({
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      quizCode: quiz.quizCode,
      pinRequired: !!quiz.pin,
      published: !!quiz.published,
      startAt: quiz.startAt,
      endAt: quiz.endAt,
      joinUrl: quiz.joinUrl,
      createdAt: quiz.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

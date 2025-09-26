/*
  this file is a shit show

  anyway, all endpoints that have a public view 
  variant are safe to be deleted except for:
  // GET /api/v1/quizzes/:quizId/attempts <- which is used to get the quiz attempts for the teacher

  and safe to delete here means its not being activly used by the frontend 
  however it will break the backend so u need to swiftly remove the code and 
  handle where its mentioned in other files, however its not actively used by
  the frontend so it should be fine beside some reference errors so i will 
  remove them and clean this file up later on
- M&M
*/

const Attempt = require("../model/attemptModel");
const Quiz = require("../model/quizModel");
const mongoose = require("mongoose");
const User = require("../model/userModel");
const { calculateScoreForAnswer } = require("../utils/scoring");
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";
// -------------------- simple scoring 3: --------------------

// function calculateScoreForAnswer(question, answer, settings) {
//   const { confidence, selectedOptionId, typedAnswer } = answer;

//   let isCorrect = false;
//   if (question.type === "mcq") {
//     isCorrect = question.correctAnswer === selectedOptionId;
//   } else if (question.type === "short") {
//     isCorrect =
//       typedAnswer?.trim().toLowerCase() ===
//       question.correctAnswer?.trim().toLowerCase();
//   } else if (question.type === "numeric") {
//     isCorrect = Number(typedAnswer) === Number(question.correctAnswer);
//   }

//   let pointsAwarded = 0;
//   if (settings.scoringMode === "confidence_absolute") {
//     if (isCorrect) {
//       pointsAwarded = (confidence / 100) * question.points;
//     } else if (settings.negativeForWrong) {
//       pointsAwarded = -1 * (confidence / 100) * question.points;
//     }
//   } else if (settings.scoringMode === "binary") {
//     pointsAwarded = isCorrect ? question.points : 0;
//   }
//   // yassmin will make more (funny)

//   return { isCorrect, pointsAwarded };
// }

// -------------------- controllers fml --------------------

// POST /api/v1/attempts/start
exports.startAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    let studentId = null; //this will be removed but im too sleepy to di it now and im suere it will break something
    if (req.user && req.user.role === "student") {
      studentId = req.user.id;
    } else if (req.body.studentId) {
      // teacher-initiated attempt for a student (validate user exists)
      const student = await User.findById(req.body.studentId);
      if (!student) return res.status(400).json({ error: "studentId invalid" });
      studentId = student._id;
    } else {
      return res
        .status(400)
        .json({ error: "studentId is required for non-student starters" });
    }

    const attempt = await Attempt.create({
      quizId,
      studentId,
      status: "in_progress",
      startedAt: new Date(),
      maxPossibleScore: quiz.questions.reduce(
        (sum, q) => sum + (q.points || 0),
        0
      ),
      meta: {
        userAgent: req.headers["user-agent"],
        ipHash: req.ip, // should we hash this? idfk tbh 🦦
      },
    });

    res
      .status(201)
      .json({ attemptId: attempt._id, startedAt: attempt.startedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/attempts/:attemptId/save <- for autosave after each question (as much as i would like to screw students over, we actully need this one)
exports.saveAttempt = async (req, res) => {
  try {
    const { answers } = req.body;
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    if (req.user.role === "student") {
      if (String(attempt.studentId) !== String(req.user.id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    if (attempt.status !== "in_progress") {
      return res.status(400).json({ error: "Attempt not active" });
    }

    if (answers) {
      attempt.answers = answers;
    }

    await attempt.save();
    res.json({ message: "Attempt saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/v1/attempts/:attemptId/submit
exports.submitAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId).populate(
      "quizId"
    );
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    if (
      String(attempt.studentId) !== String(req.user?.id) &&
      req.user.role !== "teacher"
    ) {
      // only the owner or teacher may submit other attempts
      return res.status(403).json({ error: "Forbidden" });
    }

    if (attempt.status !== "in_progress") {
      return res.status(400).json({ error: "Attempt already submitted" });
    }

    const quiz = attempt.quizId;
    let totalScore = 0;

    attempt.answers = attempt.answers.map((ans) => {
      const question = quiz.questions.id(ans.questionId);
      if (!question) return ans;

      const { isCorrect, pointsAwarded } = calculateScoreForAnswer(
        question,
        ans,
        quiz.settings || {}
      );

      ans.correct = isCorrect;
      ans.questionPointsAwarded = pointsAwarded;
      totalScore += pointsAwarded;

      return ans;
    });

    attempt.score = totalScore;
    attempt.submittedAt = new Date();
    attempt.status = "submitted";

    await attempt.save();

    const viewUrl = `${FRONTEND}/attempts/${attempt._id}`;
    res.json({
      score: attempt.score,
      maxPossible: attempt.maxPossibleScore,
      viewUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
// GET /api/v1/attempts/:attemptId <- so students can see where they made mistakes 👽
exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId)
      .populate("quizId")
      .populate("studentId", "name email studentId");

    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    if (req.user.role === "student") {
      if (
        String(attempt.studentId._id || attempt.studentId) !==
        String(req.user.id)
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    if (req.user.role === "teacher") {
      const quiz = attempt.quizId.quizCode
        ? attempt.quizId
        : await Quiz.findById(attempt.quizId);
      if (!quiz) return res.status(404).json({ error: "Quiz not found" });
      if (String(quiz.teacherId) !== String(req.user.id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    res.json(attempt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/quizzes/:quizId/attempts <- pretty clear what this one is used for
exports.getAttemptsForQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    if (req.user.role === "teacher") {
      if (String(quiz.teacherId) !== String(req.user.id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    const attempts = await Attempt.find({ quizId })
      .populate("studentId", "name email studentId")
      .select("studentId studentInfo score submittedAt startedAt status");

    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.startPublicAttempt = async (req, res) => {
  try {
    const { quizCode, quizId, name, email, studentId, pin } = req.body;

    let quiz;
    if (quizId) quiz = await Quiz.findById(quizId);
    else if (quizCode) quiz = await Quiz.findOne({ quizCode });
    else return res.status(400).json({ error: "quizId or quizCode required" });

    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    if (!quiz.published) {
      return res.status(403).json({
        error: "Quiz not published",
        published: false,
        startAt: quiz.startAt,
      });
    }

    const now = new Date();
    if (quiz.startAt && quiz.startAt > now) {
      return res.status(403).json({
        error: "Quiz not started yet",
        published: true,
        startAt: quiz.startAt,
      });
    }

    if (quiz.pin) {
      const stored = String(quiz.pin).trim();
      const provided =
        typeof pin === "undefined" || pin === null ? "" : String(pin).trim();
      if (stored !== provided) {
        return res.status(403).json({ error: "Incorrect PIN" });
      }
    }

    const attempt = await Attempt.create({
      quizId: quiz._id,
      studentInfo: {
        name: name || "Anonymous",
        email: email || "",
        studentId: studentId || "",
      },
      status: "in_progress",
      startedAt: new Date(),
      maxPossibleScore: quiz.questions.reduce(
        (sum, q) => sum + (q.points || 0),
        0
      ),
      meta: {
        userAgent: req.headers["user-agent"],
        ipHash: req.ip,
      },
    });

    const safeQuestions = quiz.questions.map((qs) => {
      const { correctAnswer, ...rest } = qs.toObject();
      return rest;
    });

    res.status(201).json({
      attemptId: attempt._id,
      startedAt: attempt.startedAt,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        quizCode: quiz.quizCode,
        pin: quiz.pin ? true : false,
        startAt: quiz.startAt,
        endAt: quiz.endAt,
        settings: quiz.settings,
        questions: safeQuestions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC SAVE: POST /api/v1/attempts/public/:attemptId/save
exports.savePublicAttempt = async (req, res) => {
  try {
    const { answers } = req.body;
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    if (attempt.status !== "in_progress") {
      return res.status(400).json({ error: "Attempt not active" });
    }

    if (answers) {
      attempt.answers = answers;
    }

    await attempt.save();
    res.json({ message: "Saved", attemptId: attempt._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC SUBMIT: POST /api/v1/attempts/public/:attemptId/submit
exports.submitPublicAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId).populate(
      "quizId"
    );
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    if (attempt.status !== "in_progress") {
      return res.status(400).json({ error: "Attempt already submitted" });
    }

    const quiz = attempt.quizId;
    let totalScore = 0;

    attempt.answers = attempt.answers.map((ans) => {
      const question = quiz.questions.id(ans.questionId);
      if (!question) return ans;

      const { isCorrect, pointsAwarded } = calculateScoreForAnswer(
        question,
        ans,
        quiz.settings || {}
      );

      ans.correct = isCorrect;
      ans.questionPointsAwarded = pointsAwarded;
      totalScore += pointsAwarded;

      return ans;
    });

    attempt.score = totalScore;
    attempt.submittedAt = new Date();
    attempt.status = "submitted";

    await attempt.save();

    // return score + view URL
    const viewUrl = `${FRONTEND}/attempts/${attempt._id}`;
    res.json({
      score: attempt.score,
      maxPossible: attempt.maxPossibleScore,
      viewUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC GET: GET /api/v1/attempts/public/:attemptId
exports.getPublicAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId).populate(
      "quizId"
    );
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    const quiz = attempt.quizId;
    const safeQuestions = quiz.questions.map((qs) => {
      const { correctAnswer, ...rest } = qs.toObject();
      return rest;
    });

    const out = {
      ...attempt.toObject(),
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        quizCode: quiz.quizCode,
        startAt: quiz.startAt,
        endAt: quiz.endAt,
        settings: quiz.settings,
        questions: safeQuestions,
      },
    };

    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// https://www.youtube.com/watch?v=suGI-LmoO7g
// https://www.youtube.com/watch?v=ITo-WbpANi0
/*
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣤⣤⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⣠⡶⠒⠒⠶⣄⣠⡴⠚⠉⠁⠀⠀⠀⠀⠀⠉⠙⠳⢦⡀⠀⠀⠀⠀⠀⠀
    ⢠⡏⠀⠀⠀⠀⠘⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢧⡀⠀⠀⠀⠀
    ⢸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠋⢱⠀⠀⢠⠉⢡⠀⠀⠀⠀⠀⠻⡄⠀⠀⠀
    ⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⢸⣧⣾⠄⠀⢸⣦⣾⠀⠀⠀⠀⠀⠀⢻⡄⠀⠀
    ⠀⠘⢧⡀⠀⠀⠀⠀⠀⠀⠈⣿⣿⠀⠀⠸⣿⡿⠀⠀⠀⠀⠀⠀⠈⠳⣄⠀
    ⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠈⠁⡴⠶⡆⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠹⡄
    ⠀⠀⠀⢷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠒⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣷
    ⠀⠀⠀⠸⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠇
    ⠀⠀⠀⣀⡿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡽⣿⡛⠁⠀
    ⠀⣠⢾⣭⠀⠈⠳⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠊⠀⢠⣝⣷⡀
    ⢠⡏⠘⠋⠀⠀⠀⠈⠑⠦⣄⣀⠀⠀⠀⠀⠀⣀⡠⠔⠋⠀⠀⠀⠈⠛⠃⢻
    ⠈⠷⣤⣀⣀⣀⣀⣀⣀⣀⣀⣤⡽⠟⠛⠿⣭⣄⣀⣀⣀⣀⣀⣀⣀⣀⣤⠞
    ⠀⠀⠀⠀⠉⠉⠉⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠉⠉⠉⠉⠀⠀⠀
https://www.instagram.com/p/DKMP0kCtJGZ/
*/

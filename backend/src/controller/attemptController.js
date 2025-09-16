const Attempt = require("../model/attemptModel");
const Quiz = require("../model/quizModel");
const mongoose = require("mongoose");

// -------------------- simple scoring 3: --------------------

function calculateScoreForAnswer(question, answer, settings) {
  const { confidence, selectedOptionId, typedAnswer } = answer;

  let isCorrect = false;
  if (question.type === "mcq") {
    isCorrect = question.correctAnswer === selectedOptionId;
  } else if (question.type === "short") {
    isCorrect =
      typedAnswer?.trim().toLowerCase() ===
      question.correctAnswer?.trim().toLowerCase();
  } else if (question.type === "numeric") {
    isCorrect = Number(typedAnswer) === Number(question.correctAnswer);
  }

  let pointsAwarded = 0;
  if (settings.scoringMode === "confidence_absolute") {
    if (isCorrect) {
      pointsAwarded = (confidence / 100) * question.points;
    } else if (settings.negativeForWrong) {
      pointsAwarded = -1 * (confidence / 100) * question.points;
    }
  } else if (settings.scoringMode === "binary") {
    pointsAwarded = isCorrect ? question.points : 0;
  }
  // yassmin will make more

  return { isCorrect, pointsAwarded };
}

// -------------------- controllers fml --------------------

// POST /api/v1/attempts/start
exports.startAttempt = async (req, res) => {
  try {
    const { quizId, studentId } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const attempt = await Attempt.create({
      quizId,
      studentId,
      status: "in_progress",
      startedAt: new Date(),
      maxPossibleScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
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

    if (attempt.status !== "in_progress") {
      return res.status(400).json({ error: "Attempt already submitted" });
    }
    // shit show of a code
    const quiz = attempt.quizId;
    let totalScore = 0;

    attempt.answers = attempt.answers.map((ans) => {
      const question = quiz.questions.id(ans.questionId);
      if (!question) return ans;

      const { isCorrect, pointsAwarded } = calculateScoreForAnswer(
        question,
        ans,
        quiz.settings
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

    res.json({ score: attempt.score, maxPossible: attempt.maxPossibleScore });
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
      .populate("studentId");

    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    if (
      req.user.role === "student" &&
      !attempt.studentId.equals(req.user._id)
    ) {
      return res.status(403).json({ error: "Forbidden" });
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

    if (req.user.role === "teacher" && !quiz.teacherId.equals(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const attempts = await Attempt.find({ quizId })
      .populate("studentId", "name email studentId")
      .select("studentId score submittedAt status");

    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// https://www.youtube.com/watch?v=suGI-LmoO7g
// https://www.youtube.com/watch?v=ITo-WbpANi0

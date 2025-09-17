const Attempt = require("../model/attemptModel");
const Quiz = require("../model/quizModel");
const User = require("../model/userModel");
const { Parser } = require("json2csv");
const {
  formatAttemptsForCSV,
  exportData,
  getExportFields,
} = require("../utils/export");

//  GET /quizzes/:quizId/results/summary
exports.getQuizSummary = async (req, res) => {
  try {
    const { quizId } = req.params;
    // find all the attempts where students actually finished crazy
    const attempts = await Attempt.find({ quizId, status: "graded" }).populate(
      "studentId",
      "name email"
    );
    if (attempts.length === 0) {
      return res.status(404).json({
        message: "No graded attempts yet", //(students are probably still crying)
      });
    }

    // functions to find the stuff
    const scores = attempts.map((a) => a.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    const passingThreshold = attempts[0].maxPossibleScore * 0.6;
    const passRate =
      (scores.filter((s) => s >= passingThreshold).length / scores.length) *
      100;

    // Confidence vs Accuracy analysis
    let totalCorrect = 0,
      totalWrong = 0,
      confCorrect = 0,
      confWrong = 0;

    attempts.forEach((a) => {
      a.answers.forEach((ans) => {
        if (ans.correct) {
          totalCorrect++;
          confCorrect += ans.confidence || 0;
        } else {
          totalWrong++;
          confWrong += ans.confidence || 0;
        }
      });
    });

    res.json({
      averageScore: avg,
      medianScore: median,
      maxScore: maxScore,
      minScore: minScore,
      passRate: Math.round(passRate * 100) / 100,
      totalAttempts: attempts.length,
      completedAttempts: attempts.filter((a) => a.status === "graded").length,
      distribution: scores,
      confidenceVsAccuracy: {
        correct: totalCorrect
          ? Math.round((confCorrect / totalCorrect) * 100) / 100
          : 0,
        wrong: totalWrong
          ? Math.round((confWrong / totalWrong) * 100) / 100
          : 0,
        totalQuestionsAnalyzed: totalCorrect + totalWrong,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  GET /quizzes/:quizId/results/:studentId
exports.getStudentResults = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;

    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all attempts by this student
    const attempts = await Attempt.find({ quizId, studentId })
      .populate("quizId", "title description")
      .skip(skip)
      .limit(limit)
      .sort({ submittedAt: -1 });
    if (!attempts.length) {
      return res.status(404).json({ message: "No attempts found" });
    }

    const total = await Attempt.countDocuments({ quizId, studentId });

    res.json({
      attempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  GET /quizzes/:quizId/export?format=csv
exports.exportResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { format } = req.query;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // teacher can only export their own quizzes for secuirty
    if (
      req.user.role === "teacher" &&
      quiz.teacherId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const attempts = await Attempt.find({ quizId })
      .populate("studentId", "name email")
      .populate("quizId", "title");

    if (!attempts.length) {
      return res.status(404).json({ message: "No attempts found " });
    }

    const csvData = formatAttemptsForCSV(attempts, quiz);
    const fields = getExportFields("attempts");

    exportData(csvData, format, `quiz_${quizId}_results`, res, fields);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

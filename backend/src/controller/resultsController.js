const Attempt = require("../model/attemptModel");
const Quiz = require("../model/quizModel");

// Utility to format attempts consistently
const formatAttempt = (a) => ({
  studentId: a.studentId?._id || "-",
  studentName: a.studentId?.name || "Unknown",
  score: a.score,
  maxPossibleScore: a.maxPossibleScore,
  accuracy: a.accuracy, // optional if you calculate it elsewhere
  submittedAt: a.submittedAt,
});

// GET all attempts for a quiz (teacher only)
// GET all attempts for a quiz (teacher)
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (
      req.user.role === "teacher" &&
      quiz.teacherId.toString() !== req.user.id
    )
      return res.status(403).json({ message: "Access denied" });

    const attempts = await Attempt.find({ quizId, status: "submitted" })
      .populate("studentId", "name")
      .sort({ submittedAt: -1 });

    const results = attempts.map((a) => ({
      studentId: a.studentId?._id || "-",
      studentName: a.studentId?.name || "Unknown",
      score: a.score,
      maxPossibleScore: a.maxPossibleScore,
      accuracy: a.accuracy,
      submittedAt: a.submittedAt,
    }));

    res.json({ results }); // ✅ always return results
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET specific student attempts
exports.getStudentResults = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;

    if (req.user.role === "student" && req.user.id !== studentId)
      return res.status(403).json({ message: "Access denied" });

    const attempts = await Attempt.find({ quizId, studentId })
      .populate("studentId", "name")
      .populate("quizId", "title")
      .sort({ submittedAt: -1 });

    const results = attempts.map((a) => ({
      studentId: a.studentId?._id || "-",
      studentName: a.studentId?.name || "Unknown",
      score: a.score,
      maxPossibleScore: a.maxPossibleScore,
      accuracy: a.accuracy,
      submittedAt: a.submittedAt,
    }));

    res.json({ results }); // ✅ always return results
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export CSV remains the same
exports.exportResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { format } = req.query;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (
      req.user.role === "teacher" &&
      quiz.teacherId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const attempts = await Attempt.find({ quizId })
      .populate("studentId", "name email")
      .populate("quizId", "title");

    if (!attempts.length)
      return res.status(404).json({ message: "No attempts found" });

    const csvData = attempts.map(formatAttempt);
    // Or use your existing exportData utility
    res.json({ results: csvData }); // for simplicity if frontend wants JSON
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

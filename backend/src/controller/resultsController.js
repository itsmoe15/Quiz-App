const Attempt = require("../model/attemptModel");
const Quiz = require("../model/quizModel");
const { Parser } = require("json2csv");

// Utility to format attempts consistently
const formatAttempt = (a) => ({
  studentId: a.studentId?._id || "-",
  studentName: a.studentId?.name || "Unknown",
  score: a.score,
  maxPossibleScore: a.maxPossibleScore,
  accuracy: a.accuracy, // optional if you calculate it elsewhere
  submittedAt: a.submittedAt,
});

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
      .populate("studentId", "name email studentId") 
      .populate("quizId", "title");

    if (!attempts.length)
      return res.status(404).json({ message: "No attempts found" });

    // Map attempts into CSV rows supporting both embedded studentInfo and populated studentId
    const rows = attempts.map((a) => {
      // prefer embedded studentInfo (public attempts), otherwise populated studentId, otherwise fallback
      const student =
        a.studentInfo && typeof a.studentInfo === "object"
          ? a.studentInfo
          : a.studentId && typeof a.studentId === "object"
          ? a.studentId
          : {};

      // compute sensible maxPossibleScore: prefer attempt field, fallback to quiz questions sum
      const maxPossible =
        Number(a.maxPossibleScore ?? a.maxPossible ?? a.maxScore) ||
        (quiz.questions
          ? quiz.questions.reduce((s, q) => s + Number(q.points ?? 1), 0)
          : 0);

      return {
        studentId: student.studentId || student.studentID || student.id || "-",
        studentName: student.name || "Unknown",
        studentEmail: student.email || "—",
        score: Number(a.score ?? 0),
        maxPossibleScore: maxPossible,
        status: a.status || "in_progress",
        submittedAt: a.submittedAt ? a.submittedAt.toISOString() : "",
        startedAt: a.startedAt ? a.startedAt.toISOString() : "",
      };
    });

    if ((format || "").toLowerCase() === "csv") {
      const parser = new Parser({
        fields: [
          "studentId",
          "studentName",
          "studentEmail",
          "score",
          "maxPossibleScore",
          "status",
          "startedAt",
          "submittedAt",
        ],
      });
      const csv = parser.parse(rows);

      const csvWithBOM = "\uFEFF" + csv;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="quiz-${quizId}-results.csv"`
      );
      return res.send(csvWithBOM);
    }

    res.json({ results: rows });
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ message: err.message });
  }
};
const { Parser } = require("json2csv");
const mongoose = require("mongoose");

// Formats attempts data for CSV export

exports.formatAttemptsForCSV = (attempts, quiz = null) => {
  return attempts.map((attempt) => {
    const timeTaken =
      attempt.submittedAt && attempt.startedAt
        ? Math.round((attempt.submittedAt - attempt.startedAt) / 1000 / 60) // minutes
        : null;

    const percentage =
      attempt.maxPossibleScore > 0
        ? Math.round((attempt.score / attempt.maxPossibleScore) * 100 * 100) /
          100
        : 0;

    return {
      // Student Information
      studentId: attempt.studentId._id || attempt.studentId,
      studentName: attempt.studentId.name || "Unknown",
      studentEmail: attempt.studentId.email || "Unknown",

      // Quiz Information
      quizId: quiz?._id || attempt.quizId,
      quizTitle: quiz?.title || attempt.quizId?.title || "Unknown",
      quizDescription: quiz?.description || "",

      // Attempt Results
      score: attempt.score,
      maxPossibleScore: attempt.maxPossibleScore,
      percentage: `${percentage}%`,
      status: attempt.status,

      // Timing Information
      startedAt: attempt.startedAt.toISOString(),
      submittedAt: attempt.submittedAt
        ? attempt.submittedAt.toISOString()
        : "Not submitted",
      timeTakenMinutes: timeTaken,
      timeTakenFormatted: timeTaken !== null ? `${timeTaken} minutes` : "N/A",

      // Security & Metadata (cheater cheater wife beater)
      suspiciousEventsCount: attempt.suspiciousEventsCount || 0,
      userAgent: attempt.meta?.userAgent || "Unknown",

      // Additional Context
      attemptId: attempt._id,
      gradedAt: attempt.gradedAt
        ? attempt.gradedAt.toISOString()
        : "Not graded",
    };
  });
};

//for detailed question-level CSV export

exports.formatQuestionDetailsForCSV = (attempts, quiz) => {
  const questionData = [];

  attempts.forEach((attempt) => {
    attempt.answers.forEach((answer) => {
      const question = quiz.questions.id(answer.questionId);

      questionData.push({
        // Identifiers
        attemptId: attempt._id,
        studentId: attempt.studentId._id || attempt.studentId,
        studentName: attempt.studentId.name || "Unknown",
        questionId: answer.questionId,

        // Question Information
        questionType: question?.type || "unknown",
        questionPrompt: question?.prompt || "Unknown",

        // Student Response
        selectedOption: answer.selectedOptionId || "N/A",
        typedAnswer: answer.typedAnswer || "N/A",
        confidence: answer.confidence || 0,

        // Grading Results
        correct: answer.correct ? "Yes" : "No",
        pointsAwarded: answer.questionPointsAwarded || 0,
        maxPoints: question?.points || 1,

        // Timing
        attemptDuration:
          attempt.submittedAt && attempt.startedAt
            ? Math.round((attempt.submittedAt - attempt.startedAt) / 1000 / 60)
            : null,
      });
    });
  });

  return questionData;
};

// Generates CSV from data
exports.generateCSV = (data, fields = null) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    throw new Error(`CSV generation failed: ${error.message}`);
  }
};

//Generates summary statistics for export
exports.generateSummaryStats = (attempts, quiz) => {
  const scores = attempts
    .map((a) => a.score)
    .filter((score) => score !== undefined);
  const totalQuestions = quiz.questions.length;

  return {
    totalAttempts: attempts.length,
    completedAttempts: attempts.filter((a) => a.status === "graded").length,
    averageScore: scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
      : 0,
    highestScore: scores.length ? Math.max(...scores) : 0,
    lowestScore: scores.length ? Math.min(...scores) : 0,
    passRate: scores.length
      ? (
          (scores.filter(
            (s) => s >= (quiz.passingScore || quiz.maxPossibleScore * 0.6)
          ).length /
            scores.length) *
          100
        ).toFixed(2)
      : 0,
    totalQuestions: totalQuestions,
  };
};

//Exports data to various formats
exports.exportData = (data, format, filename, res) => {
  switch (format.toLowerCase()) {
    case "csv":
      const csv = this.generateCSV(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}_${
          new Date().toISOString().split("T")[0]
        }.csv"`
      );
      res.send(csv);
      break;

    case "json":
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}_${
          new Date().toISOString().split("T")[0]
        }.json"`
      );
      res.send(JSON.stringify(data, null, 2));
      break;

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

//Gets appropriate fields for CSV export based on data type
exports.getExportFields = (type) => {
  const baseAttemptFields = [
    "studentId",
    "studentName",
    "studentEmail",
    "quizTitle",
    "score",
    "maxPossibleScore",
    "percentage",
    "status",
    "startedAt",
    "submittedAt",
    "timeTakenFormatted",
    "suspiciousEventsCount",
  ];

  const questionDetailFields = [
    "studentName",
    "questionType",
    "questionPrompt",
    "selectedOption",
    "typedAnswer",
    "confidence",
    "correct",
    "pointsAwarded",
    "maxPoints",
  ];

  return type === "questions" ? questionDetailFields : baseAttemptFields;
};

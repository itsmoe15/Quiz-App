// backend/src/controller/analyticsController.js
const Quiz = require("../model/quizModel");
const Attempt = require("../model/attemptModel");
const QuizAnalytics = require("../utils/analytics");

// GET /quizzes/:quizId/analytics/summary
exports.getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check if teacher owns this quiz
    if (
      req.user.role === "teacher" &&
      quiz.teacherId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Use cached analytics or calculate fresh
    let analytics = quiz.statistics;

    // If no analytics or outdated (older than 5 minutes), recalculate
    if (
      !analytics ||
      !analytics.lastUpdated ||
      Date.now() - new Date(analytics.lastUpdated).getTime() > 300000
    ) {
      const analyticsEngine = new QuizAnalytics(quizId);
      analytics = await analyticsEngine.calculateQuizAnalytics();

      // Update cache
      await Quiz.findByIdAndUpdate(quizId, { statistics: analytics });
    }

    res.json({
      success: true,
      analytics: analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

// GET /quizzes/:quizId/analytics/detailed
exports.getDetailedAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (
      req.user.role === "teacher" &&
      quiz.teacherId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const attempts = await Attempt.find({ quizId, status: "graded" }).populate(
      "studentId",
      "name email"
    );

    if (attempts.length === 0) {
      return res
        .status(404)
        .json({ message: "No attempts found for detailed analysis" });
    }

    // Advanced analytics calculations
    const detailedAnalytics = {
      // Score distribution
      scoreDistribution: calculateScoreDistribution(attempts),

      // Question difficulty analysis
      questionDifficulty: calculateQuestionDifficulty(attempts, quiz),

      // Confidence calibration
      confidenceCalibration: calculateConfidenceCalibration(attempts),

      // Time analysis
      timeAnalysis: calculateTimeAnalysis(attempts),

      // Student performance clusters
      performanceClusters: calculatePerformanceClusters(attempts),
    };

    res.json({
      success: true,
      detailedAnalytics: detailedAnalytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch detailed analytics",
      error: error.message,
    });
  }
};

// Helper functions for detailed analytics
function calculateScoreDistribution(attempts) {
  const scores = attempts.map((a) => a.score);
  const maxScore = Math.max(...scores);
  const bins = 10;
  const binSize = maxScore / bins;

  const distribution = Array(bins).fill(0);

  scores.forEach((score) => {
    const binIndex = Math.min(Math.floor(score / binSize), bins - 1);
    distribution[binIndex]++;
  });

  return distribution.map((count, index) => ({
    range: `${(index * binSize).toFixed(1)} - ${((index + 1) * binSize).toFixed(
      1
    )}`,
    count: count,
    percentage: (count / scores.length) * 100,
  }));
}

function calculateQuestionDifficulty(attempts, quiz) {
  return quiz.questions.map((question) => {
    const questionAttempts = attempts.filter((attempt) =>
      attempt.answers.some(
        (ans) => ans.questionId.toString() === question._id.toString()
      )
    );

    const correctAttempts = questionAttempts.filter((attempt) => {
      const answer = attempt.answers.find(
        (ans) => ans.questionId.toString() === question._id.toString()
      );
      return answer && answer.correct;
    });

    const difficulty =
      questionAttempts.length > 0
        ? (correctAttempts.length / questionAttempts.length) * 100
        : 0;

    return {
      questionId: question._id,
      questionText: question.prompt.substring(0, 50) + "...",
      difficulty: difficulty,
      discrimination: calculateQuestionDiscrimination(attempts, question._id),
      attempts: questionAttempts.length,
    };
  });
}

function calculateConfidenceCalibration(attempts) {
  const confidenceBins = [0, 20, 40, 60, 80, 100];
  const calibration = [];

  confidenceBins.forEach((bin, index) => {
    if (index === confidenceBins.length - 1) return;

    const lower = bin;
    const upper = confidenceBins[index + 1];

    const binAnswers = [];
    attempts.forEach((attempt) => {
      attempt.answers.forEach((answer) => {
        if (answer.confidence >= lower && answer.confidence < upper) {
          binAnswers.push({
            confidence: answer.confidence,
            correct: answer.correct,
          });
        }
      });
    });

    const accuracy =
      binAnswers.length > 0
        ? (binAnswers.filter((a) => a.correct).length / binAnswers.length) * 100
        : 0;
    const avgConfidence =
      binAnswers.length > 0
        ? binAnswers.reduce((sum, a) => sum + a.confidence, 0) /
          binAnswers.length
        : 0;

    calibration.push({
      confidenceRange: `${lower}-${upper}%`,
      accuracy: accuracy,
      averageConfidence: avgConfidence,
      count: binAnswers.length,
      calibrationGap: accuracy - avgConfidence, // Positive = underconfident, Negative = overconfident
    });
  });

  return calibration;
}

function calculateTimeAnalysis(attempts) {
  const completionTimes = attempts
    .filter((a) => a.submittedAt && a.startedAt)
    .map((a) => (a.submittedAt - a.startedAt) / (1000 * 60)); // minutes

  return {
    averageTime:
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0,
    medianTime:
      completionTimes.length > 0
        ? completionTimes.sort((a, b) => a - b)[
            Math.floor(completionTimes.length / 2)
          ]
        : 0,
    fastestTime: completionTimes.length > 0 ? Math.min(...completionTimes) : 0,
    slowestTime: completionTimes.length > 0 ? Math.max(...completionTimes) : 0,
  };
}

function calculatePerformanceClusters(attempts) {
  const scores = attempts.map((a) => a.score);
  if (scores.length < 3) return []; // Need minimum data

  // Simple k-means clustering (k=3)
  const sortedScores = [...scores].sort((a, b) => a - b);
  const lowThreshold = sortedScores[Math.floor(sortedScores.length * 0.33)];
  const highThreshold = sortedScores[Math.floor(sortedScores.length * 0.67)];

  const lowPerforming = attempts.filter((a) => a.score <= lowThreshold);
  const mediumPerforming = attempts.filter(
    (a) => a.score > lowThreshold && a.score <= highThreshold
  );
  const highPerforming = attempts.filter((a) => a.score > highThreshold);

  return [
    {
      cluster: "Low Performing",
      range: `0 - ${lowThreshold.toFixed(1)}`,
      count: lowPerforming.length,
      averageConfidence: calculateAverageConfidence(lowPerforming),
    },
    {
      cluster: "Medium Performing",
      range: `${lowThreshold.toFixed(1)} - ${highThreshold.toFixed(1)}`,
      count: mediumPerforming.length,
      averageConfidence: calculateAverageConfidence(mediumPerforming),
    },
    {
      cluster: "High Performing",
      range: `${highThreshold.toFixed(1)} - ${Math.max(...scores).toFixed(1)}`,
      count: highPerforming.length,
      averageConfidence: calculateAverageConfidence(highPerforming),
    },
  ];
}

function calculateAverageConfidence(attempts) {
  const confidences = [];
  attempts.forEach((attempt) => {
    attempt.answers.forEach((answer) => {
      if (answer.confidence) confidences.push(answer.confidence);
    });
  });

  return confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;
}

function calculateQuestionDiscrimination(attempts, questionId) {
  // Simplified discrimination index
  const scores = attempts.map((a) => a.score).sort((a, b) => a - b);
  if (scores.length < 10) return 0;

  const top27 = attempts.filter(
    (a) => a.score >= scores[Math.floor(scores.length * 0.73)]
  );
  const bottom27 = attempts.filter(
    (a) => a.score <= scores[Math.floor(scores.length * 0.27)]
  );

  let topCorrect = 0,
    bottomCorrect = 0;

  [top27, bottom27].forEach((group, index) => {
    group.forEach((attempt) => {
      const answer = attempt.answers.find(
        (a) => a.questionId.toString() === questionId.toString()
      );
      if (answer && answer.correct) {
        index === 0 ? topCorrect++ : bottomCorrect++;
      }
    });
  });

  const topRatio = top27.length > 0 ? topCorrect / top27.length : 0;
  const bottomRatio = bottom27.length > 0 ? bottomCorrect / bottom27.length : 0;

  return topRatio - bottomRatio;
}

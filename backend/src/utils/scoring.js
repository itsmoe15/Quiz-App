// utils/scoring.js

function normalizeString(str) {
  return str?.trim().toLowerCase();
}

function calculateScoreForAnswer(question, answer, settings = {}) {
  const { confidence = 100, selectedOptionId, typedAnswer } = answer;

  let isCorrect = false;

  if (question.type === "mcq") {
    isCorrect = question.correctAnswer === selectedOptionId;
  } else if (question.type === "short") {
    isCorrect =
      normalizeString(typedAnswer) === normalizeString(question.correctAnswer);
  } else if (question.type === "numeric") {
    isCorrect = Number(typedAnswer) === Number(question.correctAnswer);
  }

  let pointsAwarded = 0;
  if (settings.scoringMode === "confidence_absolute" || !settings.scoringMode) {
    if (isCorrect) {
      pointsAwarded = (confidence / 100) * (question.points || 1);
    } else if (settings.negativeForWrong) {
      const penalty = settings.penaltyFactor || (question.points || 1);
      pointsAwarded = -1 * (confidence / 100) * penalty;
    }
  } else if (settings.scoringMode === "binary") {
    pointsAwarded = isCorrect ? (question.points || 1) : 0;
  }

  return { isCorrect, pointsAwarded };
}

// 🔹 function used in attemptController
function gradeAttempt(quiz, attempt, settings = {}) {
  let totalScore = 0;
  let breakdown = [];

  quiz.questions.forEach((q) => {
    const ans = attempt.answers[q._id] || {}; // { selectedOptionId, typedAnswer, confidence }
    const { isCorrect, pointsAwarded } = calculateScoreForAnswer(
      q,
      ans,
      settings
    );

    totalScore += pointsAwarded;

    breakdown.push({
      questionId: q._id,
      questionText: q.prompt,
      studentAnswer: ans.typedAnswer || ans.selectedOptionId,
      correctAnswer: q.correctAnswer,
      isCorrect,
      pointsAwarded,
      maxPoints: q.points || 1,
    });
  });

  return {
    totalScore,
    maxPossible: quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0),
    breakdown,
  };
}

module.exports = { calculateScoreForAnswer, gradeAttempt };

function normalizeString(str) {
  return typeof str === "string" ? str.trim().toLowerCase() : "";
}

/**
 * Parse confidence safely into a number 0..100.
 * Accepts numbers or strings like "80" or "80%".
 * Defaults to 100 if not parseable.
 */
function parseConfidence(conf) {
  if (conf == null) return 100;
  if (typeof conf === "number") return Number.isFinite(conf) ? conf : 100;
  if (typeof conf === "string") {
    const cleaned = conf.replace("%", "").trim();
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 100;
  }
  return 100;
}

/**
 * Determine if a numeric typed answer matches the expected numeric correctAnswer.
 * correctAnswer may be:
 *  - a plain number or numeric string
 *  - an object { value, tolerance? }
 *  - an object { min, max }
 */
function numericMatches(typed, correct) {
  const typedNum = parseFloat(typed);
  if (!Number.isFinite(typedNum)) return false;

  if (correct == null) return false;

  // If correct is an object with value/tolerance
  if (typeof correct === "object" && !Array.isArray(correct)) {
    if (correct.hasOwnProperty("value")) {
      const value = parseFloat(correct.value);
      const tol = correct.hasOwnProperty("tolerance")
        ? parseFloat(correct.tolerance)
        : 0;
      if (!Number.isFinite(value)) return false;
      if (!Number.isFinite(tol)) return Math.abs(typedNum - value) <= 0;
      return Math.abs(typedNum - value) <= Math.abs(tol);
    }
    // range {min, max}
    if (correct.hasOwnProperty("min") && correct.hasOwnProperty("max")) {
      const min = parseFloat(correct.min);
      const max = parseFloat(correct.max);
      if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
      return typedNum >= Math.min(min, max) && typedNum <= Math.max(min, max);
    }
    return false;
  }

  // plain number or numeric string
  const correctNum = parseFloat(correct);
  if (!Number.isFinite(correctNum)) return false;
  return typedNum === correctNum;
}

/**
 * Calculate points for a single answer.
 * - question: question object from DB
 * - answer: { confidence?, selectedOptionId?, typedAnswer? }
 * - settings: scoring settings
 *
 * Returns { isCorrect: boolean, pointsAwarded: number }
 */
function calculateScoreForAnswer(question, answer = {}, settings = {}) {
  // defensive defaults
  const confidence = parseConfidence(answer.confidence);
  const selectedOptionId = answer.selectedOptionId ?? answer.selectedOption ?? null;
  const typedAnswer = answer.typedAnswer ?? answer.answer ?? "";

  let isCorrect = false;

  const qType = question?.type ?? "short";
  const qPoints = Number.isFinite(Number(question?.points))
    ? Number(question.points)
    : 1;

  if (qType === "mcq") {
    // question.correctAnswer can be string or array
    const correct = question.correctAnswer;
    if (Array.isArray(correct)) {
      isCorrect = correct.includes(selectedOptionId);
    } else {
      isCorrect = correct === selectedOptionId;
    }
  } else if (qType === "short") {
    // correctAnswer may be string or array of acceptable strings
    const correct = question.correctAnswer;
    if (Array.isArray(correct)) {
      const normalizedTyped = normalizeString(typedAnswer);
      isCorrect = correct.some((cand) => normalizeString(cand) === normalizedTyped);
    } else {
      isCorrect = normalizeString(typedAnswer) === normalizeString(correct);
    }
  } else if (qType === "numeric") {
    isCorrect = numericMatches(typedAnswer, question.correctAnswer);
  }

  // Score calculation
  let pointsAwarded = 0;
  const scoringMode = settings.scoringMode ?? "confidence_absolute";

  if (scoringMode === "confidence_absolute") {
    if (isCorrect) {
      pointsAwarded = (confidence / 100) * qPoints;
    } else if (settings.negativeForWrong) {
      const penalty = Number.isFinite(Number(settings.penaltyFactor))
        ? Number(settings.penaltyFactor)
        : qPoints;
      pointsAwarded = -1 * (confidence / 100) * penalty;
    } else {
      pointsAwarded = 0;
    }
  } else if (scoringMode === "binary") {
    pointsAwarded = isCorrect ? qPoints : 0;
  } else {
    // fallback: treat like confidence_absolute
    if (isCorrect) {
      pointsAwarded = (confidence / 100) * qPoints;
    } else if (settings.negativeForWrong) {
      const penalty = Number.isFinite(Number(settings.penaltyFactor))
        ? Number(settings.penaltyFactor)
        : qPoints;
      pointsAwarded = -1 * (confidence / 100) * penalty;
    } else {
      pointsAwarded = 0;
    }
  }

  // Ensure finite number (no NaN / Infinity)
  if (!Number.isFinite(pointsAwarded)) pointsAwarded = 0;

  return {
    isCorrect,
    pointsAwarded,
  };
}

/**
 * Grade a full attempt. Assumes attempt.answers is array of { questionId, selectedOptionId, typedAnswer, confidence }
 * Returns { totalScore, maxPossible, breakdown }
 */
function gradeAttempt(quiz, attempt, settings = {}) {
  let totalScore = 0;
  const breakdown = [];

  const maxPossible = quiz.questions.reduce((sum, q) => {
    const pts = Number.isFinite(Number(q.points)) ? Number(q.points) : 1;
    return sum + pts;
  }, 0);

  for (const q of quiz.questions) {
    const ans =
      (Array.isArray(attempt.answers) &&
        attempt.answers.find((a) => a.questionId?.toString() === q._id?.toString())) ||
      {};

    const { isCorrect, pointsAwarded } = calculateScoreForAnswer(q, ans, settings);

    totalScore += pointsAwarded;

    breakdown.push({
      questionId: q._id,
      questionText: q.prompt,
      studentAnswer: ans.typedAnswer ?? ans.selectedOptionId ?? null,
      correctAnswer: q.correctAnswer,
      isCorrect,
      pointsAwarded,
      maxPoints: Number.isFinite(Number(q.points)) ? Number(q.points) : 1,
    });
  }

  // guard totalScore to be finite
  if (!Number.isFinite(totalScore)) totalScore = 0;

  return {
    totalScore,
    maxPossible,
    breakdown,
  };
}

module.exports = {
  calculateScoreForAnswer,
  gradeAttempt,
};

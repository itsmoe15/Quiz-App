const Quiz = require("../model/quizModel");

class QuizAnalytics {
  constructor(quizId) {
    this.quizId = quizId;
  }

  async calculateQuizAnalytics() {
    const Attempt = require("../model/attemptModel");
    const attempts = await Attempt.find({
      quizId: this.quizId,
      status: "submitted",
    }).populate("quizId");

    if (attempts.length === 0) {
      return this.getEmptyStats();
    }

    const quiz = attempts[0].quizId;
    const analytics = {
      totalAttempts: attempts.length,
      completedAttempts: attempts.filter((a) => a.submittedAt).length,
      averageScore: 0,
      averageAccuracy: 0,
      meanConfidence: 0,
      confidenceAccuracyCorrelation: 0,
      questionStats: [],
      averageCompletionTime: 0,
    };

    // Calculate basic metrics
    let totalScore = 0;
    let totalConfidence = 0;
    let totalQuestions = 0;
    let correctAnswers = 0;

    // Initialize question stats
    analytics.questionStats = quiz.questions.map((q) => ({
      questionId: q._id,
      attemptsCount: 0,
      correctCount: 0,
      averageConfidence: 0,
      discriminationIndex: 0,
      optionStats: q.options
        ? q.options.map((opt) => ({
            optionId: opt.id,
            selectedCount: 0,
            confidenceWhenSelected: 0,
          }))
        : [],
    }));

    attempts.forEach((attempt) => {
      totalScore += attempt.score;

      attempt.answers.forEach((answer) => {
        const questionStat = analytics.questionStats.find(
          (qs) => qs.questionId.toString() === answer.questionId.toString()
        );

        if (questionStat) {
          questionStat.attemptsCount++;
          totalConfidence += answer.confidence || 0;
          totalQuestions++;

          if (answer.correct) {
            questionStat.correctCount++;
            correctAnswers++;
          }

          // Track option selections for MCQ
          if (answer.selectedOptionId && questionStat.optionStats) {
            const optionStat = questionStat.optionStats.find(
              (opt) => opt.optionId === answer.selectedOptionId
            );
            if (optionStat) {
              optionStat.selectedCount++;
              optionStat.confidenceWhenSelected += answer.confidence || 0;
            }
          }
        }
      });

      // Calculate completion time
      if (attempt.submittedAt && attempt.startedAt) {
        const completionTime =
          (attempt.submittedAt - attempt.startedAt) / (1000 * 60); // minutes
        analytics.averageCompletionTime += completionTime;
      }
    });

    // Calculate averages
    analytics.averageScore = totalScore / attempts.length;
    analytics.averageAccuracy = (correctAnswers / totalQuestions) * 100;
    analytics.meanConfidence = totalConfidence / totalQuestions;
    analytics.averageCompletionTime /= attempts.length;

    // Calculate confidence-accuracy correlation
    analytics.confidenceAccuracyCorrelation =
      this.calculateConfidenceAccuracyCorrelation(attempts);

    // Finalize question stats
    analytics.questionStats.forEach((qStat) => {
      if (qStat.attemptsCount > 0) {
        qStat.averageConfidence =
          qStat.optionStats.reduce(
            (sum, opt) => sum + opt.confidenceWhenSelected,
            0
          ) / qStat.attemptsCount;

        // Calculate discrimination index (simplified)
        qStat.discriminationIndex = this.calculateDiscriminationIndex(
          attempts,
          qStat.questionId
        );
      }

      // Calculate average confidence per option
      qStat.optionStats.forEach((optStat) => {
        if (optStat.selectedCount > 0) {
          optStat.confidenceWhenSelected /= optStat.selectedCount;
        }
      });
    });

    analytics.lastUpdated = new Date();
    return analytics;
  }

  calculateConfidenceAccuracyCorrelation(attempts) {
    // Simplified correlation calculation
    let confidenceSum = 0;
    let accuracySum = 0;
    let confidenceAccuracyProduct = 0;
    let count = 0;

    attempts.forEach((attempt) => {
      attempt.answers.forEach((answer) => {
        const confidence = answer.confidence || 0;
        const accuracy = answer.correct ? 1 : 0;

        confidenceSum += confidence;
        accuracySum += accuracy;
        confidenceAccuracyProduct += confidence * accuracy;
        count++;
      });
    });

    if (count === 0) return 0;

    const meanConfidence = confidenceSum / count;
    const meanAccuracy = accuracySum / count;

    // Simple correlation formula
    const covariance =
      confidenceAccuracyProduct / count - meanConfidence * meanAccuracy;
    const varianceConfidence =
      Math.pow(confidenceSum / count, 2) - Math.pow(meanConfidence, 2);
    const varianceAccuracy =
      Math.pow(accuracySum / count, 2) - Math.pow(meanAccuracy, 2);

    if (varianceConfidence === 0 || varianceAccuracy === 0) return 0;

    return covariance / Math.sqrt(varianceConfidence * varianceAccuracy);
  }

  calculateDiscriminationIndex(attempts, questionId) {
    // Simplified discrimination index (top 27% vs bottom 27%)
    const scores = attempts.map((a) => a.score).sort((a, b) => a - b);
    if (scores.length < 10) return 0; // Need enough data

    const topThreshold = scores[Math.floor(scores.length * 0.73)];
    const bottomThreshold = scores[Math.floor(scores.length * 0.27)];

    const topGroup = attempts.filter((a) => a.score >= topThreshold);
    const bottomGroup = attempts.filter((a) => a.score <= bottomThreshold);

    let topCorrect = 0,
      bottomCorrect = 0;

    topGroup.forEach((attempt) => {
      const answer = attempt.answers.find(
        (a) => a.questionId.toString() === questionId.toString()
      );
      if (answer && answer.correct) topCorrect++;
    });

    bottomGroup.forEach((attempt) => {
      const answer = attempt.answers.find(
        (a) => a.questionId.toString() === questionId.toString()
      );
      if (answer && answer.correct) bottomCorrect++;
    });

    const topProportion =
      topGroup.length > 0 ? topCorrect / topGroup.length : 0;
    const bottomProportion =
      bottomGroup.length > 0 ? bottomCorrect / bottomGroup.length : 0;

    return topProportion - bottomProportion;
  }

  getEmptyStats() {
    return {
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      averageAccuracy: 0,
      meanConfidence: 0,
      confidenceAccuracyCorrelation: 0,
      questionStats: [],
      averageCompletionTime: 0,
      lastUpdated: new Date(),
    };
  }
}

module.exports = QuizAnalytics;

export function calculateScore(answers, settings) {
  let total = 0;

  answers.forEach((ans) => {
    if (ans.correct) {
      if (settings.scoringMode === "confidence_absolute") {
        total += ans.confidence || 0;
      } else if (settings.scoringMode === "confidence_scaled") {
        total += (ans.confidence / 100) * (ans.questionPoints || 1);
      } else {
        total += ans.questionPoints || 1;
      }
    } else if (settings.negativeForWrong) {
      total -= ans.questionPoints || 1;
    }
  });

  return total;
}

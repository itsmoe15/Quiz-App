// frontend/src/components/analytics/QuestionAnalytics.jsx
import React, { useEffect, useCallback, useState } from "react";

const QuestionAnalytics = ({ analytics }) => {
  const [localAnalytics, setLocalAnalytics] = useState(analytics);

  // If you plan to fetch or update analytics from API
  const loadAnalytics = useCallback(async () => {
    // Example: fetch analytics if needed
    // const data = await fetch(`/api/quiz/${quizId}/analytics`).then(res => res.json());
    // setLocalAnalytics(data);

    // For now, just use the passed prop
    setLocalAnalytics(analytics);
  }, [analytics]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (
    !localAnalytics.questionStats ||
    localAnalytics.questionStats.length === 0
  ) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-700">
          No Question Data Available
        </h3>
        <p className="text-gray-600">
          Question analytics will appear after students attempt the quiz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Question Performance Analysis
      </h2>

      {localAnalytics.questionStats.map((question, index) => (
        <div key={question.questionId} className="bg-gray-50 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Q{index + 1}: {question.prompt || "Question"}
              </h3>
              <div className="flex gap-4 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {question.attemptsCount} attempts
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {question.correctCount} correct
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {question.averageConfidence.toFixed(1)}% avg confidence
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {question.attemptsCount > 0
                  ? (
                      (question.correctCount / question.attemptsCount) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>

          {/* Difficulty and Discrimination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Difficulty Index</div>
              <div className="text-lg font-semibold">
                {question.attemptsCount > 0
                  ? (
                      (question.correctCount / question.attemptsCount) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-xs text-gray-500">
                {question.attemptsCount > 0
                  ? question.correctCount / question.attemptsCount > 0.7
                    ? "Easy"
                    : question.correctCount / question.attemptsCount > 0.3
                    ? "Medium"
                    : "Hard"
                  : "No data"}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Discrimination Index</div>
              <div className="text-lg font-semibold">
                {question.discriminationIndex.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {question.discriminationIndex > 0.3
                  ? "Good discriminator"
                  : question.discriminationIndex > 0.1
                  ? "Fair discriminator"
                  : "Poor discriminator"}
              </div>
            </div>
          </div>

          {/* Option Statistics for MCQ */}
          {question.optionStats && question.optionStats.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Option Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {question.optionStats.map((option) => (
                  <div
                    key={option.optionId}
                    className="bg-white rounded-lg p-3"
                  >
                    <div className="font-semibold text-gray-800">
                      Option {option.optionId}
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.selectedCount} selections
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.confidenceWhenSelected.toFixed(1)}% avg confidence
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionAnalytics;

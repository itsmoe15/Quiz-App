// frontend/src/components/analytics/PerformanceDistribution.jsx
import React from "react";

const PerformanceDistribution = ({ analytics, detailedAnalytics }) => {
  if (!detailedAnalytics?.scoreDistribution) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-xl font-semibold text-gray-700">
          No Performance Data Available
        </h3>
        <p className="text-gray-600">
          Performance distribution data will appear after students attempt the
          quiz.
        </p>
      </div>
    );
  }

  const distribution = detailedAnalytics.scoreDistribution;
  const maxCount = Math.max(...distribution.map((d) => d.count));

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Performance Distribution
      </h2>

      {/* Score Distribution Chart */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Score Distribution
        </h3>
        <div className="flex items-end justify-between h-48 gap-2">
          {distribution.map((bin, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-purple-500 to-purple-600 rounded-t-lg transition-all duration-300 hover:opacity-80"
                style={{ height: `${(bin.count / maxCount) * 100}%` }}
                title={`${bin.range}: ${
                  bin.count
                } students (${bin.percentage.toFixed(1)}%)`}
              ></div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {bin.range.split(" - ")[0]}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Low Scores</span>
          <span>Score Range</span>
          <span>High Scores</span>
        </div>
      </div>

      {/* Distribution Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {analytics.averageScore.toFixed(1)}
          </div>
          <div className="text-gray-600">Average Score</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {detailedAnalytics.timeAnalysis?.medianTime?.toFixed(1) || "0"}
          </div>
          <div className="text-gray-600">Median Time (min)</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {distribution.find((d) => d.count === maxCount)?.range || "N/A"}
          </div>
          <div className="text-gray-600">Most Common Score</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {analytics.averageAccuracy.toFixed(1)}%
          </div>
          <div className="text-gray-600">Overall Accuracy</div>
        </div>
      </div>

      {/* Performance Clusters */}
      {detailedAnalytics.performanceClusters && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Performance Clusters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {detailedAnalytics.performanceClusters.map((cluster, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center">
                <div
                  className={`text-2xl font-bold ${
                    index === 0
                      ? "text-red-600"
                      : index === 1
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {cluster.cluster}
                </div>
                <div className="text-4xl font-bold text-gray-800 my-3">
                  {cluster.count}
                </div>
                <div className="text-sm text-gray-600">Students</div>
                <div className="text-sm text-gray-500 mt-2">
                  Score Range: {cluster.range}
                </div>
                <div className="text-sm text-gray-500">
                  Avg Confidence: {cluster.averageConfidence.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Difficulty Analysis */}
      {detailedAnalytics.questionDifficulty && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Question Difficulty Analysis
          </h3>
          <div className="space-y-4">
            {detailedAnalytics.questionDifficulty
              .sort((a, b) => a.difficulty - b.difficulty)
              .map((question, index) => (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      Q{index + 1}: {question.questionText}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        question.difficulty > 70
                          ? "bg-green-100 text-green-800"
                          : question.difficulty > 30
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {question.difficulty.toFixed(1)}% Accuracy
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Attempts: {question.attempts}</span>
                    <span>
                      Discrimination: {question.discrimination.toFixed(2)}
                    </span>
                    <span>
                      {question.difficulty > 70
                        ? "Easy"
                        : question.difficulty > 30
                        ? "Medium"
                        : "Hard"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDistribution;

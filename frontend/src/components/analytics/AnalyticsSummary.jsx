// frontend/src/components/analytics/AnalyticsSummary.jsx
import React from "react";

const AnalyticsSummary = ({ analytics, detailedAnalytics }) => {
  const stats = [
    {
      label: "Total Attempts",
      value: analytics.totalAttempts,
      icon: "👥",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Average Score",
      value: `${analytics.averageScore.toFixed(1)} pts`,
      icon: "⭐",
      color: "from-green-500 to-green-600",
    },
    {
      label: "Average Accuracy",
      value: `${analytics.averageAccuracy.toFixed(1)}%`,
      icon: "🎯",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Mean Confidence",
      value: `${analytics.meanConfidence.toFixed(1)}%`,
      icon: "💪",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div
              className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
            >
              {stat.value}
            </div>
            <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Confidence-Accuracy Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Confidence-Accuracy Correlation
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {analytics.confidenceAccuracyCorrelation > 0 ? "+" : ""}
              {analytics.confidenceAccuracyCorrelation.toFixed(2)}
            </div>
            <div className="text-gray-600">
              {Math.abs(analytics.confidenceAccuracyCorrelation) < 0.1
                ? "Weak correlation"
                : Math.abs(analytics.confidenceAccuracyCorrelation) < 0.3
                ? "Moderate correlation"
                : Math.abs(analytics.confidenceAccuracyCorrelation) < 0.5
                ? "Strong correlation"
                : "Very strong correlation"}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Positive = Students are well-calibrated
              <br />
              Negative = Students are overconfident
            </div>
          </div>
        </div>

        {/* Completion Time */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Completion Time
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Average Time:</span>
              <span className="font-semibold">
                {analytics.averageCompletionTime.toFixed(1)} min
              </span>
            </div>
            {detailedAnalytics?.timeAnalysis && (
              <>
                <div className="flex justify-between">
                  <span>Fastest:</span>
                  <span className="font-semibold text-green-600">
                    {detailedAnalytics.timeAnalysis.fastestTime.toFixed(1)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Slowest:</span>
                  <span className="font-semibold text-red-600">
                    {detailedAnalytics.timeAnalysis.slowestTime.toFixed(1)} min
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Performance Clusters */}
      {detailedAnalytics?.performanceClusters && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Performance Clusters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {detailedAnalytics.performanceClusters.map((cluster, index) => (
              <div key={index} className="bg-white rounded-xl p-4 text-center">
                <div className="text-lg font-semibold text-gray-800">
                  {cluster.cluster}
                </div>
                <div className="text-2xl font-bold text-purple-600 my-2">
                  {cluster.count} students
                </div>
                <div className="text-sm text-gray-600">
                  Range: {cluster.range}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Avg Confidence: {cluster.averageConfidence.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSummary;

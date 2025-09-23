// frontend/src/components/analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { analyticsService } from "../../services/analyticsService";
import AnalyticsSummary from "../../components/analytics/AnalyticsSummary";
import QuestionAnalytics from "../../components/analytics/QuestionAnalytics";
import ConfidenceCalibration from "../../components/analytics/ConfidenceCalibration";
import PerformanceDistribution from "../../components/analytics/PerformanceDistribution";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const AnalyticsDashboard = () => {
  const { quizId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

  //
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📊 Loading analytics for quiz:", quizId);

      const [basicAnalytics, detailed] = await Promise.all([
        analyticsService.getQuizAnalytics(quizId),
        analyticsService.getDetailedAnalytics(quizId),
      ]);

      console.log("✅ Analytics loaded:", basicAnalytics, detailed);

      setAnalytics(basicAnalytics.analytics);
      setDetailedAnalytics(detailed.detailedAnalytics);
    } catch (err) {
      console.error("❌ Analytics loading error details:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error message:", err.message);
      setError(
        `Failed to load analytics data: ${err.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [quizId]); // Only quizId as dependency

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50">
        <LoadingSpinner size="lg" message="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600">
            No analytics data found for this quiz.
          </p>
          <button
            onClick={loadAnalytics}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Quiz Analytics
              </h1>
              <p className="text-gray-600">
                Detailed insights into student performance and question
                effectiveness
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {analytics.totalAttempts} Attempts
              </span>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {analytics.averageAccuracy?.toFixed(1) || 0}% Accuracy
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "summary", label: "📊 Overview", icon: "📊" },
              { id: "questions", label: "❓ Questions", icon: "❓" },
              { id: "confidence", label: "🎯 Confidence", icon: "🎯" },
              { id: "performance", label: "📈 Performance", icon: "📈" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8">
          {activeTab === "summary" && (
            <AnalyticsSummary
              analytics={analytics}
              detailedAnalytics={detailedAnalytics}
            />
          )}
          {activeTab === "questions" && (
            <QuestionAnalytics
              analytics={analytics}
              detailedAnalytics={detailedAnalytics}
            />
          )}
          {activeTab === "confidence" && (
            <ConfidenceCalibration
              analytics={analytics}
              detailedAnalytics={detailedAnalytics}
            />
          )}
          {activeTab === "performance" && (
            <PerformanceDistribution
              analytics={analytics}
              detailedAnalytics={detailedAnalytics}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

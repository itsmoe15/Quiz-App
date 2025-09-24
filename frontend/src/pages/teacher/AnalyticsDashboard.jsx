// frontend/src/components/analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { analyticsService } from "../../services/analyticsService";
import AnalyticsSummary from "../../components/analytics/AnalyticsSummary";
import QuestionAnalytics from "../../components/analytics/QuestionAnalytics";
import ConfidenceCalibration from "../../components/analytics/ConfidenceCalibration";
import PerformanceDistribution from "../../components/analytics/PerformanceDistribution";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ResultsTable from "../../components/analytics/resultsTable";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const AnalyticsDashboard = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");

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
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 relative overflow-hidden font-sans">
        {/* Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <LoadingSpinner size="lg" message="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 relative overflow-hidden font-sans">
        {/* Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md relative z-10">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 font-serif">
            Error
          </h2>
          <p className="text-gray-600 mb-4 font-sans">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 font-sans"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 relative overflow-hidden font-sans">
        {/* Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center relative z-10">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 font-serif">
            No Data Available
          </h2>
          <p className="text-gray-600 font-sans">
            No analytics data found for this quiz.
          </p>
          <button
            onClick={loadAnalytics}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 font-sans"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 py-8 relative overflow-hidden font-sans">
      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-3000"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/teacher/quiz/${quizId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 font-serif">
                  Quiz Analytics
                </h1>
                <p className="text-gray-600 font-sans">
                  Detailed insights into student performance and question
                  effectiveness
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold font-sans">
                {analytics.totalAttempts} Attempts
              </span>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold font-sans">
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
              { id: "results", label: "📝 Results", icon: "📝" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 font-sans ${
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
          {activeTab === "results" && <ResultsTable quizId={quizId} />}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

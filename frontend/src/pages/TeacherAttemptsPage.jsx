// frontend/src/pages/TeacherAttemptsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAttemptsForQuiz } from "../services/attemptService";
import { resultsService } from "../services/resultsService"; 

export default function TeacherAttemptsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAttemptsForQuiz(quizId);
        if (!mounted) return;
        console.log("Raw attempts data:", data); 
        setAttempts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch attempts:", err);
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load attempts"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  const handleDownloadCSV = async () => {
    try {
      const blob = await resultsService.exportResults(quizId, "csv");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `quiz-${quizId}-answers.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Failed to download CSV:", err);
      alert("Failed to download answer sheet. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📊</div>
          <h2 className="text-2xl font-bold text-gray-700">
            Loading Attempts...
          </h2>
          <p className="text-gray-600">Gathering student results</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Student Attempts
              </h1>
              <p className="text-gray-600">
                Review and analyze student performance
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleDownloadCSV}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
              >
                📜 Export Answers To CSV
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Back to Quiz
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          {attempts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {attempts.length}
                </div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {attempts.filter((a) => a.status === "submitted").length}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {attempts.reduce((sum, a) => sum + (a.score || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {attempts.length > 0
                    ? Math.round(
                        attempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                          attempts.length
                      )
                    : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          )}
        </div>

        {/* Attempts List */}
        {attempts.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Attempts Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Students haven't attempted this quiz yet.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Back to Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((a) => {
              console.log("👉 Single attempt object:", a); // 🔥 log each attempt individually

              const student = a.studentInfo || {};
              console.log("🧑 studentInfo:", student); // 🔥 log studentInfo explicitly

              const studentName = student.name || "Unknown Student";
              const studentEmail = student.email || "";
              const studentIdentifier = student.studentId || "";

              return (
                <div
                  key={a._id}
                  className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-gray-800">
                            {studentName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {studentIdentifier && (
                              <span className="mr-3">
                                🎓 ID: {studentIdentifier}
                              </span>
                            )}
                            {studentEmail && <span>📧 {studentEmail}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Attempt Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Score:</span>
                          <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full text-xs font-bold">
                            {a.score ?? "—"} points
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              a.status === "submitted"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {a.status
                              ? a.status.charAt(0).toUpperCase() +
                                a.status.slice(1)
                              : "In Progress"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Submitted:</span>
                          <span>
                            {a.submittedAt
                              ? new Date(a.submittedAt).toLocaleString()
                              : new Date(a.startedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

{/* FIXME: impelemnt view with the teacher api not student */}
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/attempts/${a._id}`)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        title="View detailed answers"
                      >
                        📊 View Answers
                      </button>
{/* FIXME: impelemnt view with the teacher api not student */}

                      {/* <button
                        onClick={() => {
                          window.open(
                            `${window.location.origin}/attempts/${a._id}`,
                            "_blank"
                          );
                        }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                        title="Open in new tab"
                      >
                        🔗 Open
                      </button> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

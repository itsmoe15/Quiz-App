import React, { useEffect, useState } from "react";
import { resultsService } from "../../services/resultsService";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const ResultsTable = ({ quizId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("🔍 Fetching results for quiz:", quizId);

        const res = await resultsService.getQuizResults(quizId);

        console.log("📊 Full API response:", res);
        console.log("📊 Response data structure:", Object.keys(res));

        // Check different possible response structures
        if (res.results && Array.isArray(res.results)) {
          console.log(
            "✅ Found results array with",
            res.results.length,
            "items"
          );
          const formattedResults = res.results.map((attempt, index) => {
            console.log(`📝 Attempt ${index}:`, attempt);
            return {
              studentName:
                attempt.studentId?.name ||
                attempt.studentName ||
                attempt.studentId?._id ||
                "Unknown Student",
              score: attempt.score || 0,
              maxPossibleScore:
                attempt.maxPossibleScore || attempt.totalQuestions || 1,
              accuracy:
                attempt.score &&
                (attempt.maxPossibleScore || attempt.totalQuestions)
                  ? (attempt.score /
                      (attempt.maxPossibleScore || attempt.totalQuestions)) *
                    100
                  : 0,
              submittedAt:
                attempt.submittedAt ||
                attempt.createdAt ||
                new Date().toISOString(),
            };
          });
          setResults(formattedResults);
        } else if (Array.isArray(res)) {
          console.log(
            "✅ Response is directly an array with",
            res.length,
            "items"
          );
          const formattedResults = res.map((attempt, index) => {
            console.log(`📝 Attempt ${index}:`, attempt);
            return {
              studentName:
                attempt.studentId?.name ||
                attempt.studentName ||
                attempt.studentId?._id ||
                "Unknown Student",
              score: attempt.score || 0,
              maxPossibleScore:
                attempt.maxPossibleScore || attempt.totalQuestions || 1,
              accuracy:
                attempt.score &&
                (attempt.maxPossibleScore || attempt.totalQuestions)
                  ? (attempt.score /
                      (attempt.maxPossibleScore || attempt.totalQuestions)) *
                    100
                  : 0,
              submittedAt:
                attempt.submittedAt ||
                attempt.createdAt ||
                new Date().toISOString(),
            };
          });
          setResults(formattedResults);
        } else if (res.attempts && Array.isArray(res.attempts)) {
          console.log(
            "✅ Found attempts array with",
            res.attempts.length,
            "items"
          );
          const formattedResults = res.attempts.map((attempt, index) => {
            console.log(`📝 Attempt ${index}:`, attempt);
            return {
              studentName:
                attempt.studentId?.name ||
                attempt.studentName ||
                attempt.studentId?._id ||
                "Unknown Student",
              score: attempt.score || 0,
              maxPossibleScore:
                attempt.maxPossibleScore || attempt.totalQuestions || 1,
              accuracy:
                attempt.score &&
                (attempt.maxPossibleScore || attempt.totalQuestions)
                  ? (attempt.score /
                      (attempt.maxPossibleScore || attempt.totalQuestions)) *
                    100
                  : 0,
              submittedAt:
                attempt.submittedAt ||
                attempt.createdAt ||
                new Date().toISOString(),
            };
          });
          setResults(formattedResults);
        } else {
          console.warn("⚠️ Unexpected response structure:", res);
          setResults([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch results:", err);
        setError(`Failed to load results: ${err.message}`);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchResults();
    }
  }, [quizId]);

  const handleExportCSV = () => {
    if (!results.length) return;

    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `quiz_${quizId}_results.csv`);
  };

  if (loading)
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading results...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg">⚠️</div>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );

  if (!results.length)
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-2">📊</div>
        <p className="text-gray-600">No results available for this quiz yet.</p>
        <p className="text-gray-500 text-sm mt-1">
          Students need to complete the quiz first.
        </p>
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Student Results</h2>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          📥 Export to CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.score} / {result.maxPossibleScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.accuracy >= 80
                          ? "bg-green-100 text-green-800"
                          : result.accuracy >= 60
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {results.length} result{results.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default ResultsTable;

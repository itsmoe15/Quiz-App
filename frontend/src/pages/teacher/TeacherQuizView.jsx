import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizById,
  deleteQuiz,
  publishQuiz,
} from "../../services/quizService";
import LatexRenderer from "../../components/LatexRenderer";

export default function TeacherQuizView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteQuiz(quiz._id);
      navigate("/teacher/quizzes");
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      alert("Failed to delete quiz. Please try again.");
    }
  };

  const handlePublish = async () => {
    if (!quiz?._id) return;
    if (!window.confirm("Publish this quiz? Students will be able to join it."))
      return;

    try {
      setPublishing(true);
      const res = await publishQuiz(quiz._id);
      if (res && res.quiz) {
        setQuiz(res.quiz);
        alert(res.message || "Quiz published");
      } else {
        setQuiz((q) => ({ ...q, published: true }));
        alert("Quiz published");
      }
    } catch (err) {
      console.error("Publish failed:", err);
      const msg =
        err?.response?.data?.error || err?.message || "Publish failed";
      alert(msg);
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await getQuizById(id);
        if (!mounted) return;
        setQuiz(res);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.error || err?.message || "Failed to load quiz."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-700">Loading quiz...</h2>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate("/teacher/quizzes")}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );

  if (!quiz)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Quiz Not Found
          </h2>
          <p className="text-gray-600">
            The requested quiz could not be found.
          </p>
          <button
            onClick={() => navigate("/teacher/quizzes")}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {quiz.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{quiz.description}</p>

              {/* Quiz Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm text-purple-600 font-medium">
                    Quiz Code
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {quiz.quizCode}
                  </div>
                </div>
                {quiz.pin && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600 font-medium">PIN</div>
                    <div className="text-lg font-bold text-blue-700">
                      {quiz.pin}
                    </div>
                  </div>
                )}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-green-600 font-medium">
                    Status
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      quiz.published ? "text-green-700" : "text-orange-600"
                    }`}
                  >
                    {quiz.published ? "Published" : "Unpublished"}
                  </div>
                </div>
              </div>

              {/* Join URL */}
              {quiz.joinUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Join Link
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <a
                      href={quiz.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-all flex-1"
                    >
                      {quiz.joinUrl}
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(quiz.joinUrl);
                          alert("Join link copied to clipboard!");
                        } catch {
                          alert("Copy failed, please copy manually.");
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/teacher/quizzes/${quiz._id}/edit`)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                ✏️ Edit Quiz
              </button>

              {!quiz.published && (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? "⏳ Publishing..." : "📢 Publish"}
                </button>
              )}

              <button
                onClick={() =>
                  navigate(`/teacher/quizzes/${quiz._id}/attempts`)
                }
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                📊 View Answers
              </button>
              <button
                onClick={() =>
                  navigate(`/teacher/quizzes/${quiz._id}/analytics/summary`)
                }
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                📊 Analytics
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                🗑️ Delete
              </button>

              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Additional Quiz Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(quiz.createdAt).toLocaleString()}
            </div>
            {quiz.startAt && (
              <div>
                <span className="font-medium">Starts:</span>{" "}
                {new Date(quiz.startAt).toLocaleString()}
              </div>
            )}
            {quiz.endAt && (
              <div>
                <span className="font-medium">Ends:</span>{" "}
                {new Date(quiz.endAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Questions ({quiz.questions?.length || 0})
            </h2>
            <span className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Total Points:{" "}
              {quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0) ||
                0}
            </span>
          </div>

          {Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
            <div className="space-y-6">
              {quiz.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-4 mb-3 lg:mb-0">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full text-sm font-semibold">
                        Q{idx + 1}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium capitalize">
                        {q.type}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        {q.points || 1} point{q.points !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Prompt:
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <LatexRenderer content={q.prompt} />
                    </div>
                  </div>

                  {/* MCQ Options */}
                  {q.type === "mcq" && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        Options:
                      </div>
                      <div className="space-y-2">
                        {Array.isArray(q.options) ? (
                          q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                String(q.correctAnswer) === String(opt.id)
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold ${
                                  String(q.correctAnswer) === String(opt.id)
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-300 text-gray-700"
                                }`}
                              >
                                {opt.id}
                              </div>
                              <div className="flex-1">
                                <LatexRenderer content={opt.text} />
                              </div>
                              {String(q.correctAnswer) === String(opt.id) && (
                                <div className="text-green-600 font-semibold">
                                  ✓ Correct
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500">No options</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Short Answer */}
                  {q.type === "short" && (
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Model Answer:
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <LatexRenderer
                            content={q.correctAnswer || "No answer provided"}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            q.allowLateSubmission
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {q.allowLateSubmission
                            ? "Allows late submission"
                            : "No late submissions"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Numeric Answer */}
                  {q.type === "numeric" && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Correct Answer:
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <LatexRenderer
                          content={String(
                            q.correctAnswer ?? "No answer provided"
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Questions
              </h3>
              <p className="text-gray-600">
                This quiz doesn't have any questions yet.
              </p>
              <button
                onClick={() => navigate(`/teacher/quizzes/${quiz._id}/edit`)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Add Questions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuizById,
  deleteQuiz,
  publishQuiz,
} from "../../services/quizService";
import LatexRenderer from "../../components/LatexRenderer";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast, Slide } from "react-toastify";

export default function TeacherQuizView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [showJoinLink, setShowJoinLink] = useState(false);

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
      toast.error("Failed to delete quiz. Please try again.", {
      position: "bottom-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Slide,
      });
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
        toast.success('Quiz published', {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
        });
      } else {
        setQuiz((q) => ({ ...q, published: true }));
        toast.success('Quiz published', {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
        });
      }
    } catch (err) {
      console.error("Publish failed:", err);
      const msg =
        err?.response?.data?.error || err?.message || "Publish failed";
        toast.error(msg, {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
        });
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="text-center relative z-10">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-700">Loading quiz...</h2>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md relative z-10">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md relative z-10">
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 p-6 relative overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-3000"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {quiz.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{quiz.description}</p>

              {/* Quiz Info Grid */}
              <div
                className={`grid gap-4 mb-4 ${
                  quiz.published
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2"
                }`}
              >
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

              {/* Join URL Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    Join Link
                  </div>
                  {!quiz.published && (
                    <button
                      onClick={() => setShowJoinLink(!showJoinLink)}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all duration-200"
                    >
                      {showJoinLink ? (
                        <>
                          <EyeSlashIcon className="w-4 h-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <EyeIcon className="w-4 h-4" />
                          Show Link
                        </>
                      )}
                    </button>
                  )}
                </div>

                {(quiz.published || showJoinLink) && (
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
                    <div className="flex-1 min-w-0">
                      <a
                        href={quiz.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline truncate"
                        title={quiz.joinUrl}
                      >
                        {quiz.joinUrl}
                      </a>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(quiz.joinUrl);
                          toast.success(`Join link copied to clipboard!`, {
                          position: "bottom-right",
                          autoClose: 2500,
                          hideProgressBar: false,
                          closeOnClick: false,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "colored",
                          transition: Slide,
                          });
                        } catch {
                          toast.error('Copy failed, please copy manually.', {
                          position: "bottom-right",
                          autoClose: 2500,
                          hideProgressBar: false,
                          closeOnClick: false,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          theme: "colored",
                          transition: Slide,
                          });
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                    >
                      Copy Link
                    </button>
                  </div>
                )}

                {!quiz.published && !showJoinLink && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 text-orange-800">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-medium">Quiz is unpublished</span>
                      <span className="text-sm">
                        - Click "Show Link" to preview the join URL
                      </span>
                    </div>
                  </div>
                )}

                {!quiz.published && showJoinLink && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 text-yellow-800 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Note:</span>
                      <span>
                        Students cannot join until you publish the quiz
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex flex-col gap-3 w-full lg:w-auto sm:grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3`}>
              <button
                onClick={() => navigate(`/teacher/quizzes/${quiz._id}/edit`)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
              >
                ✏️ Edit Quiz
              </button>

              {!quiz.published && (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {publishing ? "⏳ Publishing..." : "📢 Publish"}
                </button>
              )}

              <button
                onClick={() => navigate(`/teacher/quizzes/${quiz._id}/attempts`)}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
              >
                📊 View Answers
              </button>

              <button
                onClick={() => navigate(`/teacher/quizzes/${quiz._id}/analytics/summary`)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
              >
                📈 Analytics
              </button>

              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
              >
                🗑️ Delete
              </button>

              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 whitespace-nowrap"
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Questions ({quiz.questions?.length || 0})
            </h2>
            <span className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
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
                    <div className="flex flex-wrap items-center gap-4 mb-3 lg:mb-0">
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

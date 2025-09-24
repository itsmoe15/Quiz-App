// frontend/src/pages/AttemptResultPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAttemptById, getPublicAttempt } from "../services/attemptService";
import LatexRenderer from "../components/LatexRenderer";
import QRCode from "qrcode"; // use named import

export default function AttemptResultPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    const url = window.location.href;

    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      width: 150,
      margin: 2,
      color: {
        dark: '#000000ff', 
        light: '#00000000' 
      }
    })
    .then(dataUrl => setQrCodeDataUrl(dataUrl))
    .catch(err => console.error(err));

    (async () => {
      setLoading(true);
      setError("");
      try {
        // try protected endpoint first
        try {
          const res = await getAttemptById(attemptId);
          if (!mounted) return;
          setAttempt(res);
          // server returns attempt with populated quizId or embed quiz
          setQuiz(res.quiz ?? res.quizId ?? null);
          setLoading(false);
          return;
        } catch (err) {
          // try public endpoint as fallback
          console.warn(
            "protected attempt fetch failed, falling back to public",
            err
          );
        }

        const pub = await getPublicAttempt(attemptId);
        if (!mounted) return;
        setAttempt(pub);
        setQuiz(pub.quiz ?? pub.quizId ?? null);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.error || err?.message || "Failed to load attempt"
        );
      } finally {
        if (mounted) setLoading(false);
      }
      
    })();
    return () => {
      mounted = false;
    };
  }, [attemptId]);
  
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <h2 className="text-2xl font-bold text-white">Loading Results...</h2>
          <p className="text-white/80">Crunching the numbers!</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

  if (!attempt || !quiz)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Found</h2>
          <p className="text-gray-600">Attempt or quiz not found</p>
        </div>
      </div>
    );

  // Ensure exam end date passed before showing results (if endAt provided)
  if (quiz.endAt) {
    const end = new Date(quiz.endAt).getTime();

    if (Date.now() < end) {
      return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-4 text-center">
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Results Locked
        </h2>
        <p className="text-gray-600 mb-4">
          The exam finishes at <strong>9/24/2025, 3:00:00 PM</strong>.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Please come back after that time to view your score and answers.
        </p>

        {qrCodeDataUrl && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-700 text-sm mb-1">
Scan this QR code to quickly return to this page later.
            </p>
            <img src={qrCodeDataUrl} alt="Exam QR Code" className="w-36 h-36" />
          </div>
        )}
      </div>
    </div>
  );
}
  }

  // extract student info (support both studentInfo or populated studentId)
  const studentInfo =
    attempt.studentInfo ||
    (attempt.studentId &&
    (attempt.studentId.name ||
      attempt.studentId.email ||
      attempt.studentId.studentId)
      ? {
          name: attempt.studentId.name,
          email: attempt.studentId.email,
          studentId: attempt.studentId.studentId,
        }
      : { name: "Unknown", email: "", studentId: "" });

  const totalScore = attempt.score ?? 0;
  const maxPossible =
    attempt.maxPossibleScore ??
    (quiz.questions
      ? quiz.questions.reduce((s, q) => s + (q.points || 0), 0)
      : 0);
  const percentage =
    maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      <div className="max-w-4xl mx-auto px-4 ">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {quiz.title ?? "Quiz Results"}
          </h1>

          {/* Score Card */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 text-white mb-6">
            <div className="text-6xl font-bold mb-2">
              {totalScore}
              <span className="text-2xl">/{maxPossible}</span>
            </div>
            <div className="text-2xl font-semibold">{percentage}%</div>
            <div className="text-lg opacity-90">Final Score</div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold">👤 Name</div>
              <div>{studentInfo.name}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold">📧 Email</div>
              <div>{studentInfo.email || <em>—</em>}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold">🎓 Student ID</div>
              <div>{studentInfo.studentId || <em>—</em>}</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Submitted at:{" "}
            {attempt.submittedAt
              ? new Date(attempt.submittedAt).toLocaleString()
              : "Not submitted"}
          </div>
        </div>

        {/* Questions Results */}
        <div className="space-y-6">
          {Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
            quiz.questions.map((q, idx) => {
              // find matching answer entry by questionId
              const answer = (attempt.answers || []).find(
                (a) =>
                  String(a.questionId) === String(q._id) ||
                  String(a.questionId) === String(q._id)
              );
              const selected =
                answer?.selectedOptionId ?? answer?.typedAnswer ?? null;
              const isCorrect = !!answer?.correct;
              const pointsAwarded = answer?.questionPointsAwarded ?? 0;
              const confidence = answer?.confidence ?? 0;

              return (
                <div
                  key={idx}
                  className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full text-sm font-semibold">
                          Q{idx + 1}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                          {q.type}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {q.points || 1} point{q.points !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="text-lg font-semibold mb-4">
                        <LatexRenderer content={q.prompt} />
                      </div>

                      {/* show options for mcq */}
                      {q.type === "mcq" && Array.isArray(q.options) && (
                        <div className="space-y-2 mb-4">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                String(q.correctAnswer) === String(opt.id)
                                  ? "bg-green-50 border-green-200"
                                  : String(selected) === String(opt.id)
                                  ? "bg-red-50 border-red-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold ${
                                  String(q.correctAnswer) === String(opt.id)
                                    ? "bg-green-500 text-white"
                                    : String(selected) === String(opt.id)
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-300 text-gray-700"
                                }`}
                              >
                                {opt.id}
                              </div>
                              <div className="flex-1">
                                <LatexRenderer content={opt.text} />
                              </div>
                              <div className="text-sm font-semibold">
                                {String(q.correctAnswer) === String(opt.id) && (
                                  <span className="text-green-600">
                                    ✓ Correct
                                  </span>
                                )}
                                {String(selected) === String(opt.id) &&
                                  String(q.correctAnswer) !==
                                    String(opt.id) && (
                                    <span className="text-red-600">
                                      ✗ Your answer
                                    </span>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* short/numeric show model answer and user's typed */}
                      {(q.type === "short" || q.type === "numeric") && (
                        <div className="space-y-3">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="font-semibold text-green-700 mb-1">
                              ✅ Correct Answer:
                            </div>
                            <LatexRenderer content={q.correctAnswer ?? ""} />
                          </div>
                          <div
                            className={`border rounded-lg p-3 ${
                              isCorrect
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="font-semibold mb-1">
                              Your Answer:
                            </div>
                            <div>
                              {answer?.typedAnswer || <em>Not answered</em>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Result Badge */}
                    <div
                      className={`px-4 py-3 rounded-xl text-center min-w-[120px] ${
                        isCorrect
                          ? "bg-green-100 border border-green-300"
                          : "bg-red-100 border border-red-300"
                      }`}
                    >
                      <div
                        className={`text-2xl font-bold ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCorrect ? "✅" : "❌"}
                      </div>
                      <div
                        className={`font-semibold ${
                          isCorrect ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Points: {pointsAwarded}
                      </div>
                      <div className="text-sm text-gray-600">
                        Confidence: {confidence}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Questions
              </h3>
              <p className="text-gray-600">
                No questions recorded for this quiz.
              </p>
            </div>
          )}
        </div>

        {/* Fun Footer */}
        <div className="text-center mt-8">
          <p className="text-white/80 text-sm">
            Great job! 🎉 Keep learning and improving!
          </p>
        </div>
      </div>
    </div>
  );
}

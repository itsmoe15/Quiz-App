// frontend/src/pages/AttemptResultPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAttemptById, getPublicAttempt } from "../services/attemptService";
import LatexRenderer from "../components/LatexRenderer";

export default function AttemptResultPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
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
          console.warn("protected attempt fetch failed, falling back to public", err);
        }

        const pub = await getPublicAttempt(attemptId);
        if (!mounted) return;
        setAttempt(pub);
        setQuiz(pub.quiz ?? pub.quizId ?? null);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.error || err?.message || "Failed to load attempt");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [attemptId]);

  if (loading) return <div className="p-6">Loading results...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!attempt || !quiz) return <div className="p-6">Attempt or quiz not found</div>;

  // Ensure exam end date passed before showing results (if endAt provided)
  if (quiz.endAt) {
    const end = new Date(quiz.endAt).getTime();
    if (Date.now() < end) {
      return (
        <div className="p-6 max-w-3xl mx-auto bg-yellow-50 border rounded">
          <h2 className="text-lg font-bold mb-2">Results locked until exam ends</h2>
          <p className="mb-2">The exam finishes at <strong>{new Date(quiz.endAt).toLocaleString()}</strong>.</p>
          <p>Please come back after that time to view your score and answers.</p>
        </div>
      );
    }
  }

  // extract student info (support both studentInfo or populated studentId)
  const studentInfo = attempt.studentInfo || (attempt.studentId && (attempt.studentId.name || attempt.studentId.email || attempt.studentId.studentId) ? {
    name: attempt.studentId.name,
    email: attempt.studentId.email,
    studentId: attempt.studentId.studentId,
  } : { name: "Unknown", email: "", studentId: "" });

  const totalScore = attempt.score ?? 0;
  const maxPossible = attempt.maxPossibleScore ?? (quiz.questions ? quiz.questions.reduce((s, q) => s + (q.points || 0), 0) : 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">{quiz.title ?? "Quiz results"}</h1>

      <div className="mb-4 p-4 border rounded bg-white">
        <div><strong>Name:</strong> {studentInfo.name}</div>
        <div><strong>Email:</strong> {studentInfo.email || <em>—</em>}</div>
        <div><strong>Student ID:</strong> {studentInfo.studentId || <em>—</em>}</div>
        <div className="mt-2"><strong>Score:</strong> {totalScore} / {maxPossible}</div>
        <div><strong>Submitted at:</strong> {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "Not submitted"}</div>
      </div>

      <div className="space-y-4">
        {Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
          quiz.questions.map((q, idx) => {
            // find matching answer entry by questionId
            const answer = (attempt.answers || []).find(a => String(a.questionId) === String(q._id) || String(a.questionId) === String(q._id));
            const selected = answer?.selectedOptionId ?? answer?.typedAnswer ?? null;
            const isCorrect = !!answer?.correct;
            const pointsAwarded = answer?.questionPointsAwarded ?? 0;
            const confidence = answer?.confidence ?? 0;

            return (
              <div key={idx} className="p-4 border rounded bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm text-gray-500">Q{idx + 1} — <span className="font-medium">{(q.type || "").toUpperCase()}</span></div>
                    <div className="mt-2 mb-2"><LatexRenderer content={q.prompt} /></div>

                    {/* show options for mcq */}
                    {q.type === "mcq" && Array.isArray(q.options) && (
                      <div className="space-y-1 mb-2">
                        {q.options.map(opt => (
                          <div key={opt.id} className="flex items-center gap-3">
                            <div className="w-6 text-sm font-mono">{opt.id}</div>
                            <div className="flex-1"><LatexRenderer content={opt.text} /></div>
                            <div className="text-sm">
                              {String(q.correctAnswer) === String(opt.id) && <span className="text-green-700 font-medium">Correct</span>}
                              {String(selected) === String(opt.id) && <span className="ml-2 text-indigo-700">Your answer</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* short/numeric show model answer and user's typed */}
                    {q.type === "short" && (
                      <div className="mb-2">
                        <div><strong>Model answer:</strong> <LatexRenderer content={q.correctAnswer ?? ""} /></div>
                        <div><strong>Your answer:</strong> {answer?.typedAnswer ?? <em>Not answered</em>}</div>
                      </div>
                    )}
                    {q.type === "numeric" && (
                      <div className="mb-2">
                        <div><strong>Model numeric answer:</strong> {String(q.correctAnswer ?? "")}</div>
                        <div><strong>Your answer:</strong> {answer?.typedAnswer ?? <em>Not answered</em>}</div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className={`font-semibold ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </div>
                    <div className="text-sm">Points: {pointsAwarded}</div>
                    <div className="text-sm">Confidence: {confidence ?? 0}%</div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-gray-500">No questions recorded for this quiz.</div>
        )}
      </div>
    </div>
  );
}

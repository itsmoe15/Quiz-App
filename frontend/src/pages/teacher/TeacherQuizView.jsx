// frontend/src/pages/teacher/TeacherQuizView.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById } from "../../services/quizService";
import LatexRenderer from "../../components/LatexRenderer";
import { deleteQuiz } from "../../services/quizService"; 

export default function TeacherQuizView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
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


  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await getQuizById(id);
        const payload =  res;
        if (!mounted) return;
        setQuiz(payload);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load quiz."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <p className="p-6">Loading quiz...</p>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!quiz) return <div className="p-6">Quiz not found</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{quiz.title}</h1>
          <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
          <div className="text-xs text-gray-500">
            <div>Code: <span className="font-medium">{quiz.quizCode}</span></div>
            {quiz.pin && <div>PIN: <span className="font-medium">{quiz.pin}</span></div>}
            <div>Created: <span className="font-medium">{new Date(quiz.createdAt).toLocaleString()}</span></div>
            {quiz.startAt && <div>Starts: {new Date(quiz.startAt).toLocaleString()}</div>}
            {quiz.endAt && <div>Ends: {new Date(quiz.endAt).toLocaleString()}</div>}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 border rounded bg-white"
          >
            Back
          </button>

        <button
          onClick={() => navigate(`/teacher/quizzes/${quiz._id}/edit`)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Edit Quiz
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Delete Quiz
        </button>
        </div>
      </div>

      <div className="space-y-4">
        {Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
          quiz.questions.map((q, idx) => (
            <div key={idx} className="border p-4 rounded bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-gray-500">Q{idx + 1} — <span className="font-medium">{q.type.toUpperCase()}</span></div>
                  <div className="mt-2">
                    <LatexRenderer content={q.prompt} />
                  </div>
                </div>
                <div className="text-sm text-gray-500">Points: <span className="font-medium">{q.points ?? 1}</span></div>
              </div>

              {/* MCQ */}
              {q.type === "mcq" && (
                <div className="mt-2">
                  {Array.isArray(q.options) ? (
                    q.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-3 mb-1">
                        <div className="w-6 text-sm font-mono">{opt.id}</div>
                        <div className="flex-1">{opt.text}</div>
                        {String(q.correctAnswer) === String(opt.id) && (
                          <div className="text-sm text-green-700 font-medium">Correct</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No options</div>
                  )}
                </div>
              )}

              {/* Short answer */}
              {q.type === "short" && (
                <div className="mt-2">
                  <div className="text-sm text-gray-700 mb-1">
                    <strong>Model answer:</strong> {q.correctAnswer ?? <em>None</em>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {q.allowLateSubmission ? "Allows late submission" : "No late submissions"}
                  </div>
                </div>
              )}

              {/* Numeric */}
              {q.type === "numeric" && (
                <div className="mt-2 text-sm">
                  <div><strong>Correct numeric answer:</strong> {String(q.correctAnswer ?? "")}</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500">No questions found for this quiz.</div>
        )}
      </div>
    </div>
  );
}

// frontend/src/pages/TeacherAttemptsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAttemptsForQuiz } from "../services/attemptService";

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
        console.log("📌 Raw attempts data:", data); // 🔥 log all attempts
        setAttempts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch attempts:", err);
        setError(
          err?.response?.data?.error || err?.message || "Failed to load attempts"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  if (loading) return <div className="p-6">Loading attempts...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Attempts</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 border rounded bg-white"
        >
          Back
        </button>
      </div>

      {attempts.length === 0 ? (
        <div className="text-gray-500">No attempts yet.</div>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => {
            console.log("👉 Single attempt object:", a); // 🔥 log each attempt individually

            const student = a.studentInfo || {};
            console.log("🧑 studentInfo:", student); // 🔥 log studentInfo explicitly

            const studentName = student.name || "Unknown";
            const studentEmail = student.email || "";
            const studentIdentifier = student.studentId || "";

            return (
              <div
                key={a._id}
                className="p-4 border rounded bg-white flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{studentName}</div>
                  <div className="text-xs text-gray-500">
                    {studentIdentifier ? (
                      <>
                        ID:{" "}
                        <span className="font-medium">{studentIdentifier}</span>{" "}
                        •{" "}
                      </>
                    ) : null}
                    {studentEmail ? (
                      <>
                        Email:{" "}
                        <span className="font-medium">{studentEmail}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Score:{" "}
                    <span className="font-medium">{a.score ?? "—"}</span>
                    {" • "}
                    {a.status ? (
                      <span className="capitalize">{a.status}</span>
                    ) : null}
                    {" • "}
                    {a.submittedAt
                      ? new Date(a.submittedAt).toLocaleString()
                      : new Date(a.startedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/attempts/${a._id}`)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    title="View answers (teacher)"
                  >
                    View Answers
                  </button>

                  <button
                    onClick={() => {
                      window.open(
                        `${window.location.origin}/attempts/${a._id}`,
                        "_blank"
                      );
                    }}
                    className="px-3 py-1 border rounded bg-white"
                    title="Open in new tab"
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

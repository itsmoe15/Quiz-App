// frontend/src/pages/JoinQuizPage.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { startPublicAttempt } from "../services/attemptService";
import { getPublicQuiz, validatePin } from "../services/quizService";

function formatRemaining(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function JoinQuizPage() {
  const { quizCode } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizMeta, setQuizMeta] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const meta = await getPublicQuiz(quizCode);
        if (!mounted) return;
        setQuizMeta(meta);

        if (meta.startAt) {
          const startMs = new Date(meta.startAt).getTime();
          const now = Date.now();
          if (startMs > now) {
            setRemaining(startMs - now);
            intervalRef.current = setInterval(() => {
              const diff = startMs - Date.now();
              setRemaining(diff > 0 ? diff : 0);
            }, 1000);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.error || err?.message || "Failed to load quiz info");
      }
    })();
    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [quizCode]);

  const handleStart = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // optional pre-validate pin for faster UX
      if (quizMeta?.pinRequired) {
        try {
          await validatePin({ quizCode, pin });
        } catch (err) {
          const msg = err?.response?.data?.error || err?.message || "Invalid PIN";
          setError(msg);
          setLoading(false);
          return;
        }
      }

      // ensure published + not before start (server also checks, this is UX)
      if (!quizMeta?.published) {
        setError("Quiz is not published yet.");
        setLoading(false);
        return;
      }
      if (quizMeta?.startAt) {
        const startMs = new Date(quizMeta.startAt).getTime();
        if (startMs > Date.now()) {
          setError("Quiz has not started yet.");
          setLoading(false);
          return;
        }
      }

      const body = {
        quizCode,
        name,
        email,
        studentId,
        pin: pin || undefined,
      };
      const res = await startPublicAttempt(body);
      localStorage.setItem(
        "publicAttempt",
        JSON.stringify({
          attemptId: res.attemptId,
          quizCode,
          name,
          email,
          studentId,
        })
      );
      navigate(`/q/${quizCode}/attempt/${res.attemptId}`);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.message || "Failed to start quiz";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (error && !quizMeta) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
      <form onSubmit={handleStart} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        {/* <h2 className="text-xl font-bold mb-4">Join Quiz: {quizCode}</h2> this shit is ugly the title is better but imma keep this here for reference */}
        <h2 className="text-xl font-bold mb-4">
            {quizMeta ? quizMeta.title : "Loading quiz..."}
        </h2>


        {quizMeta && (
          <>
            <p className="text-sm text-gray-600 mb-2">Join Quiz: {quizCode}</p>
            <p className="text-xs text-gray-500 mb-3">
              Status: <span className="font-medium">{quizMeta.published ? "Published" : "Unpublished"}</span>
            </p>

            {quizMeta.published && quizMeta.startAt && new Date(quizMeta.startAt) > new Date() && (
              <div className="mb-3 p-3 bg-yellow-50 border rounded text-sm">
                Quiz starts at: {new Date(quizMeta.startAt).toLocaleString()} — starting in {formatRemaining(remaining)}
              </div>
            )}

            {!quizMeta.published && (
              <div className="mb-3 p-3 bg-red-50 border rounded text-sm">
                Quiz is not published yet. You cannot start this quiz.
              </div>
            )}
          </>
        )}

        {error && <div className="mb-3 text-red-600">{error}</div>}

        <label className="block mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mb-3 border rounded" required />

        <label className="block mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-3 border rounded" required />

        <label className="block mb-1">Student ID</label>
        <input value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full p-2 mb-3 border rounded" />

        {quizMeta?.pinRequired && (
          <>
            <label className="block mb-1">PIN</label>
            <input value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-2 mb-3 border rounded" />
          </>
        )}

        <button
          disabled={loading || !quizMeta || !quizMeta.published || (quizMeta.startAt && new Date(quizMeta.startAt) > new Date())}
          className="w-full bg-green-500 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Starting..." : "Start Quiz"}
        </button>
      </form>
    </div>
  );
}

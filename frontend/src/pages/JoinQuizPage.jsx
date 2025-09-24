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
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
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

      const updateRemaining = () => {
        if (!meta) return;

        const now = Date.now();
        const startTime = meta.startAt ? new Date(meta.startAt).getTime() : null;
        const endTime = meta.endAt ? new Date(meta.endAt).getTime() : null;

        if (startTime && now < startTime) {
          // Quiz hasn't started yet
          setRemaining(startTime - now);
        } else if (endTime && now < endTime) {
          // Quiz ongoing, countdown to end
          setRemaining(endTime - now);
        } else {
          // Quiz ended
          setRemaining(0);
        }
      };

      // Initial call
      updateRemaining();

      // Clear any existing interval first
      if (intervalRef.current) clearInterval(intervalRef.current);

      // Set interval to update countdown every second
      intervalRef.current = setInterval(updateRemaining, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to load quiz info"
      );
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
      if (quizMeta?.pinRequired) {
        try {
          await validatePin({ quizCode, pin });
        } catch (err) {
          const msg =
            err?.response?.data?.error || err?.message || "Invalid PIN";
          setError(msg);
          setLoading(false);
          return;
        }
      }

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
      if (quizMeta?.endAt) {
        const endMs = new Date(quizMeta.endAt).getTime();
        if (endMs < Date.now()) {
          setError("Quiz has ended. You can no longer take it.");
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
      const msg =
        err?.response?.data?.error || err?.message || "Failed to start quiz";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (error && !quizMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <form
        onSubmit={handleStart}
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8 w-full max-w-md relative z-10"
      >
        {/* Quiz Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl text-white font-bold">Q</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {quizMeta ? quizMeta.title : "Loading..."}
          </h2>
          <p className="text-gray-600 text-sm">
            Quiz Code: <span className="font-mono font-bold">{quizCode}</span>
          </p>
        </div>

        {quizMeta && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Quiz Status:</span>
              <span
                className={`font-semibold ${
                  !quizMeta.published
                    ? "text-red-600"
                    : quizMeta.startAt && new Date() < new Date(quizMeta.startAt)
                    ? "text-yellow-600"
                    : quizMeta.endAt && new Date() > new Date(quizMeta.endAt)
                    ? "text-gray-500"
                    : "text-green-600"
                }`}
              >
                {!quizMeta.published
                  ? "Not Published"
                  : quizMeta.startAt && new Date() < new Date(quizMeta.startAt)
                  ? "Will Start Soon"
                  : quizMeta.endAt && new Date() > new Date(quizMeta.endAt)
                  ? "Over"
                  : "Open Now"}
              </span>
            </div>

            {quizMeta.published && (quizMeta.startAt || quizMeta.endAt) && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
                {quizMeta.startAt && new Date(quizMeta.startAt) > new Date() ? (
                  // Quiz hasn't started yet
                  <>
                    <div className="text-yellow-800 font-semibold text-sm mb-1">
                      Starts In
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 font-mono">
                      {formatRemaining(remaining)}
                    </div>
                    <div className="text-yellow-600 text-xs mt-1">
                      {new Date(quizMeta.startAt).toLocaleString()}
                    </div>
                  </>
                ) : quizMeta.endAt && new Date(quizMeta.endAt) < new Date() ? (
                  // Quiz already ended
                  <>
                    <div className="text-red-800 font-semibold text-sm mb-1">
                      Exam Over
                    </div>
                    <div className="text-2xl font-bold text-red-600 font-mono">
                      00:00:00
                    </div>
                    <div className="text-red-600 text-xs mt-1">
                      Ended on {new Date(quizMeta.endAt).toLocaleString()}
                    </div>
                  </>
                ) : quizMeta.endAt && new Date(quizMeta.startAt) <= new Date() ? (
                  // Quiz ongoing
                  <>
                    <div className="text-green-800 font-semibold text-sm mb-1">
                      Ends In
                    </div>
                    <div className="text-2xl font-bold text-green-600 font-mono">
                      {formatRemaining(remaining)}
                    </div>
                    <div className="text-green-600 text-xs mt-1">
                      Ends on {new Date(quizMeta.endAt).toLocaleString()}
                    </div>
                  </>
                ) : null}
              </div>
            )}



            {!quizMeta.published && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
                <div className="text-red-600 font-semibold">
                  Quiz Not Available
                </div>
                <div className="text-red-500 text-sm">
                  Wait for teacher to publish
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Player Info Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student ID (Optional)
            </label>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter student ID"
            />
          </div>

          {quizMeta?.pinRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz PIN
              </label>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter PIN code"
              />
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          disabled={
            loading ||
            !quizMeta ||
            !quizMeta.published ||
            (quizMeta.startAt && new Date(quizMeta.startAt) > new Date()) ||
            (quizMeta.endAt && new Date(quizMeta.endAt) < new Date())
          }
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Starting Quiz...
            </div>
          ) : (
            "🎮 Start Quiz"
          )}
        </button>

        {/* footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Get ready to test your knowledge!
          </p>
        </div>
      </form>
    </div>
  );
}

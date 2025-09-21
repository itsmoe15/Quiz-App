import { useState, useEffect } from "react";
import {
  createQuiz,
  updateQuiz,
  getQuizById,
} from "../../services/quizService";
import { useNavigate, useParams } from "react-router-dom";
import QuestionEditor from "../../components/QuestionEditor";

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function QuizForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [pin, setPin] = useState("");
  const [startAt, setStartAt] = useState(""); // datetime-local string
  const [endAt, setEndAt] = useState(""); // datetime-local string
  const [settings, setSettings] = useState({
    scoringMode: "confidence_absolute",
    negativeForWrong: false,
    maxConfidencePoints: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load quiz for edit
  useEffect(() => {
    if (!id) return;

    let mounted = true;
    const fetchQuiz = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getQuizById(id);
        // API may return the quiz directly or { quiz, ... } depending on endpoint.
        const quiz = data.quiz ?? data;

        if (!mounted) return;
        setTitle(quiz.title || "");
        setDescription(quiz.description || "");
        setQuestions(Array.isArray(quiz.questions) ? quiz.questions : []);
        setPin(quiz.pin || "");

        setStartAt(quiz.startAt ? toLocalInput(quiz.startAt) : "");
        setEndAt(quiz.endAt ? toLocalInput(quiz.endAt) : "");
        setSettings(quiz.settings || settings);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load quiz for editing."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function validateBeforeSend() {
    if (!title.trim()) {
      setError("Title is required.");
      return false;
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      setError("Add at least one question.");
      return false;
    }

    // Basic question-level validation (can expand)
    for (const [idx, q] of questions.entries()) {
      if (!q.type || !q.prompt) {
        setError(`Question ${idx + 1} is missing type or prompt.`);
        return false;
      }
      if (q.type === "mcq") {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          setError(`MCQ #${idx + 1} needs at least 2 options.`);
          return false;
        }
        if (q.correctAnswer == null) {
          setError(`MCQ #${idx + 1} needs a correctAnswer.`);
          return false;
        }
      }
      // numeric/short can also be validated if needed
    }

    return true;
  }

  const handleSave = async () => {
    setError("");
    if (!validateBeforeSend()) return;

    setLoading(true);
    try {
      // Convert datetime-local to ISO strings (or undefined if empty)
      const payload = {
        title,
        description,
        questions,
        pin: pin || undefined,
        startAt: startAt ? new Date(startAt).toISOString() : undefined,
        endAt: endAt ? new Date(endAt).toISOString() : undefined,
        settings,
      };

      if (id) {
        await updateQuiz(id, payload);
      } else {
        await createQuiz(payload);
      }

      navigate("/teacher");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error || err?.message || "Failed to save quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-bold mb-4">{id ? "Edit Quiz" : "Create Quiz"}</h2>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">{error}</div>
      )}

      <div className="mb-3">
        <label className="block mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <QuestionEditor questions={questions} setQuestions={setQuestions} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block mb-1">Start (optional)</label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">End (optional)</label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block mb-1">PIN (optional)</label>
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Basic settings UI — expand if you want */}
      <div className="mb-3 p-3 border rounded">
        <label className="block mb-1 font-medium">Settings</label>
        <div className="flex items-center gap-3 mb-2">
          <label>Scoring mode</label>
          <select
            value={settings.scoringMode}
            onChange={(e) =>
              setSettings((s) => ({ ...s, scoringMode: e.target.value }))
            }
            className="p-1 border rounded"
          >
            <option value="confidence_absolute">confidence_absolute</option>
            <option value="confidence_scaled">confidence_scaled</option>
            <option value="binary">binary</option>
          </select>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <label>Negative for wrong</label>
          <input
            type="checkbox"
            checked={!!settings.negativeForWrong}
            onChange={(e) =>
              setSettings((s) => ({ ...s, negativeForWrong: e.target.checked }))
            }
          />
        </div>

        <div className="flex items-center gap-3">
          <label>Max confidence points</label>
          <input
            type="number"
            value={settings.maxConfidencePoints ?? ""}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                maxConfidencePoints: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="p-1 border rounded w-24"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? (id ? "Updating..." : "Creating...") : id ? "Update Quiz" : "Create Quiz"}
      </button>
    </div>
  );
}

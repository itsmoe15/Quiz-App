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
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
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
    }

    return true;
  }

  const handleSave = async () => {
    setError("");
    if (!validateBeforeSend()) return;

    setLoading(true);
    try {
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {id ? "Edit Quiz" : "Create New Quiz"}
          </h1>
          <p className="text-gray-600">
            {id
              ? "Update your quiz details and questions"
              : "Create a new quiz for your students"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Quiz Information
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 h-24 resize-vertical"
                placeholder="Enter quiz description"
              />
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <QuestionEditor questions={questions} setQuestions={setQuestions} />

        {/* Schedule & Settings */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Schedule & Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time (optional)
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time (optional)
              </label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN (optional)
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
              placeholder="Enter access PIN"
            />
          </div>

          {/* Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Scoring Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scoring Mode
                </label>
                <select
                  value={settings.scoringMode}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, scoringMode: e.target.value }))
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
                >
                  <option value="confidence_absolute">
                    Confidence Absolute
                  </option>
                  <option value="confidence_scaled">Confidence Scaled</option>
                  <option value="binary">Binary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Confidence Points
                </label>
                <input
                  type="number"
                  value={settings.maxConfidencePoints ?? ""}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      maxConfidencePoints: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={!!settings.negativeForWrong}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    negativeForWrong: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable negative points for wrong answers
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {id ? "Updating..." : "Creating..."}
              </div>
            ) : id ? (
              "Update Quiz"
            ) : (
              "Create Quiz"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/teacher")}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

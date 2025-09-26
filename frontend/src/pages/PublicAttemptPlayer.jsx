/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPublicAttempt,
  savePublicAttempt,
  submitPublicAttempt,
} from "../services/attemptService";
import LatexRenderer from "../components/LatexRenderer";
import { toast, Slide } from "react-toastify";


export default function PublicAttemptPlayer() {
  const { quizCode, attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getPublicAttempt(attemptId);
        if (!mounted) return;
        setAttempt(res);
        setQuiz(res.quiz);
        const as = {};
        (res.answers || []).forEach((a) => {
          as[a.questionId] = { ...a };
        });
        setAnswers(as);
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

  const q = quiz?.questions?.[current];

  const updateAnswer = (questionId, patch) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), ...patch },
    }));
  };

  const doSave = async () => {
    setSaving(true);
    try {
      const answersArray = Object.keys(answers).map((qid) => ({
        questionId: qid,
        selectedOptionId: answers[qid].selectedOptionId,
        typedAnswer: answers[qid].typedAnswer,
        confidence: answers[qid].confidence,
      }));
      await savePublicAttempt(attemptId, { answers: answersArray });
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (!q) return;
    await doSave();
    setSelectedOption(null);

    if (current < quiz.questions.length - 1) {
      setCurrent(current + 1);
    } else {
      try {
        const answersArray = Object.keys(answers).map((qid) => ({
          questionId: qid,
          selectedOptionId: answers[qid].selectedOptionId,
          typedAnswer: answers[qid].typedAnswer,
          confidence: answers[qid].confidence,
        }));
        const res = await submitPublicAttempt(attemptId, {
          answers: answersArray,
        });
        if (res?.viewUrl) {
          toast.success(`Submitted! Your score: ${res.score}/${res.maxPossible}.\nYou can view full results after the exam ends at the provided link:\n\n${res.viewUrl}`, {
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
          const path = new URL(res.viewUrl).pathname;
          navigate(path);
        } else {
          toast.success(`Submitted! Score: ${res.score}/${res.maxPossible}`, {
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
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.error || err?.message || "Submit failed", {
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
    }
  };

  const getOptionColor = (index) => {
    const colors = [
      "bg-red-500 hover:bg-red-600",
      "bg-blue-500 hover:bg-blue-600",
      "bg-green-500 hover:bg-green-600",
      "bg-yellow-500 hover:bg-yellow-600",
    ];
    return colors[index % colors.length];
  };

  const getOptionShape = (index) => {
    const shapes = ["🔴", "🔵", "🟢", "🟡"];
    return shapes[index % shapes.length];
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <h2 className="text-2xl font-bold text-white">Loading Quiz...</h2>
          <p className="text-white/80">Get ready to play!</p>
        </div>
      </div>
    );

  if (!quiz)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Quiz not found"}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {quiz.title}
              </h1>
              <p className="text-gray-600 text-sm">{quiz.description}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                Question {current + 1}{" "}
                <span className="text-gray-400">/ {quiz.questions.length}</span>
              </div>
              <div className="text-sm text-gray-500">
                Player: {attempt?.name}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((current + 1) / quiz.questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8 mb-6">
          {/* Question Prompt */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
              <LatexRenderer content={q.prompt} />
            </div>
            <div className="text-sm text-gray-500">Points: {q.points || 1}</div>
          </div>

          {/* MCQ Options */}
          {q.type === "mcq" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {q.options.map((opt, index) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedOption(opt.id);
                    updateAnswer(q._id, { selectedOptionId: opt.id });
                  }}
                  className={`p-6 rounded-2xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    selectedOption === opt.id ||
                    answers[q._id]?.selectedOptionId === opt.id
                      ? `${getOptionColor(index)} scale-105 shadow-2xl`
                      : `${getOptionColor(index)} opacity-90 hover:opacity-100`
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">{getOptionShape(index)}</span>
                    <span className="text-xl">
                      <LatexRenderer content={opt.text} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Short Answer */}
          {q.type === "short" && (
            <div className="mb-8">
              <textarea
                value={answers[q._id]?.typedAnswer || ""}
                onChange={(e) =>
                  updateAnswer(q._id, { typedAnswer: e.target.value })
                }
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-lg"
                rows={4}
                placeholder="Type your answer here..."
              />
            </div>
          )}

          {/* Numeric Answer */}
          {q.type === "numeric" && (
            <div className="mb-8 text-center">
              <input
                type="number"
                value={answers[q._id]?.typedAnswer ?? ""}
                onChange={(e) =>
                  updateAnswer(q._id, { typedAnswer: e.target.value })
                }
                className="text-4xl font-bold text-center p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 w-48"
                placeholder="0"
              />
            </div>
          )}

          {/* Confidence Slider */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-4 text-center">
              How confident are you? 🎯
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Not sure</span>
              <input
                type="range"
                min={0}
                max={100}
                value={answers[q._id]?.confidence ?? 50}
                onChange={(e) =>
                  updateAnswer(q._id, { confidence: Number(e.target.value) })
                }
                className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-600 [&::-webkit-slider-thumb]:to-pink-600"
              />
              <span className="text-sm text-gray-600">Very confident</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {answers[q._id]?.confidence ?? 50}%
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              if (current > 0) {
                setCurrent(current - 1);
                setSelectedOption(null);
              }
            }}
            disabled={current === 0}
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex gap-4">
            {/* <button
              onClick={doSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {saving ? "💾 Saving..." : "💾 Save"}
            </button> */}

            <button
              onClick={handleNext}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {current < quiz.questions.length - 1
                ? "Next →"
                : "🎯 Submit Quiz"}
            </button>
          </div>
        </div>
      </div>

      {/* Fun footer */}
      <div className="text-center mt-8">
        <p className="text-white/80 text-sm">Good luck! 🍀</p>
      </div>
    </div>
  );
}

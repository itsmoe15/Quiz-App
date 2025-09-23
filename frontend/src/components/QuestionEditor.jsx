import { useState } from "react";
import LatexRenderer from "./LatexRenderer";

export default function QuestionEditor({ questions, setQuestions }) {
  const [previewIndex, setPreviewIndex] = useState(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "mcq",
        prompt: "",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
        ],
        correctAnswer: "",
        points: 1,
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex].text = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    const nextId = String.fromCharCode(
      97 + newQuestions[qIndex].options.length
    );
    newQuestions[qIndex].options.push({ id: nextId, text: "" });
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (previewIndex === index) setPreviewIndex(null);
  };

  const togglePreview = (index) => {
    setPreviewIndex(previewIndex === index ? null : index);
  };

  return (
    <div className="mb-8 flex justify-center">
      <div className="w-full max-w-4xl">
        {" "}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Questions ({questions.length})
          </h3>
          <button
            type="button"
            onClick={addQuestion}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            + Add Question
          </button>
        </div>
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
            <div className="text-6xl mb-4">❓</div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              No questions yet
            </h4>
            <p className="text-gray-600 mb-4">
              Add your first question to start building the quiz
            </p>
            <button
              type="button"
              onClick={addQuestion}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Create First Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const isPreviewing = previewIndex === idx;

              return (
                <div
                  key={idx}
                  className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300"
                >
                  {/* Question Header */}
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full text-sm font-semibold">
                        Question {idx + 1}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                        {q.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => togglePreview(idx)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          isPreviewing
                            ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {isPreviewing ? "✏️ Edit" : "👁️ Preview"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-all duration-300"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-4">
                      {/* Type Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Type
                        </label>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(idx, "type", e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
                          disabled={isPreviewing}
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="short">Short Answer</option>
                          <option value="numeric">Numeric</option>
                        </select>
                      </div>

                      {/* Points */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={q.points || 1}
                          onChange={(e) =>
                            updateQuestion(
                              idx,
                              "points",
                              Number(e.target.value)
                            )
                          }
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
                          disabled={isPreviewing}
                        />
                      </div>
                    </div>

                    {/* Right Column - Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Prompt
                      </label>
                      {!isPreviewing ? (
                        <textarea
                          placeholder="Enter your question here... (Supports LaTeX with $...$)"
                          value={q.prompt}
                          onChange={(e) =>
                            updateQuestion(idx, "prompt", e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 h-32 resize-vertical"
                          rows={4}
                        />
                      ) : (
                        <div className="w-full p-4 border border-gray-300 rounded-xl bg-white min-h-32">
                          <LatexRenderer
                            content={q.prompt || "No prompt provided"}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Type-specific fields */}
                  <div className="mt-6">
                    {q.type === "mcq" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Options
                        </label>
                        <div className="space-y-3">
                          {Array.isArray(q.options) &&
                            q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-gray-200"
                              >
                                <input
                                  type="radio"
                                  name={`correct-${idx}`}
                                  checked={q.correctAnswer === opt.id}
                                  onChange={() =>
                                    updateQuestion(idx, "correctAnswer", opt.id)
                                  }
                                  disabled={isPreviewing}
                                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="font-medium text-gray-600 w-6">
                                  {opt.id}.
                                </span>
                                {!isPreviewing ? (
                                  <input
                                    type="text"
                                    placeholder={`Option ${opt.id}`}
                                    value={opt.text}
                                    onChange={(e) =>
                                      updateOption(idx, oIdx, e.target.value)
                                    }
                                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                  />
                                ) : (
                                  <div className="flex-1 p-2 bg-white rounded-lg">
                                    <LatexRenderer content={opt.text} />
                                  </div>
                                )}
                              </div>
                            ))}
                          {!isPreviewing && (
                            <button
                              type="button"
                              onClick={() => addOption(idx)}
                              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300"
                            >
                              <span>+</span> Add Option
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {(q.type === "short" || q.type === "numeric") && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer {q.type === "short" && "(optional)"}
                          </label>
                          {!isPreviewing ? (
                            q.type === "numeric" ? (
                              <input
                                type="number"
                                value={q.correctAnswer || ""}
                                onChange={(e) =>
                                  updateQuestion(
                                    idx,
                                    "correctAnswer",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
                              />
                            ) : (
                              <input
                                type="text"
                                value={q.correctAnswer || ""}
                                onChange={(e) =>
                                  updateQuestion(
                                    idx,
                                    "correctAnswer",
                                    e.target.value
                                  )
                                }
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50"
                              />
                            )
                          ) : (
                            <div className="w-full p-4 border border-gray-300 rounded-xl bg-white">
                              <LatexRenderer
                                content={
                                  q.correctAnswer || "No answer provided"
                                }
                              />
                            </div>
                          )}
                        </div>

                        {q.type === "short" && (
                          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={!!q.allowLateSubmission}
                              onChange={(e) =>
                                updateQuestion(
                                  idx,
                                  "allowLateSubmission",
                                  e.target.checked
                                )
                              }
                              disabled={isPreviewing}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <label className="text-sm text-gray-700">
                              Allow late submission
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

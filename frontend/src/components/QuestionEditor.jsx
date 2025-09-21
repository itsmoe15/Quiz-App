export default function QuestionEditor({ questions, setQuestions }) {
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
    const nextId = String.fromCharCode(97 + newQuestions[qIndex].options.length); // a, b, c, d...
    newQuestions[qIndex].options.push({ id: nextId, text: "" });
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <h3 className="font-bold mb-2">Questions</h3>

      {questions.map((q, idx) => (
        <div key={idx} className="border p-3 mb-3 rounded bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Question {idx + 1}</span>
            <button
              type="button"
              onClick={() => removeQuestion(idx)}
              className="text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          </div>

          {/* Type selector */}
          <div className="mb-2">
            <label className="block text-sm mb-1">Type</label>
            <select
              value={q.type}
              onChange={(e) => updateQuestion(idx, "type", e.target.value)}
              className="w-full p-1 border rounded"
            >
              <option value="mcq">Multiple Choice</option>
              <option value="short">Short Answer</option>
              <option value="numeric">Numeric</option>
            </select>
          </div>

          {/* Prompt */}
          <div className="mb-2">
            <label className="block text-sm mb-1">Prompt</label>
            <input
              type="text"
              placeholder="Enter question prompt"
              value={q.prompt}
              onChange={(e) => updateQuestion(idx, "prompt", e.target.value)}
              className="w-full p-1 border rounded"
            />
          </div>

          {/* Points */}
          <div className="mb-2">
            <label className="block text-sm mb-1">Points</label>
            <input
              type="number"
              value={q.points || 1}
              onChange={(e) => updateQuestion(idx, "points", Number(e.target.value))}
              className="w-full p-1 border rounded"
            />
          </div>

          {/* Type-specific fields */}
          {q.type === "mcq" && (
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Options</label>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center mb-1 gap-2">
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={q.correctAnswer === opt.id}
                    onChange={() => updateQuestion(idx, "correctAnswer", opt.id)}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${opt.id}`}
                    value={opt.text}
                    onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                    className="flex-1 p-1 border rounded"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(idx)}
                className="text-blue-500 text-sm hover:underline"
              >
                + Add option
              </button>
            </div>
          )}

          {q.type === "short" && (
            <div className="mb-2">
              <label className="block text-sm mb-1">Correct Answer (optional)</label>
              <input
                type="text"
                value={q.correctAnswer || ""}
                onChange={(e) => updateQuestion(idx, "correctAnswer", e.target.value)}
                className="w-full p-1 border rounded mb-2"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!q.allowLateSubmission}
                  onChange={(e) =>
                    updateQuestion(idx, "allowLateSubmission", e.target.checked)
                  }
                />
                <label className="text-sm">Allow late submission</label>
              </div>
            </div>
          )}

          {q.type === "numeric" && (
            <div className="mb-2">
              <label className="block text-sm mb-1">Correct Answer</label>
              <input
                type="number"
                value={q.correctAnswer || ""}
                onChange={(e) =>
                  updateQuestion(idx, "correctAnswer", Number(e.target.value))
                }
                className="w-full p-1 border rounded"
              />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="px-3 py-1 bg-green-500 text-white rounded"
      >
        Add Question
      </button>
    </div>
  );
}

import { useState } from "react";

export default function QuestionEditor({ questions, setQuestions }) {
  const addQuestion = () => {
    setQuestions([...questions, { type: "mcq", prompt: "", options: [], points: 1 }]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  return (
    <div className="mb-4">
      <h3 className="font-bold mb-2">Questions</h3>
      {questions.map((q, idx) => (
        <div key={idx} className="border p-2 mb-2 rounded">
          <input
            type="text"
            placeholder="Question prompt"
            value={q.prompt}
            onChange={(e) => updateQuestion(idx, "prompt", e.target.value)}
            className="w-full p-1 border rounded mb-1"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addQuestion}
        className="px-2 py-1 bg-green-500 text-white rounded"
      >
        Add Question
      </button>
    </div>
  );
}

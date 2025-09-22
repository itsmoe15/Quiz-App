/* eslint-disable no-unused-vars */ //https://www.instagram.com/p/DOs22GJE_RF/

// frontend/src/pages/PublicAttemptPlayer.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicAttempt, savePublicAttempt, submitPublicAttempt } from "../services/attemptService";
import LatexRenderer from "../components/LatexRenderer";

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getPublicAttempt(attemptId);
        if (!mounted) return;
        setAttempt(res);
        setQuiz(res.quiz);
        // hydrate answers from attempt.answers
        const as = {};
        (res.answers || []).forEach(a => {
          as[a.questionId] = { ...a };
        });
        setAnswers(as);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.error || err?.message || "Failed to load attempt");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [attemptId]);

  const q = quiz?.questions?.[current];

  const updateAnswer = (questionId, patch) => {
    setAnswers(prev => ({ ...prev, [questionId]: { ...(prev[questionId]||{}), ...patch } }));
  };

  const doSave = async () => {
    setSaving(true);
    try {
      const answersArray = Object.keys(answers).map(qid => ({
        questionId: qid,
        selectedOptionId: answers[qid].selectedOptionId,
        typedAnswer: answers[qid].typedAnswer,
        confidence: answers[qid].confidence
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
    if (current < (quiz.questions.length - 1)) setCurrent(current + 1);
    else {
        try {
        const answersArray = Object.keys(answers).map(qid => ({
            questionId: qid,
            selectedOptionId: answers[qid].selectedOptionId,
            typedAnswer: answers[qid].typedAnswer,
            confidence: answers[qid].confidence
        }));
        const res = await submitPublicAttempt(attemptId, { answers: answersArray });
        if (res?.viewUrl) {
            alert(`Submitted! Your score: ${res.score}/${res.maxPossible}.\nYou can view full results after the exam ends at the provided link:\n\n${res.viewUrl}`);
            const path = new URL(res.viewUrl).pathname;
            navigate(path);
        } else {
            alert(`Submitted! Score: ${res.score}/${res.maxPossible}`);
            navigate("/");
        }
        } catch (err) {
        console.error(err);
        alert(err?.response?.data?.error || err?.message || "Submit failed");
        }
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!quiz) return <p className="p-6 text-red-600">{error || "Quiz not found"}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-3">{quiz.title}</h2>
      <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>

      <div className="border p-4 rounded bg-white">
        <div className="mb-2 text-sm text-gray-500">Question {current + 1} / {quiz.questions.length}</div>
        <div className="mb-4">
          <LatexRenderer content={q.prompt} />
        </div>

        {/* MCQ */}
        {q.type === "mcq" && (
          <div className="space-y-2">
            {q.options.map(opt => (
              <label key={opt.id} className="flex items-center gap-3">
                <input
                  type="radio"
                  name={`q-${q._id}`}
                  checked={answers[q._id]?.selectedOptionId === opt.id}
                  onChange={() => updateAnswer(q._id, { selectedOptionId: opt.id })}
                />
                <div><LatexRenderer content={opt.text} /></div>
              </label>
            ))}
          </div>
        )}

        {/* Short */}
        {q.type === "short" && (
          <div>
            <textarea
              value={answers[q._id]?.typedAnswer || ""}
              onChange={(e) => updateAnswer(q._id, { typedAnswer: e.target.value })}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>
        )}

        {/* Numeric */}
        {q.type === "numeric" && (
          <div>
            <input
              type="number"
              value={answers[q._id]?.typedAnswer ?? ""}
              onChange={(e) => updateAnswer(q._id, { typedAnswer: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        {/* confidence slider (simple input) */}
        <div className="mt-3">
          <label className="block mb-1 text-sm">Confidence (%)</label>
          <input
            type="range"
            min={0}
            max={100}
            value={answers[q._id]?.confidence ?? 0}
            onChange={(e) => updateAnswer(q._id, { confidence: Number(e.target.value) })}
          />
          <div className="text-sm">{answers[q._id]?.confidence ?? 0}%</div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div>
            {current > 0 && (
              <button onClick={() => setCurrent(current - 1)} className="px-3 py-1 border rounded mr-2">Prev</button>
            )}
          </div>

          <div>
            <button onClick={doSave} disabled={saving} className="px-3 py-1 bg-gray-200 rounded mr-2">
              Save
            </button>
            <button onClick={handleNext} className="px-3 py-1 bg-blue-500 text-white rounded">
              {current < quiz.questions.length - 1 ? "Next" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

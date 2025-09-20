import { useEffect, useState } from "react";
import { saveAttempt, submitAttempt } from "../../services/attemptService";
import ConfidenceSlider from "../../components/ConfidenceSlider";
import LatexRenderer from "../../components/LatexRenderer";

export default function QuestionPage({ attemptId }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch attempt with quiz questions
    const fetchAttempt = async () => {
      try {
        const res = await saveAnswer(attemptId, {}); // just to get the quiz structure
        setQuestions(res.questions);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAttempt();
  }, [attemptId]);

  const handleAnswerChange = (answer) => {
    setAnswers({ ...answers, [questions[current]._id]: answer });
  };

  const handleNext = async () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // submit attempt
      try {
        await submitAttempt(attemptId, Object.values(answers));
        alert("Quiz submitted!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <p>Loading questions...</p>;

  const question = questions[current];

  return (
    <div className="p-6">
      <h3 className="font-bold mb-2">
        Question {current + 1} of {questions.length}
      </h3>
      <div className="mb-4">
        <LatexRenderer content={question.prompt} />
      </div>
      {/* Example MCQ handling */}
      {question.type === "mcq" &&
        question.options.map((opt) => (
          <div key={opt.id}>
            <label>
              <input
                type="radio"
                name={`q-${question._id}`}
                value={opt.id}
                checked={answers[question._id]?.selectedOptionId === opt.id}
                onChange={() =>
                  handleAnswerChange({ selectedOptionId: opt.id, confidence: 0 })
                }
              />
              {opt.text}
            </label>
          </div>
        ))}
      <ConfidenceSlider
        value={answers[question._id]?.confidence || 0}
        onChange={(val) =>
          handleAnswerChange({
            ...answers[question._id],
            confidence: val,
          })
        }
      />
      <button
        onClick={handleNext}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {current < questions.length - 1 ? "Next" : "Submit"}
      </button>
    </div>
  );
}

import { useState, useEffect } from "react";
import { createQuiz, updateQuiz, getQuizById } from "../../services/quizService";
import { useNavigate, useParams } from "react-router-dom";
import QuestionEditor from "../../components/QuestionEditor";

export default function QuizForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (id) {
      const fetchQuiz = async () => {
        const quiz = await getQuizById(id);
        setTitle(quiz.title);
        setDescription(quiz.description);
        setQuestions(quiz.questions);
        setPin(quiz.pin);
      };
      fetchQuiz();
    }
  }, [id]);

  const handleSave = async () => {
    const quizData = { title, description, questions, pin };
    if (id) {
      await updateQuiz(id, quizData);
    } else {
      await createQuiz(quizData);
    }
    navigate("/teacher");
  };

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-bold mb-4">{id ? "Edit Quiz" : "Create Quiz"}</h2>
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
      <div className="mb-3">
        <label className="block mb-1">PIN (optional)</label>
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {id ? "Update Quiz" : "Create Quiz"}
      </button>
    </div>
  );
}

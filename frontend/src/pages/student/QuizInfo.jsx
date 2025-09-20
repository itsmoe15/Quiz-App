import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById } from "../../services/quizService";

export default function QuizInfo() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await getQuizById(quizId);
        setQuiz(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuiz();
  }, [quizId]);

  if (!quiz) return <p>Loading quiz info...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
      <p className="mb-4">{quiz.description}</p>
      <button
        onClick={() => navigate(`/student/attempt/${quiz._id}`)}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Start Quiz
      </button>
    </div>
  );
}

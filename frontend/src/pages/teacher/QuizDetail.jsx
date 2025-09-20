import { useEffect, useState } from "react";
import { getQuizById } from "../../services/quizService";
import { useParams, Link } from "react-router-dom";

export default function QuizDetail() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const data = await getQuizById(id);
      setQuiz(data);
    };
    fetchQuiz();
  }, [id]);

  if (!quiz) return <p>Loading quiz...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{quiz.title}</h2>
      <p className="mb-3">{quiz.description}</p>
      <p className="mb-3">Questions: {quiz.questions.length}</p>
      <Link
        to={`/teacher/results/${quiz._id}`}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        View Results
      </Link>
    </div>
  );
}

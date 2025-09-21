import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAttemptsForQuiz } from "../services/attemptService"; 

export default function QuizCard({ quiz = {}, role }) {
  const [attemptsCount, setAttemptsCount] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchAttempts = async () => {
      try {
        if (!quiz._id) return;
        const attempts = await getAttemptsForQuiz(quiz._id);
        if (mounted) setAttemptsCount(attempts.length);
      } catch (err) {
        console.error("Failed to fetch attempts:", err);
        if (mounted) setAttemptsCount(0);
      }
    };

    fetchAttempts();

    return () => {
      mounted = false;
    };
  }, [quiz._id]);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-bold text-xl mb-2 text-gray-800">
          {quiz.title ?? "Untitled Quiz"}
        </h3>
        <p className="text-gray-600 mb-2 line-clamp-3">
          {quiz.description ?? "No description"}
        </p>
        <p className="text-sm text-gray-500 mb-1">
          Questions: <span className="font-medium">{quiz.questions?.length ?? 0}</span>
        </p>
        <p className="text-sm text-gray-500 mb-1">
          Created:{" "}
          <span className="font-medium">
            {new Date(quiz.createdAt).toLocaleString()}
          </span>
        </p>
        <p className="text-sm text-gray-500 mb-1">
          Code: <span className="font-medium">{quiz.quizCode}</span>
        </p>
        <p className="text-sm text-gray-500 mb-1">
          Quiz URL: <span className="font-medium">{quiz.joinUrl}</span>
        </p>

        <p className="text-sm text-gray-500 mb-1">
          Students Attempted:{" "}
          <span className="font-medium">
            {attemptsCount !== null ? attemptsCount : "Loading..."}
          </span>
        </p>
      </div>

      <div className="mt-4">
        {role === "teacher" ? (
          <Link
            to={`/teacher/quiz/${quiz._id}`}
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            View Details
          </Link>
        ) : (
          <Link
            to={`/student/quiz/${quiz.quizCode}`}
            className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Join Quiz
          </Link>
        )}
      </div>
    </div>
  );
}

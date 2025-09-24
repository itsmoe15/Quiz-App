import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAttemptsForQuiz } from "../services/attemptService";
import { publishQuiz } from "../services/quizService";

export default function QuizCard({ quiz = {}, role }) {
  const [attemptsCount, setAttemptsCount] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(!!quiz.published);

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

  useEffect(() => {
    setPublished(!!quiz.published);
  }, [quiz.published]);

  const handlePublish = async () => {
    if (!quiz._id) return;
    if (!window.confirm("Publish this quiz? Students will be able to join it.")) return;

    try {
      setPublishing(true);
      const res = await publishQuiz(quiz._id); 
      if (res && res.quiz) {
        setPublished(true);
        alert(res.message || "Quiz published");
      } else {
        setPublished(true);
        alert("Quiz published");
      }
    } catch (err) {
      console.error("Publish failed:", err);
      const msg = err?.response?.data?.error || err?.message || "Publish failed";
      alert(msg);
    } finally {
      setPublishing(false);
    }
  };

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
        <div className="text-sm text-gray-500 mb-1">
          <span>Status: {published ? "Published" : "Unpublished"}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {role === "teacher" ? (
          <>
            <Link
              to={`/teacher/quiz/${quiz._id}`}
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              View Details
            </Link>
            <Link
              to={`/teacher/quizzes/${quiz._id}/attempts`}
              className="inline-block px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              View Answers
            </Link>
            {!published && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="inline-block px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                {publishing ? "Publishing..." : "Publish"}
              </button>
            )}
          </>
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

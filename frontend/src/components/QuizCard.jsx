import { Link } from "react-router-dom";

export default function QuizCard({ quiz = {}, role }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-bold text-xl mb-2 text-gray-800">{quiz.title ?? "Untitled Quiz"}</h3>
        <p className="text-gray-600 mb-2 line-clamp-3">{quiz.description ?? "No description"}</p>
        <p className="text-sm text-gray-500 mb-1">Questions: <span className="font-medium">{quiz.questions?.length ?? 0}</span></p>
        <p className="text-sm text-gray-500 mb-1">Created: <span className="font-medium">{new Date(quiz.createdAt).toLocaleString()}</span></p>
        <p className="text-sm text-gray-500 mb-1">Code: <span className="font-medium">{quiz.quizCode}</span></p>
        {quiz.pin && <p className="text-sm text-gray-500 mb-2">PIN: <span className="font-medium">{quiz.pin}</span></p>}
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

import { Link } from "react-router-dom";

export default function QuizCard({ quiz = {}, role }) {
  return (
    <div className="border p-4 rounded shadow">
      <h3 className="font-bold text-lg">{quiz.title ?? "Untitled Quiz"}</h3>
      <p className="text-sm mb-2">{quiz.description ?? ""}</p>
      <p className="text-sm mb-2">Questions: {quiz.questions?.length ?? 0}</p>
      {role === "teacher" ? (
        <Link to={`/teacher/quiz/${quiz._id}`} className="text-blue-500 underline">
          View Details
        </Link>
      ) : (
        <Link to={`/student/quiz/${quiz.quizCode}`} className="text-blue-500 underline">
          Join Quiz
        </Link>
      )}
    </div>
  );
}

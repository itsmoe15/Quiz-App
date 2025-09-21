import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentQuizzes } from "../../store/slices/quizSlice";
import QuizCard from "../../components/QuizCard";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice"; 

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); 

  const studentQuizzes =
    useSelector((state) => state.quiz.studentQuizzes ?? []);

  useEffect(() => {
    dispatch(fetchStudentQuizzes());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          Welcome, {user?.name || "Student"} 👋
        </h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-4">Available Quizzes</h3>

      {studentQuizzes.length === 0 ? (
        <p>No quizzes available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentQuizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} role="student" />
          ))}
        </div>
      )}
    </div>
  );
}

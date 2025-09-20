import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeacherQuizzes } from "../../store/slices/quizSlice";
import QuizCard from "../../components/QuizCard";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";  

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const teacherQuizzes =
    useSelector((state) => state.quiz.teacherQuizzes ?? []);

  useEffect(() => {
    dispatch(fetchTeacherQuizzes());
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    setUser(null);                    
    navigate("/auth/login");          
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          Welcome, {user?.name || "Teacher"} 👋
        </h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <Link
        to="/teacher/quizzes/new"
        className="px-4 py-2 bg-green-500 text-white rounded mb-4 inline-block"
      >
        Create New Quiz
      </Link>

      {teacherQuizzes.length === 0 ? (
        <p>No quizzes yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teacherQuizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} role="teacher" />
          ))}
        </div>
      )}
    </div>
  );
}

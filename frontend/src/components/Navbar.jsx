import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import {
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center py-5 px-8 bg-gray-900/90 backdrop-blur-lg shadow-lg z-50 border-b border-gray-800 font-serif">
      {/* Left side - Brand */}
      <div className="flex items-center gap-3">
        <AcademicCapIcon className="w-8 h-8 text-purple-400" />
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
        >
          QuizApp
        </Link>
        {user && (
          <span className="text-sm text-gray-400">
            {user?.role === "teacher" ? "Teacher Portal" : "Student Portal"}
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-6">
        {!user && (
          <>
            <Link
              to="/auth/login"
              className="text-gray-200 hover:text-purple-400 font-medium transition-all duration-300 hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-purple-400"
            >
              Register
            </Link>
          </>
        )}

        {user && (
          <>
            <span className="text-lg font-semibold text-gray-200">
              Welcome, {user?.name || user?.role} 👋
            </span>

            {user?.role === "teacher" && (
              <Link
                to="/teacher"
                className="text-gray-200 hover:text-purple-400 font-medium transition-all duration-300 hover:scale-105"
              >
                Dashboard
              </Link>
            )}

            {user?.role === "student" && (
              <Link
                to="/student"
                className="text-gray-200 hover:text-purple-400 font-medium transition-all duration-300 hover:scale-105"
              >
                Dashboard
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-red-400"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

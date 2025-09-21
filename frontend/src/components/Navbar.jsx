import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-2xl font-bold hover:text-indigo-200 transition-colors">
          QuizApp
        </Link>
        {user && (
          <span className="hidden md:inline-block text-sm">
            Welcome, <span className="font-semibold">{user.name}</span> 👋
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!user && (
          <>
            <Link
              to="/auth/login"
              className="px-3 py-1 rounded hover:bg-indigo-500 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="px-3 py-1 rounded hover:bg-indigo-500 transition-colors"
            >
              Register
            </Link>
          </>
        )}

        {user && (
          <>
            {user.role === "teacher" && (
              <Link
                to="/teacher"
                className="px-3 py-1 rounded hover:bg-indigo-500 transition-colors"
              >
                Dashboard
              </Link>
            )}
            {user.role === "student" && (
              <Link
                to="/student"
                className="px-3 py-1 rounded hover:bg-indigo-500 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

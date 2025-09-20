import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth/login");
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        QuizApp
      </Link>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span>Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-zinc-100 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/auth/login"
              className="hover:underline transition"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="hover:underline transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

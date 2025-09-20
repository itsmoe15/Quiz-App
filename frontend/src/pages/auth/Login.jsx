import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.token);
      setUser(res.user);
      if (res.user.role === "teacher") navigate("/teacher");
      else navigate("/student");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
        
      </form>
      
    </div>
    
  );
}

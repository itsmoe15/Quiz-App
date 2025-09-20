import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to QuizApp</h1>
      <p className="mb-8">A smart quiz platform for teachers and students</p>
      <div className="flex gap-4">
        <Link
          to="/auth/login"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </Link>
        <Link
          to="/auth/register"
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

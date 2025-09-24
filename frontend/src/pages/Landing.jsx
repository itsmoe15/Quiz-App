import React from "react";
import { Link } from "react-router-dom";
import {
  SparklesIcon,
  AcademicCapIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";

export default function Landing() {
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 text-center relative font-serif overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Hero Section */}
      <main className="max-w-6xl relative z-5 mt-20 px-4 sm:px-8">
        <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-white/80 backdrop-blur-sm text-purple-600 mb-4 border border-white/30 shadow-sm">
          🎓 AI-Powered Learning Platform
        </span>

        <h1 className="flex items-center justify-center gap-3 text-5xl md:text-7xl font-bold leading-tight text-gray-900 mb-4">
          <AcademicCapIcon className="w-10 h-10 text-purple-600" />
          <span>
            Learn Smarter,{" "}
            <span className="relative inline-block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Test Better
              <span className="block h-1 bg-purple-500 rounded-full animate-scaleX mt-2"></span>
            </span>
          </span>
          <SparklesIcon className="w-10 h-10 text-yellow-500" />
        </h1>

        <h2 className="text-5xl md:text-6xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
          with AI-powered assistance
        </h2>

        <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          QuizApp revolutionizes education with an intuitive, AI-powered
          platform that helps teachers create engaging quizzes and students
          learn more effectively.
        </p>

        {/* Dynamic CTA Buttons based on login status */}
        <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center">
          {isLoggedIn ? (
            <>
              {/* Welcome back message for logged-in users */}
              <div className="mb-6">
                <p className="text-lg text-purple-600 font-semibold">
                  Welcome back, {user.name}! 👋
                </p>
                <p className="text-gray-600">Ready to continue your journey?</p>
              </div>

              {/* Continue to Dashboard button */}
              <Link
                to={user.role === "teacher" ? "/teacher" : "/student"}
                className="group px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-pink-300 inline-flex items-center gap-3"
              >
                <span>Continue to Dashboard</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              {/* Additional options for logged-in users */}
              <div className="flex gap-4 justify-center mt-4">
                {user.role === "teacher" && (
                  <Link
                    to="/teacher/quizzes"
                    className="px-6 py-3 rounded-full border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300"
                  >
                    My Quizzes
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="px-6 py-3 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  My Profile
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Original buttons for non-logged-in users */}
              <Link
                to="/auth/register"
                className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-purple-300"
              >
                Get Started Free
              </Link>
              <Link
                to="/auth/login"
                className="px-10 py-4 rounded-full border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Existing Account
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

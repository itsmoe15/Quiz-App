import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeacherQuizzes } from "../../store/slices/quizSlice";
import QuizCard from "../../components/QuizCard";
import { Link } from "react-router-dom";

import {
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";

export default function TeacherDashboard() {
  const dispatch = useDispatch();

  const teacherQuizzes = useSelector(
    (state) => state.quiz.teacherQuizzes ?? []
  );

  useEffect(() => {
    dispatch(fetchTeacherQuizzes());
  }, [dispatch]);

  const totalAttempts = teacherQuizzes.reduce(
    (acc, quiz) => acc + (quiz.attempts || 0),
    0
  );
  const publishedQuizzes = teacherQuizzes.filter(
    (quiz) => quiz.isPublished
  ).length;
  const totalPoints = teacherQuizzes.reduce((acc, quiz) => {
    const quizPoints =
      quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
    return acc + quizPoints;
  }, 0);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 relative font-serif overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Content */}
      <main className="max-w-7xl w-full relative z-5 mt-24 px-4 sm:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="flex items-center justify-center gap-3 text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            <SparklesIcon className="w-12 h-12 text-purple-600" />
            <span>
              Teacher{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </span>
            <ChartBarIcon className="w-12 h-12 text-blue-600" />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your quizzes, track student progress, and create engaging
            learning experiences
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6 text-center hover:shadow-xl transition-all duration-300">
            <DocumentTextIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-purple-600">
              {teacherQuizzes.length}
            </div>
            <div className="text-gray-600">Total Quizzes</div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6 text-center hover:shadow-xl transition-all duration-300">
            <ChartBarIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-blue-600">
              {totalAttempts}
            </div>
            <div className="text-gray-600">Student Attempts</div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6 text-center hover:shadow-xl transition-all duration-300">
            <SparklesIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-600">
              {publishedQuizzes}
            </div>
            <div className="text-gray-600">Published</div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6 text-center hover:shadow-xl transition-all duration-300">
            <AcademicCapIcon className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-orange-600">
              {totalPoints}
            </div>
            <div className="text-gray-600">Total Points</div>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Create Something Amazing
              </h2>
              <p className="text-gray-600">
                Start a new quiz or manage your existing ones
              </p>
            </div>
            <Link
              to="/teacher/quizzes/new"
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Create New Quiz
            </Link>
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Your Quizzes
            </h2>
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {teacherQuizzes.length} quizzes
            </span>
          </div>

          {teacherQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                No quizzes yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first quiz to start engaging with your students!
              </p>
              <Link
                to="/teacher/quizzes/new"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherQuizzes.map((quiz) => (
                <QuizCard key={quiz._id} quiz={quiz} role="teacher" />
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center gap-4 mt-8">
          <Link
            to="/teacher/quizzes"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            View All Quizzes
          </Link>
        </div>
      </main>
    </div>
  );
}

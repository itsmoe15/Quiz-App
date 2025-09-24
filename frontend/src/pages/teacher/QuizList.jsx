import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeacherQuizzes } from "../../store/slices/quizSlice";
import QuizCard from "../../components/QuizCard";
import { Link } from "react-router-dom";

export default function QuizList() {
  const dispatch = useDispatch();
  const { teacherQuizzes } = useSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(fetchTeacherQuizzes());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                All Quizzes
              </h1>
              <p className="text-gray-600">
                Manage and view all your created quizzes
              </p>
            </div>
            <Link
              to="/teacher/quizzes/new"
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
            >
              <span>+</span> Create New Quiz
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {teacherQuizzes.length}
              </div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {teacherQuizzes.filter((quiz) => quiz.published).length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {teacherQuizzes.filter((quiz) => !quiz.published).length}
              </div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {teacherQuizzes.reduce(
                  (acc, quiz) => acc + (quiz.attempts || 0),
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {teacherQuizzes.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Quizzes Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first quiz to get started!
            </p>
            <Link
              to="/teacher/quizzes/new"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              <span>+</span> Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} role="teacher" />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {teacherQuizzes.length > 0 && (
          <div className="mt-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/teacher"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                📊 Dashboard
              </Link>
              <Link
                to="/teacher/quizzes/new"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                ➕ Create Another Quiz
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

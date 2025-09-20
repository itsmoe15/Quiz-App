import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeacherQuizzes } from "../../store/slices/quizSlice";
import QuizCard from "../../components/QuizCard";

export default function QuizList() {
  const dispatch = useDispatch();
  const { teacherQuizzes } = useSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(fetchTeacherQuizzes());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Quizzes</h2>
      {teacherQuizzes.length === 0 ? (
        <p>No quizzes available.</p>
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

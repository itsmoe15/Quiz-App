import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentQuizzes } from "../../store/slices/quizSlice";
import QuizCard from "../../components/QuizCard";

export default function StudentQuizList() {
  const dispatch = useDispatch();
  const { studentQuizzes } = useSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(fetchStudentQuizzes());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Quizzes</h2>
      {studentQuizzes.length === 0 ? (
        <p>No quizzes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentQuizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} role="student" />
          ))}
        </div>
      )}
    </div>
  );
}

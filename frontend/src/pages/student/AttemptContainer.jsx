import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { startAttempt } from "../../services/attemptService";
import QuestionPage from "./QuestionPage";

export default function AttemptContainer() {
  const { quizId } = useParams();
  const [attemptId, setAttemptId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const initAttempt = async () => {
      try {
        const res = await startAttempt(quizId);
        setAttemptId(res._id);
      } catch (err) {
        setError(err.response?.data?.message || "Cannot start attempt");
      }
    };
    initAttempt();
  }, [quizId]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!attemptId) return <p>Initializing quiz...</p>;

  return <QuestionPage attemptId={attemptId} />;
}

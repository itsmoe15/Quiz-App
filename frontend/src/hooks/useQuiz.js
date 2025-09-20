import { useState, useEffect } from "react";
import { getQuizById } from "../services/quizService";

export default function useQuiz(quizId) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getQuizById(quizId)
      .then((data) => setQuiz(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [quizId]);

  return { quiz, loading, error };
}

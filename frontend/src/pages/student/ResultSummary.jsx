import { useEffect, useState } from "react";
import { getStudentResults } from "../../services/attemptService";
import { useParams } from "react-router-dom";

export default function ResultSummary() {
  const { quizId, studentId } = useParams();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getStudentResults(quizId, studentId);
        setResults(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResults();
  }, [quizId, studentId]);

  if (!results) return <p>Loading results...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Your Results</h2>
      {results.attempts.map((attempt) => (
        <div key={attempt._id} className="mb-3 p-3 border rounded">
          <p>
            Score: {attempt.score} / {attempt.maxPossibleScore}
          </p>
          <p>Status: {attempt.status}</p>
          <p>
            Submitted At:{" "}
            {attempt.submittedAt
              ? new Date(attempt.submittedAt).toLocaleString()
              : "Not submitted"}
          </p>
        </div>
      ))}
    </div>
  );
}

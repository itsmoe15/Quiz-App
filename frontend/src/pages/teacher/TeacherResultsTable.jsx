import { useEffect, useState } from "react";
import { getQuizSummary } from "../../services/attemptService";
import { useParams } from "react-router-dom";

export default function TeacherResultsTable() {
  const { quizId } = useParams();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const data = await getQuizSummary(quizId);
      setSummary(data);
    };
    fetchSummary();
  }, [quizId]);

  if (!summary) return <p>Loading results summary...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Results Summary</h2>
      <p>Average Score: {summary.averageScore}</p>
      <p>Median Score: {summary.medianScore}</p>
      <p>Max Score: {summary.maxScore}</p>
      <p>Min Score: {summary.minScore}</p>
      <p>Pass Rate: {summary.passRate}%</p>
      <p>Total Attempts: {summary.totalAttempts}</p>
      <p>Completed Attempts: {summary.completedAttempts}</p>
    </div>
  );
}

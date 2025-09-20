import { useEffect, useState } from "react";
import { getStudentResults } from "../../services/attemptService";
import { useParams } from "react-router-dom";
import { Chart } from "react-chartjs-2";

export default function Analytics() {
  const { quizId, studentId } = useParams();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getStudentResults(quizId, studentId);
        setResults(res.attempts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResults();
  }, [quizId, studentId]);

  if (!results.length) return <p>No results to show.</p>;

  const labels = results.map((a, i) => `Attempt ${i + 1}`);
  const data = {
    labels,
    datasets: [
      {
        label: "Score",
        data: results.map((a) => a.score),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Analytics</h2>
      <Chart type="bar" data={data} />
    </div>
  );
}

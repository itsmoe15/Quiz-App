import { useEffect, useState } from "react";
import { getQuizSummary } from "../../services/attemptService";
import { useParams } from "react-router-dom";
import { Chart } from "react-chartjs-2";

export default function Analytics() {
  const { quizId } = useParams();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const data = await getQuizSummary(quizId);
      setSummary(data);
    };
    fetchSummary();
  }, [quizId]);

  if (!summary) return <p>Loading analytics...</p>;

  const chartData = {
    labels: summary.distribution.map((_, i) => `Student ${i + 1}`),
    datasets: [
      {
        label: "Score",
        data: summary.distribution,
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Quiz Analytics</h2>
      <Chart type="bar" data={chartData} />
    </div>
  );
}

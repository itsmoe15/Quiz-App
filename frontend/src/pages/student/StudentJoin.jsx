import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validatePin } from "../../services/quizService";

export default function StudentJoin() {
  const [quizCode, setQuizCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const res = await validatePin(quizCode, pin);
      navigate(`/student/quiz/${res.quizId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join quiz");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Join Quiz</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleJoin}>
        <div className="mb-3">
          <label className="block mb-1">Quiz Code</label>
          <input
            type="text"
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1">PIN</label>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Join
        </button>
      </form>
    </div>
  );
}

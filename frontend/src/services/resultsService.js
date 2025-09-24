// frontend/src/services/resultsService.js
import api from "./api";

export const resultsService = {
  getQuizResults: async (quizId) => {
    try {
      console.log(
        "🔍 Making API request to:",
        `/api/v1/quizzes/${quizId}/results`
      );
      const response = await api.get(`/quizzes/${quizId}/results`);
      console.log("✅ API response received:", response);
      return response.data;
    } catch (error) {
      console.error("❌ API request failed:", error);
      console.error("❌ Error response:", error.response);
      throw error;
    }
  },
};

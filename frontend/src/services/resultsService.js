// frontend/src/services/resultsService.js
import api from "./api";

export const resultsService = {
  // Get all quiz results (teacher only)
  getQuizResults: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/results`);
    return response.data;
  },

  // Get a single student’s results for a quiz
  getStudentResults: async (quizId, studentId) => {
    const response = await api.get(`/quizzes/${quizId}/results/${studentId}`);
    return response.data;
  },

  // Export results (CSV / JSON)
  exportResults: async (quizId, format = "csv") => {
    const response = await api.get(
      `/quizzes/${quizId}/export?format=${format}`,
      {
        responseType: format === "csv" ? "blob" : "json",
      }
    );

    if (format === "csv") {
      // axios already gives you a Blob
      return response.data;
    }

    return response.data;
  },
};

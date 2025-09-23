// frontend/src/services/analyticsService.js
import api from "./api";

export const analyticsService = {
  // Get basic quiz analytics
  getQuizAnalytics: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/analytics/summary`);
    return response.data;
  },

  // Get detailed analytics
  getDetailedAnalytics: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/analytics/detailed`);
    return response.data;
  },

  // Export analytics data
  exportAnalytics: async (quizId, format = "csv") => {
    const response = await api.get(
      `/quizzes/${quizId}/export?format=${format}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};

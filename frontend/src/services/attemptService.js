import api from "./api";

// export const startAttempt = async (quizId) => {
//   const res = await api.post("/attempts/start", { quizId });
//   return res.data;
// };

export const saveAttempt = async (attemptId, payload) => {
  const res = await api.post(`/attempts/${attemptId}/save`, payload);
  return res.data;
};

export const submitAttempt = async (attemptId, payload) => {
  const res = await api.post(`/attempts/${attemptId}/submit`, payload);
  return res.data;
};

export const getAttemptById = async (attemptId) => {
  const res = await api.get(`/attempts/${attemptId}`);
  return res.data;
};

export const getAttemptsForQuiz = async (quizId) => {
  const res = await api.get(`/attempts/quiz/${quizId}`);
  return res.data;
};

export const startPublicAttempt = async (data) => {
  // data: { quizCode, quizId, name, email, studentId }
  const res = await api.post("/attempts/public/start", data);
  return res.data;
};

export const savePublicAttempt = async (attemptId, payload) => {
  const res = await api.post(`/attempts/public/${attemptId}/save`, payload);
  return res.data;
};

export const submitPublicAttempt = async (attemptId, payload) => {
  const res = await api.post(`/attempts/public/${attemptId}/submit`, payload);
  return res.data;
};

export const getPublicAttempt = async (attemptId) => {
  const res = await api.get(`/attempts/public/${attemptId}`);
  return res.data;
};
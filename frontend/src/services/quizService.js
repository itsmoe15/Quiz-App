import api from "./api";

export const createQuiz = async (quiz) => {
  const res = await api.post("/quizzes", quiz);
  return res.data;
};

export const updateQuiz = async (id, quizData) => {
  const res = await api.patch(`/quizzes/${id}`, quizData);
  return res.data;
};

export const deleteQuiz = async (id) => {
  const res = await api.delete(`/quizzes/${id}`);
  return res.data;
};

export const getQuizzes = async () => {
  const res = await api.get("/quizzes");
  return res.data;
};

export const getQuizById = async (id) => {
  const res = await api.get(`/quizzes/${id}`);
  return res.data;
};

export const publishQuiz = async (id) => {
  const res = await api.post(`/quizzes/${id}/publish`);
  return res.data;
};

export const validatePin = async (data) => {
  const res = await api.post("/quizzes/validate-pin", data);
  return res.data;
};

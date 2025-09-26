import api from "./api";

// Generate quiz from raw text
export const generateQuizFromText = async (sourceText) => {
  const res = await api.post("/generate-quiz", { sourceText });
  return res.data;
};

// Generate quiz from uploaded file
export const generateQuizFromFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/generate-quiz", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

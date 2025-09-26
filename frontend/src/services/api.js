// frontend\src\services\api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// attach token if found
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

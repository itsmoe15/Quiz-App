// frontend\src\services\userService.js
import api from "./api";

export const updateUserProfile = async (userId, userData) => {
  const res = await api.patch(`/users/${userId}`, userData);
  return res.data;
};
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import quizReducer from "./slices/quizSlice";
import attemptReducer from "./slices/attemptSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    attempt: attemptReducer,
  },
});

export default store;

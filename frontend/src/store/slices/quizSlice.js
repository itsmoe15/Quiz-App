import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as quizService from "../../services/quizService";

export const fetchQuizzes = createAsyncThunk("quiz/fetchAll", async () => {
  return await quizService.getQuizzes();
});

export const fetchQuizById = createAsyncThunk("quiz/fetchById", async (id) => {
  return await quizService.getQuizById(id);
});

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    items: [],
    studentQuizzes: [],
    teacherQuizzes: [], 
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentQuiz: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { clearCurrentQuiz } = quizSlice.actions;
export { fetchQuizzes as fetchStudentQuizzes, fetchQuizzes as fetchTeacherQuizzes };

export default quizSlice.reducer;
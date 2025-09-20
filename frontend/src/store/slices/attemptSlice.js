import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as attemptService from "../../services/attemptService";

export const startAttempt = createAsyncThunk("attempt/start", async (quizId) => {
  return await attemptService.startAttempt(quizId);
});

export const fetchAttemptById = createAsyncThunk(
  "attempt/fetchById",
  async (attemptId) => {
    return await attemptService.getAttemptById(attemptId);
  }
);

const attemptSlice = createSlice({
  name: "attempt",
  initialState: {
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAttempt: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startAttempt.pending, (state) => {
        state.loading = true;
      })
      .addCase(startAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(startAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAttemptById.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { clearAttempt } = attemptSlice.actions;
export default attemptSlice.reducer;

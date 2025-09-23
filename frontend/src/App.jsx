import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import QuizList from "./pages/teacher/QuizList";
import QuizForm from "./pages/teacher/QuizForm";
import NotFound from "./pages/NotFound";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherQuizView from "./pages/teacher/TeacherQuizView";
import JoinQuizPage from "./pages/JoinQuizPage";
import PublicAttemptPlayer from "./pages/PublicAttemptPlayer";
import AttemptResultPage from "./pages/AttemptResultPage";
import TeacherAttemptsPage from "./pages/TeacherAttemptsPage";
import Navbar from "./components/Navbar";
import AnalyticsDashboard from "./pages/teacher/AnalyticsDashboard.jsx";

/*
        to say this code is more polluted than chernobyl would be an understatement
        we have component files that are over 300 lines long
        and half of them arent even used no more

        its 4:55am and wakatime tells me i spent 14 hours and 26 mins acitvley coding on this project
        so if u see any stupid mistakes (its most likely not mine) but if it was, forgive me

        sorry in advance
    - Montaser
*/

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar /> {/*the nav bar was making lots of issues im tired*/}
      <div className="flex-1 w-full max-w-full mx-auto pt-24">
        {" "}
        {/* Added pt-24 for navbar spacing */}
        <Routes>
          {/* <Route path="/" element={<Login />} /> why on god`s green earth would anyuone do that you absolute buffoons???????? */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/auth/login"
            element={
              <GuestRoute>
                {" "}
                <Login />{" "}
              </GuestRoute>
            }
          />
          <Route
            path="/auth/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/quizzes"
            element={
              <ProtectedRoute role="teacher">
                <QuizList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/quizzes/new"
            element={
              <ProtectedRoute role="teacher">
                <QuizForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/quiz/:id"
            element={
              <ProtectedRoute role="teacher">
                <TeacherQuizView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/quizzes/:id/edit"
            element={
              <ProtectedRoute role="teacher">
                <QuizForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/quizzes/:quizId/attempts"
            element={
              <ProtectedRoute role="teacher">
                <TeacherAttemptsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
          <Route path="/q/:quizCode" element={<JoinQuizPage />} />
          <Route
            path="/q/:quizCode/attempt/:attemptId"
            element={<PublicAttemptPlayer />}
          />
          <Route path="/attempts/:attemptId" element={<AttemptResultPage />} />

          <Route
            path="/teacher/quizzes/:quizId/analytics/summary"
            element={
              <ProtectedRoute role="teacher">
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

/**
 * Auth Flow Refactor — by Montaser
 *
 * We removed the old `AuthContext` (custom context + provider)
 * and replaced it fully with Redux for authentication state.
 *
 * - Auth state (user + token) now lives in `authSlice`.
 * - Login & Register pages dispatch `loginUser` / `registerUser` thunks.
 * - Token + user are persisted in `localStorage` inside the slice.
 * - Logout uses `dispatch(logout())`, which clears Redux state + storage.
 * - Navbar, dashboards, and protected routes all read from Redux (`state.auth`).
 */

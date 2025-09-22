import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* Pages (we will add these files in next batches) */
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

/* Components */
import Navbar from "./components/Navbar" /* temporary placeholder */;

/* NOTE:
 - Navbar placeholder above references QuizCard to avoid runtime import error
   until you paste the real Navbar component. Replace with:
     import Navbar from "./components/Navbar";
*/

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      {/* replace placeholder import with real Navbar later */}
      <div className="max-w-6xl mx-auto">

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<GuestRoute> <Login /> </GuestRoute>} />
          <Route path="/auth/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Teacher routes */}

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
          <Route path="/q/:quizCode/attempt/:attemptId" element={<PublicAttemptPlayer />} />
          <Route path="/attempts/:attemptId" element={<AttemptResultPage />} />

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

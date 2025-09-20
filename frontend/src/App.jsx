import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* Pages (we will add these files in next batches) */
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import QuizList from "./pages/teacher/QuizList";
import QuizForm from "./pages/teacher/QuizForm";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentJoin from "./pages/student/StudentJoin";
import AttemptContainer from "./pages/student/AttemptContainer";
import NotFound from "./pages/NotFound";

/* Components */
import Navbar from "./components/QuizCard" /* temporary placeholder */;

/* NOTE:
 - Navbar placeholder above references QuizCard to avoid runtime import error
   until you paste the real Navbar component. Replace with:
     import Navbar from "./components/Navbar";
*/

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* replace placeholder import with real Navbar later */}
      <div className="max-w-6xl mx-auto">
        <Routes>
          {/* <Route path="/" element={<Navigate to="/auth/login" replace />} /> */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Teacher routes */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/quizzes" element={<QuizList />} />
          <Route path="/teacher/quizzes/new" element={<QuizForm />} />

          {/* Student routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/join" element={<StudentJoin />} />
          <Route path="/attempt/:quizId/start" element={<AttemptContainer />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

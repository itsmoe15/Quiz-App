import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, role }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}

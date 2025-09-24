import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleRoute({ role, children }) {
  const { user } = useSelector((state) => state.auth);
  if (!user || user.role !== role) return <Navigate to="/login" />;
  return children;
}

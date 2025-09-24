import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function GuestRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}

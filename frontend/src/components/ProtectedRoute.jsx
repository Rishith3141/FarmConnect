import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a page with <ProtectedRoute role="FARMER"> to guard it.
// Not logged in -> login page.  Wrong role -> access denied page.
// (The backend enforces the same rules; this just gives a friendlier screen.)
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/access-denied" replace />;
  }
  return children;
}

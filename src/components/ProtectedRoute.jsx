import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("user");

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

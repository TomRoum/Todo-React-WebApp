import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/userProvider";

function ProtectedRoute() {
  const { user } = useUser();
  const token = localStorage.getItem("token");

  // If no token, redirect to signin
  if (!token && !user) {
    return <Navigate to="/signin" replace />;
  }

  // If token exists, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;

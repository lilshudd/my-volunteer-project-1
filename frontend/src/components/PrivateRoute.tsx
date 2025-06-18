import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

type Props = {
  children: React.ReactElement;
  roles?: string[];
};

export default function PrivateRoute({ children, roles }: Props) {
  const user = useUser();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
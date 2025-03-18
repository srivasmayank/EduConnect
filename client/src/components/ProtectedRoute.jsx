import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ redirectPath = '/login', isAllowed, allowedRoles = [] }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  const userRole = localStorage.getItem('role');
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;

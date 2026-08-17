import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-techverse-eggshell"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-techverse-olive"></div></div>;
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

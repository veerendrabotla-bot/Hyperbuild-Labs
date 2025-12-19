
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Verifying authorized access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/partner/login" replace />;
  }

  // If they are an employee but not approved, kick them to login
  if (user.role === 'employee' && !user.is_approved) {
    return <Navigate to="/partner/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

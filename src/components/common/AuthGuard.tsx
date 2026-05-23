import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { profile, loading } = useAuth();

  // Show a clean loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" id="auth-guard-loading">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-ink/60 font-medium animate-pulse">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect them to /login
  if (!profile) {
    return <Navigate to="/login" replace = {true} />;
  }

  return <>{children}</>;
}

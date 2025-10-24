import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const token = localStorage.getItem('access_token');
  
  if (token) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
import React from 'react';
import { Navigate } from 'react-router-dom';
import { WithChildrenProps } from '@/types/generalTypes';
import { useAuth } from '@clerk/clerk-react';

const RequireAuth: React.FC<WithChildrenProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;

  if (isSignedIn) {
    return <>{children}</>;
  }

  return isSignedIn ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

export default RequireAuth;

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser, useStoreActions } from '../../store';
import { getApiClient, authApi } from '../../shared/services/api';
import { useSocket } from '../socket';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const currentUser = useCurrentUser();
  const { setCurrentUser, setUserLoading, setUserError } = useStoreActions();
  const location = useLocation();
  const { connect, authenticate } = useSocket();

  useEffect(() => {
    const initAuth = async () => {
      const token = getApiClient().getToken();
      const refreshToken = localStorage.getItem('refresh_token');

      if (!token && !refreshToken) {
        return;
      }

      if (token && !currentUser) {
        try {
          setUserLoading(true);
          const user = await authApi.getCurrentUser();
          setCurrentUser(user);
          
          connect();
          authenticate(token);
        } catch (error) {
          if (refreshToken) {
            try {
              const tokens = await authApi.refreshToken(refreshToken);
              const user = await authApi.getCurrentUser();
              setCurrentUser(user);
              
              connect();
              authenticate(tokens.accessToken);
            } catch (refreshError) {
              getApiClient().setToken(null);
              localStorage.removeItem('refresh_token');
              setUserError('Session expired. Please log in again.');
            }
          } else {
            getApiClient().setToken(null);
            setUserError('Session expired. Please log in again.');
          }
        } finally {
          setUserLoading(false);
        }
      }
    };

    initAuth();
  }, [currentUser, setCurrentUser, setUserLoading, setUserError, connect, authenticate]);

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: ProtectedRouteProps) {
  const currentUser = useCurrentUser();
  const location = useLocation();
  
  const from = (location.state as any)?.from?.pathname || '/';

  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

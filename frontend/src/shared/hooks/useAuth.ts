import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCurrentUser,
  useUserLoading,
  useUserError,
  useStoreActions,
} from '../../store';
import { authApi } from '../services/api';
import { getApiClient } from '../services/api';
import { useSocket } from '../../features/socket';

export function useAuth() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const loading = useUserLoading();
  const error = useUserError();
  const { setCurrentUser, setUserLoading, setUserError, resetStore } = useStoreActions();
  const { connect, disconnect, authenticate } = useSocket();

  const login = useCallback(async (username: string, password: string) => {
    setUserLoading(true);
    setUserError(null);

    try {
      const result = await authApi.login({ username, password });
      
      const { password_hash, ...userWithoutPassword } = result.user;
      setCurrentUser(userWithoutPassword);
      
      getApiClient().setToken(result.tokens.accessToken);
      localStorage.setItem('refresh_token', result.tokens.refreshToken);
      
      connect();
      authenticate(result.tokens.accessToken);
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setUserError(message);
      throw err;
    } finally {
      setUserLoading(false);
    }
  }, [setCurrentUser, setUserLoading, setUserError, connect, authenticate]);

  const register = useCallback(async (
    username: string,
    password: string,
    email?: string,
    avatar?: string
  ) => {
    setUserLoading(true);
    setUserError(null);

    try {
      const result = await authApi.register({ username, password, email, avatar });
      
      const { password_hash, ...userWithoutPassword } = result.user;
      setCurrentUser(userWithoutPassword);
      
      getApiClient().setToken(result.tokens.accessToken);
      localStorage.setItem('refresh_token', result.tokens.refreshToken);
      
      connect();
      authenticate(result.tokens.accessToken);
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setUserError(message);
      throw err;
    } finally {
      setUserLoading(false);
    }
  }, [setCurrentUser, setUserLoading, setUserError, connect, authenticate]);

  const logout = useCallback(async () => {
    setUserLoading(true);
    setUserError(null);

    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      disconnect();
      resetStore();
      getApiClient().setToken(null);
      localStorage.removeItem('refresh_token');
      setUserLoading(false);
      navigate('/login', { replace: true });
    }
  }, [disconnect, resetStore, navigate]);

  const logoutAll = useCallback(async () => {
    setUserLoading(true);
    setUserError(null);

    try {
      await authApi.logoutAll();
    } catch (err) {
      console.error('Logout all error:', err);
    } finally {
      disconnect();
      resetStore();
      getApiClient().setToken(null);
      localStorage.removeItem('refresh_token');
      setUserLoading(false);
      navigate('/login', { replace: true });
    }
  }, [disconnect, resetStore, navigate]);

  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    register,
    logout,
    logoutAll,
  };
}

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/authApi';
import { apiClient } from '../api/client';
import type { LoginRequest, UserInfo } from '../types/auth';
import { storage } from '../utils/storage';

interface AuthContextValue {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<UserInfo>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await storage.clearAuth();
    setUser(null);
  }, []);

  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => apiClient.setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      try {
        const [token, stored] = await Promise.all([
          storage.getToken(),
          storage.getUser<UserInfo>(),
        ]);
        if (token && stored) setUser(stored);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data);
    if (res.user.role?.toUpperCase() !== 'PARENT') {
      throw new Error('Cette application est réservée aux parents.');
    }
    await storage.setToken(res.accessToken);
    if (res.refreshToken) await storage.setRefreshToken(res.refreshToken);
    await storage.setUser(res.user);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    await clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const fresh = await authApi.getCurrentUser();
    await storage.setUser(fresh);
    setUser(fresh);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

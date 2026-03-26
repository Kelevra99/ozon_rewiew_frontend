'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserDto,
} from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '@/lib/session-storage';

type AuthStatus = 'booting' | 'authenticated' | 'guest';

type AuthContextValue = {
  status: AuthStatus;
  isReady: boolean;
  token: string | null;
  user: UserDto | null;
  login: (input: LoginRequest) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('booting');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserDto | null>(null);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    clearStoredSession();
    setStatus('guest');
  }, []);

  const applySession = useCallback((nextToken: string, nextUser: UserDto) => {
    setToken(nextToken);
    setUser(nextUser);
    setStoredToken(nextToken);
    setStoredUser(nextUser);
    setStatus('authenticated');
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await apiFetch<UserDto>('/users/me', {
      method: 'GET',
      auth: true,
    });
    setUser(me);
    setStoredUser(me);
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser<UserDto>();

    if (!storedToken) {
      clearSession();
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      setUser(storedUser);
    }

    try {
      const me = await apiFetch<UserDto>('/users/me', {
        method: 'GET',
        auth: true,
      });
      setUser(me);
      setStoredUser(me);
      setStatus('authenticated');
    } catch {
      clearSession();
    }
  }, [clearSession]);

  const login = useCallback(
    async (input: LoginRequest) => {
      const result = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      applySession(result.accessToken, result.user);
    },
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterRequest) => {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      const result = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: input.email,
          password: input.password,
        }),
      });

      applySession(result.accessToken, result.user);
    },
    [applySession],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isReady: status !== 'booting',
      token,
      user,
      login,
      register,
      logout,
      restoreSession,
      refreshMe,
    }),
    [status, token, user, login, register, logout, restoreSession, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

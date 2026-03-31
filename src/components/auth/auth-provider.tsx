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
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  UserDto,
  VerifyEmailRequest,
} from '@/types/api';
import { apiFetch } from '@/lib/api-client';
import {
  clearPendingVerificationEmail,
  clearStoredSession,
  getPendingVerificationEmail,
  getStoredToken,
  getStoredUser,
  setPendingVerificationEmail,
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
  verifyEmail: (input: VerifyEmailRequest) => Promise<void>;
  resendEmailVerification: (input: ResendVerificationRequest) => Promise<ResendVerificationResponse>;
  getPendingVerificationEmail: () => string | null;
  clearPendingVerificationEmail: () => void;
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
      try {
        const result = await apiFetch<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        applySession(result.accessToken, result.user);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Ошибка входа';

        if (message.includes('Почта не подтверждена')) {
          const email = input.email.trim().toLowerCase();
          setPendingVerificationEmail(email);

          if (typeof window !== 'undefined') {
            window.location.replace(`/verify-email?email=${encodeURIComponent(email)}`);
            await new Promise<never>(() => {});
          }
        }

        throw error;
      }
    },
    [applySession],
  );

  const register = useCallback(async (input: RegisterRequest) => {
    const result = await apiFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    const email = result.email.trim().toLowerCase();
    setPendingVerificationEmail(email);

    if (typeof window !== 'undefined') {
      const sentFlag = result.verificationEmailSent ? '1' : '0';
      window.location.replace(`/verify-email?email=${encodeURIComponent(email)}&sent=${sentFlag}`);
      await new Promise<never>(() => {});
    }
  }, []);

  const verifyEmail = useCallback(
    async (input: VerifyEmailRequest) => {
      const result = await apiFetch<LoginResponse>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      clearPendingVerificationEmail();
      applySession(result.accessToken, result.user);
    },
    [applySession],
  );

  const resendEmailVerification = useCallback(
    async (input: ResendVerificationRequest) => {
      return apiFetch<ResendVerificationResponse>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    [],
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
      verifyEmail,
      resendEmailVerification,
      getPendingVerificationEmail,
      clearPendingVerificationEmail,
      logout,
      restoreSession,
      refreshMe,
    }),
    [
      status,
      token,
      user,
      login,
      register,
      verifyEmail,
      resendEmailVerification,
      logout,
      restoreSession,
      refreshMe,
    ],
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

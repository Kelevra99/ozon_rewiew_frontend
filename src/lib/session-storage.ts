const ACCESS_TOKEN_KEY = 'ozon_auto_reply_access_token';
const USER_KEY = 'ozon_auto_reply_user';
const PENDING_VERIFICATION_EMAIL_KEY = 'ozon_auto_reply_pending_verification_email';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser<T>(): T | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(USER_KEY);
}

export function getPendingVerificationEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY);
}

export function setPendingVerificationEmail(email: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
}

export function clearPendingVerificationEmail() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
}

export function clearStoredSession() {
  clearStoredToken();
  clearStoredUser();
}

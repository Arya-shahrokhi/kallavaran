import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/endpoints.js';
import { setAccessToken, setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const clear = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // بازیابی نشست از refresh cookie؛ توکن دسترسی فقط در حافظه می‌ماند، نه localStorage (مقاوم به XSS)
  useEffect(() => {
    setUnauthorizedHandler(clear);
    (async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        clear();
      } finally {
        setBooting(false);
      }
    })();
  }, [clear]);

  const login = useCallback(async (payload) => {
    const { data, message } = await authApi.login(payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return message;
  }, []);

  const register = useCallback(async (payload) => {
    const { data, message } = await authApi.register(payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return message;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } finally { clear(); }
  }, [clear]);

  const value = useMemo(() => ({
    user, booting, login, register, logout, setUser,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
  }), [user, booting, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

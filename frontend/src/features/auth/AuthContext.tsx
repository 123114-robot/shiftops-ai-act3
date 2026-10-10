import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentUser, login as loginRequest, type AuthUser } from '../../api/auth';
import { AuthContext, type AuthContextValue } from './auth-context';
const tokenKey = 'shiftflow_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    let active = true;
    setIsLoading(true);
    void getCurrentUser(token).then(current => { if (active) setUser(current); }).catch(() => {
      if (active) { localStorage.removeItem(tokenKey); setToken(null); setUser(null); }
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [token]);
  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isLoading,
    async login(email, password) {
      const session = await loginRequest(email, password);
      localStorage.setItem(tokenKey, session.token);
      setToken(session.token);
      setUser(session.user);
      return session.user;
    },
    logout() {
      localStorage.removeItem(tokenKey);
      setToken(null);
      setUser(null);
    },
  }), [isLoading, token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

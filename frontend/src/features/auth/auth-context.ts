import { createContext, useContext } from 'react';
import type { AuthUser } from '../../api/auth';

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login(email: string, password: string): Promise<AuthUser>;
  logout(): void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

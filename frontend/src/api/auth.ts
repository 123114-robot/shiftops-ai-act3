export type UserRole = 'MANAGER' | 'EMPLOYEE';
export type AuthUser = { id: string; email: string; role: UserRole; employeeId: string | null };
export type AuthSession = { token: string; user: AuthUser };

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? 'Unable to sign in.');
  }
  return response.json() as Promise<AuthSession>;
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Session expired.');
  const body = await response.json() as { user: AuthUser };
  return body.user;
}

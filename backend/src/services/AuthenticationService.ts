import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export type UserRole = 'MANAGER' | 'EMPLOYEE';

export type AuthUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  employeeId: string | null;
};

export type SafeUser = Omit<AuthUserRecord, 'passwordHash'>;

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(id: string): Promise<AuthUserRecord | null>;
}

export class AuthenticationError extends Error {
  constructor(
    public readonly code: 'INVALID_CREDENTIALS' | 'UNAUTHENTICATED',
    message: string,
  ) {
    super(message);
  }
}

const toSafeUser = (user: AuthUserRecord): SafeUser => ({
  id: user.id,
  email: user.email,
  role: user.role,
  employeeId: user.employeeId,
});

export class AuthenticationService {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly jwtSecret: string,
  ) {
    if (jwtSecret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  }

  async login(email: string, password: string): Promise<{ token: string; user: SafeUser }> {
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }
    return {
      token: jwt.sign({ sub: user.id, role: user.role }, this.jwtSecret, { expiresIn: '8h' }),
      user: toSafeUser(user),
    };
  }

  async getCurrentUser(token: string): Promise<SafeUser> {
    try {
      const payload = jwt.verify(token, this.jwtSecret);
      if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('Invalid token payload');
      const user = await this.users.findById(payload.sub);
      if (!user) throw new Error('User not found');
      return toSafeUser(user);
    } catch {
      throw new AuthenticationError('UNAUTHENTICATED', 'Authentication is required.');
    }
  }
}

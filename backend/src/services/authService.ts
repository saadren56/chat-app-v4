import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config';
import { UserRepository, SessionRepository } from '../db/repositories';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../utils';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private _userRepo?: UserRepository;
  private _sessionRepo?: SessionRepository;

  private get userRepo(): UserRepository {
    if (!this._userRepo) {
      this._userRepo = new UserRepository();
    }
    return this._userRepo;
  }

  private get sessionRepo(): SessionRepository {
    if (!this._sessionRepo) {
      this._sessionRepo = new SessionRepository();
    }
    return this._sessionRepo;
  }

  generateAccessToken(userId: string, username: string): string {
    return jwt.sign(
      { id: userId, username },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    return computedHash === hash;
  }

  async register(
    username: string,
    password: string,
    email?: string,
    avatar?: string
  ): Promise<{ user: any; tokens: AuthTokens }> {
    const existingUser = this.userRepo.findByUsername(username);
    if (existingUser) {
      throw new ConflictError('Username already exists');
    }

    if (email) {
      const existingEmail = this.userRepo.findByEmail(email);
      if (existingEmail) {
        throw new ConflictError('Email already exists');
      }
    }

    const userId = crypto.randomUUID();
    const passwordHash = this.hashPassword(password);

    const user = this.userRepo.create({
      id: userId,
      username,
      email,
      avatar,
      password_hash: passwordHash,
    });

    const tokens = await this.createSession(userId, username);

    return { user, tokens };
  }

  async login(username: string, password: string): Promise<{ user: any; tokens: AuthTokens }> {
    const user = this.userRepo.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.password_hash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await this.createSession(user.id, user.username);

    this.userRepo.updateStatus(user.id, 'online');

    return { user, tokens };
  }

  async createSession(userId: string, username: string): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken(userId, username);
    const refreshToken = this.generateRefreshToken();

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    this.sessionRepo.create({
      id: sessionId,
      user_id: userId,
      token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const session = this.sessionRepo.findByRefreshToken(refreshToken);
    if (!session) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (new Date() > session.expires_at) {
      throw new UnauthorizedError('Refresh token expired');
    }

    if (session.is_revoked) {
      throw new UnauthorizedError('Session revoked');
    }

    const user = this.userRepo.findById(session.user_id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    this.sessionRepo.revoke(session.id);

    return this.createSession(user.id, user.username);
  }

  async logout(sessionId: string): Promise<void> {
    this.sessionRepo.revoke(sessionId);
  }

  async logoutAll(userId: string): Promise<void> {
    this.sessionRepo.revokeAllByUser(userId);
  }
}

let authService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new AuthService();
  }
  return authService;
}

export default AuthService;

import { BaseRepository } from './baseRepository';
import {
  Session,
  CreateSessionInput,
} from '../types';

export class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super('sessions');
  }

  protected mapRow(row: any): Session {
    return {
      ...row,
      expires_at: this.toDate(row.expires_at)!,
      created_at: this.toDate(row.created_at)!,
      updated_at: this.toDate(row.updated_at)!,
    };
  }

  create(input: CreateSessionInput): Session {
    this.run(`
      INSERT INTO sessions (id, user_id, token, refresh_token, ip_address, user_agent, device_info, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      input.id,
      input.user_id,
      input.token,
      input.refresh_token || null,
      input.ip_address || null,
      input.user_agent || null,
      input.device_info || null,
      this.fromDate(input.expires_at)
    ]);
    return this.findById(input.id)!;
  }

  findById(id: string): Session | undefined {
    const row = this.get(`
      SELECT * FROM sessions WHERE id = ?
    `, [id]);
    return row ? this.mapRow(row) : undefined;
  }

  findByToken(token: string): Session | undefined {
    const row = this.get(`
      SELECT * FROM sessions
      WHERE token = ? AND is_revoked = 0 AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `, [token]);
    return row ? this.mapRow(row) : undefined;
  }

  findByUser(userId: string): Session[] {
    const rows = this.all(`
      SELECT * FROM sessions
      WHERE user_id = ? AND is_revoked = 0
      ORDER BY created_at DESC
    `, [userId]);
    return rows.map((row) => this.mapRow(row));
  }

  findByRefreshToken(refreshToken: string): Session | undefined {
    const row = this.get(`
      SELECT * FROM sessions
      WHERE refresh_token = ? AND is_revoked = 0 AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `, [refreshToken]);
    return row ? this.mapRow(row) : undefined;
  }

  revoke(id: string): boolean {
    this.run(`
      UPDATE sessions SET is_revoked = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [id]);
    return true;
  }

  revokeAllByUser(userId: string): number {
    this.run(`
      UPDATE sessions SET is_revoked = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?
    `, [userId]);
    return 1;
  }

  revokeAllExcept(id: string, userId: string): number {
    this.run(`
      UPDATE sessions SET is_revoked = 1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND id != ?
    `, [userId, id]);
    return 1;
  }

  cleanupExpired(): number {
    this.run(`
      DELETE FROM sessions WHERE expires_at < datetime('now', '-7 days')
    `, []);
    return 1;
  }

  isTokenValid(token: string): boolean {
    const row = this.get(`
      SELECT 1 FROM sessions
      WHERE token = ? AND is_revoked = 0 AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `, [token]);
    return !!row;
  }
}

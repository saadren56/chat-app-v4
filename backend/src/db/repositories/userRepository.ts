import { BaseRepository } from './baseRepository';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserStatus,
} from '../types';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  protected mapRow(row: any): User {
    return {
      ...row,
      last_seen: this.toDate(row.last_seen),
      created_at: this.toDate(row.created_at)!,
      updated_at: this.toDate(row.updated_at)!,
    };
  }

  create(input: CreateUserInput): User {
    this.run(`
      INSERT INTO users (id, username, email, avatar, bio, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      input.id,
      input.username,
      input.email || null,
      input.avatar || null,
      input.bio || null,
      input.password_hash || null
    ]);
    return this.findById(input.id)!;
  }

  update(id: string, input: UpdateUserInput): User | undefined {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.username !== undefined) {
      updates.push('username = ?');
      values.push(input.username);
    }
    if (input.email !== undefined) {
      updates.push('email = ?');
      values.push(input.email);
    }
    if (input.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(input.avatar);
    }
    if (input.bio !== undefined) {
      updates.push('bio = ?');
      values.push(input.bio);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.last_seen !== undefined) {
      updates.push('last_seen = ?');
      values.push(this.fromDate(input.last_seen));
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    this.run(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `, values);
    return this.findById(id);
  }

  findByUsername(username: string): User | undefined {
    const row = this.get(`
      SELECT * FROM users WHERE username = ? AND is_deleted = 0
    `, [username]);
    return row ? this.mapRow(row) : undefined;
  }

  findByEmail(email: string): User | undefined {
    const row = this.get(`
      SELECT * FROM users WHERE email = ? AND is_deleted = 0
    `, [email]);
    return row ? this.mapRow(row) : undefined;
  }

  findByStatus(status: UserStatus): User[] {
    const rows = this.all(`
      SELECT * FROM users WHERE status = ? AND is_deleted = 0 ORDER BY username
    `, [status]);
    return rows.map((row) => this.mapRow(row));
  }

  searchUsers(query: string, limit: number = 20): User[] {
    const searchTerm = `%${query}%`;
    const rows = this.all(`
      SELECT * FROM users 
      WHERE (username LIKE ? OR email LIKE ? OR bio LIKE ?) 
      AND is_deleted = 0 
      ORDER BY username 
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, limit]);
    return rows.map((row) => this.mapRow(row));
  }

  updateStatus(id: string, status: UserStatus): User | undefined {
    return this.update(id, { status, last_seen: new Date() });
  }

  findOnlineUsers(): User[] {
    return this.findByStatus('online');
  }
}

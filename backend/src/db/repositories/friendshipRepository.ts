import { BaseRepository } from './baseRepository';
import {
  Friendship,
  CreateFriendshipInput,
  UpdateFriendshipInput,
  FriendshipStatus,
} from '../types';

export class FriendshipRepository extends BaseRepository<Friendship> {
  constructor() {
    super('friendships');
  }

  protected mapRow(row: any): Friendship {
    return {
      ...row,
      created_at: this.toDate(row.created_at)!,
      updated_at: this.toDate(row.updated_at)!,
    };
  }

  create(input: CreateFriendshipInput): Friendship {
    this.run(`
      INSERT INTO friendships (id, user_id, friend_id, status)
      VALUES (?, ?, ?, ?)
    `, [input.id, input.user_id, input.friend_id, input.status || 'pending']);
    return this.findById(input.id)!;
  }

  update(id: string, input: UpdateFriendshipInput): Friendship | undefined {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.is_mutual !== undefined) {
      updates.push('is_mutual = ?');
      values.push(input.is_mutual);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    this.run(`
      UPDATE friendships SET ${updates.join(', ')} WHERE id = ?
    `, values);
    return this.findById(id);
  }

  findByUser(userId: string): Friendship[] {
    const rows = this.all(`
      SELECT * FROM friendships
      WHERE (user_id = ? OR friend_id = ?) AND is_deleted = 0
      ORDER BY created_at DESC
    `, [userId, userId]);
    return rows.map((row) => this.mapRow(row));
  }

  findBetween(userId: string, friendId: string): Friendship | undefined {
    const row = this.get(`
      SELECT * FROM friendships
      WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
      AND is_deleted = 0
      LIMIT 1
    `, [userId, friendId, friendId, userId]);
    return row ? this.mapRow(row) : undefined;
  }

  findFriends(userId: string): Friendship[] {
    const rows = this.all(`
      SELECT * FROM friendships
      WHERE (user_id = ? OR friend_id = ?)
      AND status = 'accepted' AND is_deleted = 0
      ORDER BY created_at DESC
    `, [userId, userId]);
    return rows.map((row) => this.mapRow(row));
  }

  findPendingReceived(userId: string): Friendship[] {
    const rows = this.all(`
      SELECT * FROM friendships
      WHERE friend_id = ? AND status = 'pending' AND is_deleted = 0
      ORDER BY created_at DESC
    `, [userId]);
    return rows.map((row) => this.mapRow(row));
  }

  findPendingSent(userId: string): Friendship[] {
    const rows = this.all(`
      SELECT * FROM friendships
      WHERE user_id = ? AND status = 'pending' AND is_deleted = 0
      ORDER BY created_at DESC
    `, [userId]);
    return rows.map((row) => this.mapRow(row));
  }

  accept(id: string): Friendship | undefined {
    return this.update(id, { status: 'accepted', is_mutual: 1 });
  }

  decline(id: string): Friendship | undefined {
    return this.update(id, { status: 'declined' });
  }

  block(userId: string, friendId: string): Friendship | undefined {
    const existing = this.findBetween(userId, friendId);
    if (existing) {
      return this.update(existing.id, { status: 'blocked' });
    }
    return this.create({
      id: crypto.randomUUID(),
      user_id: userId,
      friend_id: friendId,
      status: 'blocked',
    });
  }

  areFriends(userId: string, friendId: string): boolean {
    const row = this.get(`
      SELECT 1 FROM friendships
      WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
      AND status = 'accepted' AND is_deleted = 0
      LIMIT 1
    `, [userId, friendId, friendId, userId]);
    return !!row;
  }

  isBlocked(userId: string, friendId: string): boolean {
    const row = this.get(`
      SELECT 1 FROM friendships
      WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
      AND status = 'blocked' AND is_deleted = 0
      LIMIT 1
    `, [userId, friendId, friendId, userId]);
    return !!row;
  }
}

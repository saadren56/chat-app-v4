import { BaseRepository } from './baseRepository';
import { TypingIndicator } from '../types';

export class TypingRepository extends BaseRepository<TypingIndicator> {
  constructor() {
    super('typing_indicators');
  }

  protected mapRow(row: any): TypingIndicator {
    return {
      ...row,
      updated_at: this.toDate(row.updated_at)!,
    };
  }

  findById(id: string): TypingIndicator | undefined {
    const row = this.get(`
      SELECT * FROM typing_indicators WHERE id = ?
    `, [id]);
    return row ? this.mapRow(row) : undefined;
  }

  setTyping(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): TypingIndicator {
    const id = `${conversationId}-${userId}`;
    this.run(`
      INSERT OR REPLACE INTO typing_indicators (id, conversation_id, user_id, is_typing, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [id, conversationId, userId, isTyping ? 1 : 0]);
    return this.findById(id)!;
  }

  getTypingUsers(conversationId: string): string[] {
    const rows = this.all(`
      SELECT user_id FROM typing_indicators
      WHERE conversation_id = ? AND is_typing = 1
      AND updated_at > datetime('now', '-5 seconds')
    `, [conversationId]);
    return rows.map((row: any) => row.user_id);
  }

  isTyping(conversationId: string, userId: string): boolean {
    const row = this.get(`
      SELECT 1 FROM typing_indicators
      WHERE conversation_id = ? AND user_id = ? AND is_typing = 1
      AND updated_at > datetime('now', '-5 seconds')
      LIMIT 1
    `, [conversationId, userId]);
    return !!row;
  }

  clearTyping(conversationId: string): void {
    this.run(`
      DELETE FROM typing_indicators WHERE conversation_id = ?
    `, [conversationId]);
  }

  clearUserTyping(userId: string): void {
    this.run(`
      DELETE FROM typing_indicators WHERE user_id = ?
    `, [userId]);
  }

  cleanupOldIndicators(): void {
    this.run(`
      DELETE FROM typing_indicators
      WHERE updated_at < datetime('now', '-30 seconds')
    `, []);
  }
}

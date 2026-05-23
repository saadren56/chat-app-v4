import { BaseRepository } from './baseRepository';
import {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationType,
} from '../types';

export class ConversationRepository extends BaseRepository<Conversation> {
  constructor() {
    super('conversations');
  }

  protected mapRow(row: any): Conversation {
    return {
      ...row,
      last_message_at: this.toDate(row.last_message_at),
      created_at: this.toDate(row.created_at)!,
      updated_at: this.toDate(row.updated_at)!,
    };
  }

  create(input: CreateConversationInput): Conversation {
    this.run(`
      INSERT INTO conversations (id, type, name, avatar, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      input.id,
      input.type,
      input.name || null,
      input.avatar || null,
      input.description || null,
      input.created_by
    ]);
    return this.findById(input.id)!;
  }

  update(id: string, input: UpdateConversationInput): Conversation | undefined {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name);
    }
    if (input.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(input.avatar);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.is_pinned !== undefined) {
      updates.push('is_pinned = ?');
      values.push(input.is_pinned);
    }
    if (input.is_muted !== undefined) {
      updates.push('is_muted = ?');
      values.push(input.is_muted);
    }
    if (input.is_archived !== undefined) {
      updates.push('is_archived = ?');
      values.push(input.is_archived);
    }
    if (input.last_message_id !== undefined) {
      updates.push('last_message_id = ?');
      values.push(input.last_message_id);
    }
    if (input.last_message_at !== undefined) {
      updates.push('last_message_at = ?');
      values.push(this.fromDate(input.last_message_at));
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    this.run(`
      UPDATE conversations SET ${updates.join(', ')} WHERE id = ?
    `, values);
    return this.findById(id);
  }

  findByUser(userId: string): Conversation[] {
    const rows = this.all(`
      SELECT c.* FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id
      WHERE cm.user_id = ? AND c.is_deleted = 0 AND cm.is_deleted = 0
      ORDER BY c.is_pinned DESC, c.last_message_at DESC, c.created_at DESC
    `, [userId]);
    return rows.map((row) => this.mapRow(row));
  }

  findDirectConversation(user1Id: string, user2Id: string): Conversation | undefined {
    const row = this.get(`
      SELECT c.* FROM conversations c
      WHERE c.type = 'direct' AND c.is_deleted = 0
      AND EXISTS (
        SELECT 1 FROM conversation_members cm1
        WHERE cm1.conversation_id = c.id AND cm1.user_id = ? AND cm1.is_deleted = 0
      )
      AND EXISTS (
        SELECT 1 FROM conversation_members cm2
        WHERE cm2.conversation_id = c.id AND cm2.user_id = ? AND cm2.is_deleted = 0
      )
    `, [user1Id, user2Id]);
    return row ? this.mapRow(row) : undefined;
  }

  findByType(type: ConversationType): Conversation[] {
    const rows = this.all(`
      SELECT * FROM conversations WHERE type = ? AND is_deleted = 0
      ORDER BY last_message_at DESC
    `, [type]);
    return rows.map((row) => this.mapRow(row));
  }

  findPinned(userId: string): Conversation[] {
    const rows = this.all(`
      SELECT c.* FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id
      WHERE cm.user_id = ? AND c.is_pinned = 1 AND c.is_deleted = 0 AND cm.is_deleted = 0
      ORDER BY c.last_message_at DESC
    `, [userId]);
    return rows.map((row) => this.mapRow(row));
  }

  updateLastMessage(conversationId: string, messageId: string, messageAt: Date): Conversation | undefined {
    return this.update(conversationId, {
      last_message_id: messageId,
      last_message_at: messageAt,
    });
  }

  pin(id: string): Conversation | undefined {
    return this.update(id, { is_pinned: 1 });
  }

  unpin(id: string): Conversation | undefined {
    return this.update(id, { is_pinned: 0 });
  }
}

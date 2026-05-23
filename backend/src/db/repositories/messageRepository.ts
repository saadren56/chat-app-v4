import { BaseRepository } from './baseRepository';
import {
  Message,
  CreateMessageInput,
  UpdateMessageInput,
  MessageType,
  MessageReaction,
  CreateMessageReactionInput,
  MessageAttachment,
  CreateMessageAttachmentInput,
  AttachmentType,
  PaginatedResult,
  PaginationParams,
} from '../types';

export class MessageRepository extends BaseRepository<Message> {
  constructor() {
    super('messages');
  }

  protected mapRow(row: any): Message {
    return {
      ...row,
      created_at: this.toDate(row.created_at)!,
      updated_at: this.toDate(row.updated_at)!,
    };
  }

  create(input: CreateMessageInput): Message {
    this.run(`
      INSERT INTO messages (id, conversation_id, sender_id, type, content, reply_to_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      input.id,
      input.conversation_id,
      input.sender_id,
      input.type || 'text',
      input.content,
      input.reply_to_id || null
    ]);
    return this.findById(input.id)!;
  }

  update(id: string, input: UpdateMessageInput): Message | undefined {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.content !== undefined) {
      updates.push('content = ?');
      values.push(input.content);
    }
    if (input.is_edited !== undefined) {
      updates.push('is_edited = ?');
      values.push(input.is_edited);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    this.run(`
      UPDATE messages SET ${updates.join(', ')} WHERE id = ?
    `, values);
    return this.findById(id);
  }

  findByConversation(
    conversationId: string,
    params: PaginationParams = {}
  ): PaginatedResult<Message> {
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    let whereClause = 'WHERE conversation_id = ? AND is_deleted = 0';
    const queryParams: any[] = [conversationId];

    if (params.before) {
      whereClause += ' AND created_at < ?';
      queryParams.push(params.before);
    }
    if (params.after) {
      whereClause += ' AND created_at > ?';
      queryParams.push(params.after);
    }

    queryParams.push(limit + 1);
    queryParams.push(offset);

    const rows = this.all(`
      SELECT * FROM messages
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, queryParams);

    const hasMore = rows.length > limit;
    const data = (hasMore ? rows.slice(0, -1) : rows).map((row) => this.mapRow(row)).reverse();

    const countResult = this.get(`
      SELECT COUNT(*) as count FROM messages
      WHERE conversation_id = ? AND is_deleted = 0
    `, [conversationId]);

    return {
      data,
      pagination: {
        limit,
        offset,
        total: (countResult as any).count,
        hasMore,
      },
    };
  }

  findByConversationSince(
    conversationId: string,
    since: Date
  ): Message[] {
    const rows = this.all(`
      SELECT * FROM messages
      WHERE conversation_id = ? AND created_at > ? AND is_deleted = 0
      ORDER BY created_at ASC
    `, [conversationId, since.toISOString()]);
    return rows.map((row) => this.mapRow(row));
  }

  findBySender(senderId: string, limit: number = 100): Message[] {
    const rows = this.all(`
      SELECT * FROM messages
      WHERE sender_id = ? AND is_deleted = 0
      ORDER BY created_at DESC
      LIMIT ?
    `, [senderId, limit]);
    return rows.map((row) => this.mapRow(row));
  }

  findByType(conversationId: string, type: MessageType): Message[] {
    const rows = this.all(`
      SELECT * FROM messages
      WHERE conversation_id = ? AND type = ? AND is_deleted = 0
      ORDER BY created_at DESC
    `, [conversationId, type]);
    return rows.map((row) => this.mapRow(row));
  }

  editMessage(id: string, content: string): Message | undefined {
    return this.update(id, { content, is_edited: 1 });
  }

  getLastMessage(conversationId: string): Message | undefined {
    const row = this.get(`
      SELECT * FROM messages
      WHERE conversation_id = ? AND is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 1
    `, [conversationId]);
    return row ? this.mapRow(row) : undefined;
  }

  getMessageCount(conversationId: string): number {
    const result = this.get(`
      SELECT COUNT(*) as count FROM messages
      WHERE conversation_id = ? AND is_deleted = 0
    `, [conversationId]);
    return (result as any).count;
  }

  addReaction(input: CreateMessageReactionInput): MessageReaction {
    this.run(`
      INSERT OR REPLACE INTO message_reactions (id, message_id, user_id, emoji)
      VALUES (?, ?, ?, ?)
    `, [input.id, input.message_id, input.user_id, input.emoji]);

    const row = this.get(`
      SELECT * FROM message_reactions WHERE id = ?
    `, [input.id]);
    return {
      ...row,
      created_at: this.toDate((row as any).created_at)!,
      updated_at: this.toDate((row as any).updated_at)!,
    };
  }

  removeReaction(messageId: string, userId: string, emoji: string): boolean {
    this.run(`
      UPDATE message_reactions 
      SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP 
      WHERE message_id = ? AND user_id = ? AND emoji = ?
    `, [messageId, userId, emoji]);
    return true;
  }

  getReactions(messageId: string): MessageReaction[] {
    const rows = this.all(`
      SELECT * FROM message_reactions 
      WHERE message_id = ? AND is_deleted = 0
    `, [messageId]);
    return rows.map((row) => ({
      ...row,
      created_at: this.toDate((row as any).created_at)!,
      updated_at: this.toDate((row as any).updated_at)!,
    }));
  }

  addAttachment(input: CreateMessageAttachmentInput): MessageAttachment {
    this.run(`
      INSERT INTO message_attachments (id, message_id, type, url, name, size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      input.id,
      input.message_id,
      input.type,
      input.url,
      input.name || null,
      input.size || null,
      input.mime_type || null
    ]);

    const row = this.get(`
      SELECT * FROM message_attachments WHERE id = ?
    `, [input.id]);
    return {
      ...row,
      created_at: this.toDate((row as any).created_at)!,
    };
  }

  getAttachments(messageId: string): MessageAttachment[] {
    const rows = this.all(`
      SELECT * FROM message_attachments 
      WHERE message_id = ? AND is_deleted = 0
    `, [messageId]);
    return rows.map((row) => ({
      ...row,
      created_at: this.toDate((row as any).created_at)!,
    }));
  }

  getAttachmentsByType(
    conversationId: string,
    type: AttachmentType
  ): MessageAttachment[] {
    const rows = this.all(`
      SELECT ma.* FROM message_attachments ma
      JOIN messages m ON ma.message_id = m.id
      WHERE m.conversation_id = ? AND ma.type = ? AND ma.is_deleted = 0
      ORDER BY ma.created_at DESC
    `, [conversationId, type]);
    return rows.map((row) => ({
      ...row,
      created_at: this.toDate((row as any).created_at)!,
    }));
  }
}

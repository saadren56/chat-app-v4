import { BaseRepository } from './baseRepository';
import {
  ConversationMember,
  CreateConversationMemberInput,
  UpdateConversationMemberInput,
  MemberRole,
} from '../types';

export class ConversationMemberRepository extends BaseRepository<ConversationMember> {
  constructor() {
    super('conversation_members');
  }

  protected mapRow(row: any): ConversationMember {
    return {
      ...row,
      last_read_at: this.toDate(row.last_read_at),
      joined_at: this.toDate(row.joined_at)!,
      created_at: this.toDate(row.created_at)!,
      updated_at: this.toDate(row.updated_at)!,
    };
  }

  create(input: CreateConversationMemberInput): ConversationMember {
    this.run(`
      INSERT INTO conversation_members (id, conversation_id, user_id, role)
      VALUES (?, ?, ?, ?)
    `, [
      input.id,
      input.conversation_id,
      input.user_id,
      input.role || 'member'
    ]);
    return this.findById(input.id)!;
  }

  update(id: string, input: UpdateConversationMemberInput): ConversationMember | undefined {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.role !== undefined) {
      updates.push('role = ?');
      values.push(input.role);
    }
    if (input.last_read_at !== undefined) {
      updates.push('last_read_at = ?');
      values.push(this.fromDate(input.last_read_at));
    }
    if (input.last_read_message_id !== undefined) {
      updates.push('last_read_message_id = ?');
      values.push(input.last_read_message_id);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    this.run(`
      UPDATE conversation_members SET ${updates.join(', ')} WHERE id = ?
    `, values);
    return this.findById(id);
  }

  findByConversation(conversationId: string): ConversationMember[] {
    const rows = this.all(`
      SELECT * FROM conversation_members
      WHERE conversation_id = ? AND is_deleted = 0
      ORDER BY role DESC, joined_at ASC
    `, [conversationId]);
    return rows.map((row) => this.mapRow(row));
  }

  findByUser(userId: string): ConversationMember[] {
    const rows = this.all(`
      SELECT * FROM conversation_members
      WHERE user_id = ? AND is_deleted = 0
      ORDER BY joined_at DESC
    `, [userId]);
    return rows.map((row) => this.mapRow(row));
  }

  findByConversationAndUser(
    conversationId: string,
    userId: string
  ): ConversationMember | undefined {
    const row = this.get(`
      SELECT * FROM conversation_members
      WHERE conversation_id = ? AND user_id = ? AND is_deleted = 0
      LIMIT 1
    `, [conversationId, userId]);
    return row ? this.mapRow(row) : undefined;
  }

  findByRole(conversationId: string, role: MemberRole): ConversationMember[] {
    const rows = this.all(`
      SELECT * FROM conversation_members
      WHERE conversation_id = ? AND role = ? AND is_deleted = 0
      ORDER BY joined_at ASC
    `, [conversationId, role]);
    return rows.map((row) => this.mapRow(row));
  }

  getMemberCount(conversationId: string): number {
    const result = this.get(`
      SELECT COUNT(*) as count FROM conversation_members
      WHERE conversation_id = ? AND is_deleted = 0
    `, [conversationId]);
    return (result as any).count;
  }

  updateReadState(
    conversationId: string,
    userId: string,
    messageId: string,
    readAt: Date
  ): ConversationMember | undefined {
    const member = this.findByConversationAndUser(conversationId, userId);
    if (!member) return undefined;

    return this.update(member.id, {
      last_read_at: readAt,
      last_read_message_id: messageId,
    });
  }

  updateRole(
    conversationId: string,
    userId: string,
    role: MemberRole
  ): ConversationMember | undefined {
    const member = this.findByConversationAndUser(conversationId, userId);
    if (!member) return undefined;

    return this.update(member.id, { role });
  }

  isMember(conversationId: string, userId: string): boolean {
    const row = this.get(`
      SELECT 1 FROM conversation_members
      WHERE conversation_id = ? AND user_id = ? AND is_deleted = 0
      LIMIT 1
    `, [conversationId, userId]);
    return !!row;
  }

  hasRole(
    conversationId: string,
    userId: string,
    roles: MemberRole[]
  ): boolean {
    const placeholders = roles.map(() => '?').join(',');
    const row = this.get(`
      SELECT 1 FROM conversation_members
      WHERE conversation_id = ? AND user_id = ? AND role IN (${placeholders}) AND is_deleted = 0
      LIMIT 1
    `, [conversationId, userId, ...roles]);
    return !!row;
  }
}

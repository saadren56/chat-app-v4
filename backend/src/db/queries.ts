import { getDatabase } from './index';

export const Queries = {
  getUserConversationsWithUnread: `
    SELECT 
      c.*,
      COUNT(m.id) FILTER (WHERE m.created_at > COALESCE(cm.last_read_at, '1970-01-01')) AS unread_count
    FROM conversations c
    JOIN conversation_members cm ON c.id = cm.conversation_id
    LEFT JOIN messages m ON c.id = m.conversation_id AND m.is_deleted = 0
    WHERE c.is_deleted = 0 AND cm.is_deleted = 0 AND cm.user_id = ?
    GROUP BY c.id
    ORDER BY c.is_pinned DESC, c.last_message_at DESC
  `,

  getConversationWithParticipants: `
    SELECT 
      c.*,
      json_group_array(
        json_object(
          'id', u.id,
          'username', u.username,
          'avatar', u.avatar,
          'status', u.status,
          'role', cm.role
        )
      ) as participants
    FROM conversations c
    JOIN conversation_members cm ON c.id = cm.conversation_id
    JOIN users u ON cm.user_id = u.id
    WHERE c.id = ? AND c.is_deleted = 0 AND cm.is_deleted = 0
    GROUP BY c.id
  `,

  getMessagesWithReactions: `
    SELECT 
      m.*,
      json_group_array(
        json_object(
          'emoji', mr.emoji,
          'count', (SELECT COUNT(*) FROM message_reactions mr2 WHERE mr2.message_id = m.id AND mr2.emoji = mr.emoji)
        )
      ) as reactions
    FROM messages m
    LEFT JOIN message_reactions mr ON m.id = mr.message_id AND mr.is_deleted = 0
    WHERE m.conversation_id = ? AND m.is_deleted = 0
    GROUP BY m.id
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `,

  searchMessages: `
    SELECT m.*, c.name as conversation_name
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    JOIN conversation_members cm ON c.id = cm.conversation_id
    WHERE cm.user_id = ? 
      AND m.content LIKE ? 
      AND m.is_deleted = 0 
      AND c.is_deleted = 0
    ORDER BY m.created_at DESC
    LIMIT ?
  `,

  getMutualFriends: `
    SELECT DISTINCT u.*
    FROM users u
    JOIN friendships f1 ON (u.id = f1.user_id OR u.id = f1.friend_id)
    JOIN friendships f2 ON (u.id = f2.user_id OR u.id = f2.friend_id)
    WHERE 
      ((f1.user_id = ? AND f1.status = 'accepted') OR (f1.friend_id = ? AND f1.status = 'accepted'))
      AND ((f2.user_id = ? AND f2.status = 'accepted') OR (f2.friend_id = ? AND f2.status = 'accepted'))
      AND u.id != ? AND u.id != ?
      AND u.is_deleted = 0
  `,

  getUnreadCountsByConversation: `
    SELECT 
      c.id as conversation_id,
      COUNT(m.id) as unread_count
    FROM conversations c
    JOIN conversation_members cm ON c.id = cm.conversation_id
    LEFT JOIN messages m ON c.id = m.conversation_id 
      AND m.is_deleted = 0 
      AND m.created_at > COALESCE(cm.last_read_at, '1970-01-01')
    WHERE cm.user_id = ? AND c.is_deleted = 0
    GROUP BY c.id
  `,

  getOnlineFriends: `
    SELECT u.*
    FROM users u
    JOIN friendships f ON (u.id = f.user_id OR u.id = f.friend_id)
    WHERE 
      ((f.user_id = ? AND f.status = 'accepted') OR (f.friend_id = ? AND f.status = 'accepted'))
      AND u.status = 'online'
      AND u.is_deleted = 0
      AND u.id != ?
  `,

  insertOrIgnore: (table: string, columns: string[], values: any[]) => {
    const db = getDatabase();
    const placeholders = columns.map(() => '?').join(', ');
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
    `);
    return stmt.run(...values);
  },

  bulkInsert: (table: string, columns: string[], rows: any[][]) => {
    const db = getDatabase();
    const placeholders = columns.map(() => '?').join(', ');
    const stmt = db.prepare(`
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
    `);
    
    const insertMany = db.transaction((items: any[][]) => {
      for (const row of items) {
        stmt.run(...row);
      }
    });
    
    insertMany(rows);
  },
};

export function getUserConversationsWithUnread(userId: string) {
  const db = getDatabase();
  const stmt = db.prepare(Queries.getUserConversationsWithUnread);
  return stmt.all(userId);
}

export function searchMessages(userId: string, query: string, limit: number = 50) {
  const db = getDatabase();
  const searchTerm = `%${query}%`;
  const stmt = db.prepare(Queries.searchMessages);
  return stmt.all(userId, searchTerm, limit);
}

export function getOnlineFriends(userId: string) {
  const db = getDatabase();
  const stmt = db.prepare(Queries.getOnlineFriends);
  return stmt.all(userId, userId, userId);
}

export function getMutualFriends(userId1: string, userId2: string) {
  const db = getDatabase();
  const stmt = db.prepare(Queries.getMutualFriends);
  return stmt.all(userId1, userId1, userId2, userId2, userId1, userId2);
}

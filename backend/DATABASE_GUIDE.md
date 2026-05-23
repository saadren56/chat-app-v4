# CyberChat SQLite Database Architecture

Complete, production-ready SQLite database architecture for realtime messaging applications using better-sqlite3.

---

## 📁 Database Structure

```
backend/src/db/
├── index.ts              # Database initialization
├── schema.ts             # Complete SQL schema
├── types.ts              # TypeScript type definitions
├── queries.ts            # Complex query helpers
├── services/
│   ├── index.ts
│   └── databaseService.ts # High-level database service
└── repositories/
    ├── index.ts
    ├── baseRepository.ts        # Base repository class
    ├── userRepository.ts        # Users table
    ├── friendshipRepository.ts  # Friendships table
    ├── conversationRepository.ts # Conversations table
    ├── conversationMemberRepository.ts # Conversation members
    ├── messageRepository.ts     # Messages + reactions + attachments
    ├── typingRepository.ts      # Typing indicators
    └── sessionRepository.ts     # Sessions table
```

---

## 🗄️ Tables Overview

### 1. **users**
Stores user account information.

**Columns:**
- `id` (TEXT, PK) - Unique user ID
- `username` (TEXT, UNIQUE) - Username
- `email` (TEXT, UNIQUE) - Email address
- `avatar` (TEXT) - Avatar URL
- `bio` (TEXT) - User biography
- `status` (TEXT) - Online status (online/offline/away/busy)
- `last_seen` (DATETIME) - Last activity timestamp
- `password_hash` (TEXT) - Hashed password
- `is_deleted` (INTEGER) - Soft delete flag
- `created_at` / `updated_at` (DATETIME) - Timestamps

**Indexes:**
- `idx_users_username` - Username lookups
- `idx_users_email` - Email lookups
- `idx_users_status` - Status filtering
- `idx_users_created_at` - Sorting

---

### 2. **friendships**
Manages friend relationships and requests.

**Columns:**
- `id` (TEXT, PK) - Unique friendship ID
- `user_id` / `friend_id` (TEXT, FK) - User IDs
- `status` (TEXT) - pending/accepted/declined/blocked
- `is_mutual` (INTEGER) - Mutual friendship flag
- `is_deleted` (INTEGER) - Soft delete flag
- Timestamps

**Indexes:**
- `idx_friendships_user_id` / `idx_friendships_friend_id`
- `idx_friendships_status` - Status filtering
- `idx_friendships_bidirectional` - Composite index

---

### 3. **conversations**
Chat conversations (direct and group).

**Columns:**
- `id` (TEXT, PK) - Conversation ID
- `type` (TEXT) - direct/group
- `name` / `avatar` / `description` - Group conversation info
- `created_by` (TEXT, FK) - Creator user ID
- `is_pinned` / `is_muted` / `is_archived` - Flags
- `last_message_id` (TEXT, FK) - Last message reference
- `last_message_at` (DATETIME) - Last message timestamp
- `is_deleted` + timestamps

**Indexes:**
- `idx_conversations_type` - Type filtering
- `idx_conversations_created_by` - Creator lookup
- `idx_conversations_is_pinned` - Pinned sorting
- `idx_conversations_last_message_at` - Sorting

---

### 4. **conversation_members**
Members in conversations with roles and read state.

**Columns:**
- `id` (TEXT, PK)
- `conversation_id` / `user_id` (TEXT, FK)
- `role` (TEXT) - member/admin/owner
- `last_read_at` (DATETIME) - Last read timestamp
- `last_read_message_id` (TEXT, FK) - Last read message
- `joined_at` (DATETIME) - Join timestamp
- `is_deleted` + timestamps

**Indexes:**
- `idx_conversation_members_conversation_id` / `user_id`
- `idx_conversation_members_role` - Role filtering
- `idx_conversation_members_last_read_at` - Unread calculations

---

### 5. **messages**
Chat messages with soft delete.

**Columns:**
- `id` (TEXT, PK)
- `conversation_id` / `sender_id` (TEXT, FK)
- `type` (TEXT) - text/image/file/audio/video/system
- `content` (TEXT) - Message content
- `reply_to_id` (TEXT, FK) - Reply reference
- `is_edited` / `is_deleted` (INTEGER) - Flags
- Timestamps

**Indexes:**
- `idx_messages_conversation_id` - Conversation lookups
- `idx_messages_sender_id` - Sender lookups
- `idx_messages_created_at` - Sorting
- `idx_messages_conversation_created` - Composite for pagination

---

### 6. **message_reactions**
Message reactions (emojis).

**Columns:**
- `id` (TEXT, PK)
- `message_id` / `user_id` (TEXT, FK)
- `emoji` (TEXT) - Emoji character
- `is_deleted` + timestamps
- UNIQUE(message_id, user_id, emoji)

**Indexes:**
- `idx_message_reactions_message_id` / `user_id` / `emoji`

---

### 7. **message_attachments**
File attachments for messages.

**Columns:**
- `id` (TEXT, PK)
- `message_id` (TEXT, FK)
- `type` (TEXT) - image/file/audio/video
- `url` / `name` / `size` / `mime_type` - File info
- `is_deleted` + created_at

**Indexes:**
- `idx_message_attachments_message_id` / `type`

---

### 8. **typing_indicators**
Ephemeral typing state (auto-cleanup).

**Columns:**
- `id` (TEXT, PK)
- `conversation_id` / `user_id` (TEXT, FK)
- `is_typing` (INTEGER)
- `updated_at` (DATETIME)
- UNIQUE(conversation_id, user_id)

**Indexes:**
- `idx_typing_indicators_conversation_id` / `user_id` / `updated_at`

---

### 9. **sessions**
Authentication sessions.

**Columns:**
- `id` (TEXT, PK)
- `user_id` (TEXT, FK)
- `token` (TEXT, UNIQUE) - JWT/access token
- `refresh_token` (TEXT) - Refresh token
- `ip_address` / `user_agent` / `device_info` - Client info
- `expires_at` (DATETIME) - Expiration timestamp
- `is_revoked` (INTEGER) - Revocation flag
- Timestamps

**Indexes:**
- `idx_sessions_user_id` / `token` / `expires_at` / `is_revoked`

---

## 🔧 Database Configuration

### Pragmas (Optimized for Performance)
```sql
PRAGMA journal_mode = WAL;           -- Write-Ahead Logging (concurrent reads)
PRAGMA synchronous = NORMAL;         -- Balanced safety/performance
PRAGMA cache_size = -64000;         -- 64MB cache
PRAGMA foreign_keys = ON;            -- Enforce FK constraints
PRAGMA busy_timeout = 5000;          -- 5s timeout for busy DB
```

### Triggers
Automatic `updated_at` timestamp updates on all tables.

### View
`user_conversations` - Materialized view with unread counts.

---

## 🚀 Quick Start

### Initialize Database
```typescript
import { initDatabase, getDatabase } from './db';

// Initialize (run once at app startup)
const db = initDatabase();

// Get instance later
const db = getDatabase();
```

### Using Repository Pattern
```typescript
import { UserRepository, MessageRepository } from './db/repositories';

const userRepo = new UserRepository();
const messageRepo = new MessageRepository();

// Create user
const user = userRepo.create({
  id: 'user-1',
  username: 'cyber_user',
});

// Create message
const message = messageRepo.create({
  id: 'msg-1',
  conversation_id: 'conv-1',
  sender_id: 'user-1',
  content: 'Hello!',
});

// Get paginated messages
const result = messageRepo.findByConversation('conv-1', {
  limit: 50,
  before: '2024-01-01T00:00:00Z',
});
```

### Using Database Service (Recommended)
```typescript
import { getDatabaseService } from './db/services';

const db = getDatabaseService();

// Create conversation with members
const conversation = await db.createConversation(
  { id: 'conv-1', type: 'direct', created_by: 'user-1' },
  ['user-1', 'user-2'],
  'user-1'
);

// Send message with reactions
const message = await db.createMessage({
  id: 'msg-1',
  conversation_id: 'conv-1',
  sender_id: 'user-1',
  content: 'Hello!',
});

await db.addMessageReaction({
  id: 'react-1',
  message_id: 'msg-1',
  user_id: 'user-2',
  emoji: '👍',
});
```

---

## 📊 Query Examples

### Get User Conversations with Unread Counts
```typescript
import { getUserConversationsWithUnread } from './db/queries';

const conversations = getUserConversationsWithUnread('user-1');
```

### Search Messages
```typescript
import { searchMessages } from './db/queries';

const results = searchMessages('user-1', 'hello', 50);
```

### Get Online Friends
```typescript
import { getOnlineFriends } from './db/queries';

const onlineFriends = getOnlineFriends('user-1');
```

---

## 🎯 Key Features

### ✅ **Proper Relations**
- Foreign keys with `ON DELETE CASCADE`
- Enforced referential integrity
- Composite unique constraints

### ✅ **Comprehensive Indexes**
- Single and composite indexes
- Optimized for common query patterns
- Indexes on status, dates, and lookups

### ✅ **Timestamps Everywhere**
- `created_at` and `updated_at` on all tables
- Automatic updates via triggers
- Millisecond precision

### ✅ **Message Pagination**
- Cursor-based pagination (before/after)
- Limit/offset support
- `hasMore` flag for infinite scroll
- Optimized with composite index

### ✅ **Seen Status**
- `last_read_at` per user per conversation
- Unread count calculations
- Efficient query via view

### ✅ **Typing Support**
- Ephemeral typing indicators
- Auto-cleanup of old entries
- Per-conversation typing users

### ✅ **Soft Delete Support**
- `is_deleted` flag on all tables
- Queries automatically filter deleted
- Easy to restore (if needed)
- Hard delete option available

---

## 🔄 Maintenance

### Backup Database
```typescript
import { backupDatabase } from './db';
backupDatabase('./backups/chat-backup.db');
```

### Vacuum Database
```typescript
import { vacuumDatabase } from './db';
vacuumDatabase(); // Reclaims space
```

### Get Stats
```typescript
import { getDatabaseStats } from './db';
const stats = getDatabaseStats();
// { tables: 9, size: 123456, pageCount: 123, pageSize: 4096 }
```

### Cleanup Jobs
```typescript
// Run periodically (e.g., every hour)
const db = getDatabaseService();
db.cleanupTypingIndicators();  // Clear old typing
db.cleanupExpiredSessions();   // Clear expired sessions
vacuumDatabase();              // Reclaim space
```

---

## 📈 Performance Tips

1. **Use WAL Mode** - Enabled by default, allows concurrent readers
2. **Batch Operations** - Use transactions for multiple writes
3. **Paginate Results** - Don't load all messages at once
4. **Use Indexes** - Queries already optimized via indexes
5. **Limit Columns** - Select only needed columns
6. **Soft Deletes** - Fast deletion without table fragmentation
7. **Periodic Vacuum** - Reclaim unused space
8. **Connection Pool** - better-sqlite3 is synchronous, so no pooling needed

---

## 🔒 Security

1. **Parameterized Queries** - All queries use prepared statements (no SQL injection)
2. **Foreign Keys** - Enforced referential integrity
3. **Soft Deletes** - Audit trail available
4. **No Secrets in DB** - Store hashes, not plain text
5. **Session Expiry** - Sessions automatically expire

---

## 📝 Migration Example

```typescript
// Example migration to add a column
const db = getDatabase();
db.exec(`
  ALTER TABLE users ADD COLUMN last_active DATETIME;
  CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
`);
```

---

This architecture is production-ready, optimized for realtime chat applications, and follows SQLite best practices! 🚀

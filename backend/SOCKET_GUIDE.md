# Socket.IO Realtime Architecture Guide

Complete, production-ready Socket.IO realtime architecture for messaging applications.

---

## 📁 Architecture Overview

```
backend/
└── src/socket/
    ├── index.ts              # Socket server setup
    ├── types.ts              # Type definitions & constants
    └── handlers/
        ├── index.ts
        ├── authHandler.ts     # Authentication handlers
        ├── messageHandler.ts  # Message & reaction handlers
        └── conversationHandler.ts # Conversation & typing handlers

frontend/
└── src/
    ├── lib/socket/
    │   ├── index.ts
    │   ├── socketService.ts   # Client socket service
    │   └── types.ts           # Client type definitions
    ├── store/slices/
    │   └── socketSlice.ts     # Zustand socket slice
    └── features/socket/
        ├── index.ts
        └── SocketProvider.tsx # React socket provider
```

---

## 🔌 Server Architecture

### **Type-Safe Events**

Complete TypeScript type definitions for all socket events:

**Client → Server Events:**
```typescript
'auth:authenticate'
'message:send'
'message:edit'
'message:delete'
'message:read'
'reaction:add'
'reaction:remove'
'typing:start'
'typing:stop'
'conversation:join'
'conversation:leave'
'presence:status'
```

**Server → Client Events:**
```typescript
'auth:authenticated'
'auth:error'
'message:new'
'message:edited'
'message:deleted'
'message:read'
'reaction:added'
'reaction:removed'
'typing:start'
'typing:stop'
'user:online'
'user:offline'
'user:status'
'conversation:updated'
'conversation:deleted'
'conversation:pinned'
'conversation:unpinned'
'member:joined'
'member:left'
'error'
```

---

## 🚀 Quick Start - Server

### Initialize Socket.IO in Express

```typescript
import http from 'http';
import express from 'express';
import { setupSocketIO } from './socket';

const app = express();
const server = http.createServer(app);

const socketServer = setupSocketIO(server);

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### Socket Server Configuration

```typescript
// src/socket/index.ts
{
  cors: {
    origin: env.SOCKET_CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
  },
  pingInterval: 25000,   // 25s
  pingTimeout: 20000,     // 20s
}
```

---

## 🌟 Server Features

### ✅ Connection Authentication
- JWT token validation on `auth:authenticate`
- Session validation in database
- Token expiry and revocation checks

### ✅ User Presence Tracking
- Multi-device support (user can have multiple sockets)
- Online/offline status broadcast
- Custom status updates (away/busy)
- Auto-offline on disconnect

### ✅ Conversation Rooms
- Users join specific conversation rooms
- Messages broadcast only to conversation members
- Efficient room management

### ✅ Typing Indicators
- Debounced typing events
- Auto-timeout after 3 seconds
- Per-conversation typing users
- Cleanup job every 30 seconds

### ✅ Message Operations
- Send messages to conversation
- Edit messages
- Delete messages
- Mark messages as read
- Add/remove reactions

### ✅ Reconnection Handling
- Connection state recovery
- Automatic reconnection with backoff
- Reconnect attempts tracking

### ✅ Error Handling
- Per-socket error events
- Graceful error broadcasting
- Server-side logging

---

## 📱 Client Architecture

### Initialize Socket Service

```typescript
import { getSocketService } from '../lib/socket';

const socket = getSocketService('http://localhost:3001');
socket.connect();
```

### Socket Service API

```typescript
// Connection
socket.connect();
socket.disconnect();
socket.authenticate(token);

// Status
socket.getStatus();
socket.isConnected();
socket.isAuthenticated();
socket.getCurrentUser();

// Messages
socket.sendMessage(conversationId, content, type?, replyToId?);
socket.editMessage(messageId, content);
socket.deleteMessage(messageId);
socket.markMessageRead(conversationId, messageId);

// Reactions
socket.addReaction(messageId, emoji);
socket.removeReaction(messageId, emoji);

// Typing
socket.startTyping(conversationId);
socket.stopTyping(conversationId);

// Conversations
socket.joinConversation(conversationId);
socket.leaveConversation(conversationId);

// Presence
socket.updatePresenceStatus('away' | 'busy' | 'online');

// Event listeners
const unsubscribe = socket.on('message:new', handler);
unsubscribe();
socket.off('message:new', handler);
socket.once('message:new', handler);
```

---

## 🎨 React Integration

### Socket Provider

```tsx
import { SocketProvider, useSocket } from '../features/socket';

function App() {
  return (
    <SocketProvider>
      <YourApp />
    </SocketProvider>
  );
}

function Chat() {
  const { sendMessage, startTyping, stopTyping } = useSocket();
  
  return (
    <div>
      <MessageInput 
        onSend={sendMessage}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
      />
    </div>
  );
}
```

### Zustand Socket Slice

```typescript
import { useSocketStore } from '../store/slices/socketSlice';

function Component() {
  const {
    connected,
    authenticated,
    onlineUsers,
    typingUsers,
    currentUser,
  } = useSocketStore();
  
  const conversationTypingUsers = typingUsers.get(conversationId);
  
  return (
    <div>
      {Array.from(onlineUsers.values()).map(user => (
        <UserAvatar key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## 🔐 Authentication Flow

### Client → Server
```
1. Client connects via Socket.IO
2. Client emits 'auth:authenticate' with JWT token
3. Server validates token in database
4. Server responds with 'auth:authenticated' or 'auth:error'
```

### Server Validation
```typescript
// Check if token exists
// Check if token is revoked
// Check token expiration
// Verify user exists
// Attach user data to socket
// Broadcast user online status
```

---

## 💬 Message Flow

### Sending a Message
```typescript
// Client
socket.sendMessage(conversationId, 'Hello!');

// Server validates:
// - User authenticated
// - User is member of conversation
// - Message content valid

// Server persists to database
// Server broadcasts 'message:new' to conversation room
// Server updates conversation last_message

// All clients in room receive 'message:new'
```

---

## ⌨️ Typing Indicator Flow

```typescript
// User starts typing
socket.startTyping(conversationId);
// Server broadcasts 'typing:start'

// Auto-stop after 3 seconds
// Or explicit stop
socket.stopTyping(conversationId);
// Server broadcasts 'typing:stop'

// Cleanup job removes stale indicators every 30s
```

---

## 👥 Presence Flow

```typescript
// User connects & authenticates
// Server broadcasts 'user:online' to all

// User disconnects
// Server checks if any other sockets for user
// If none, broadcasts 'user:offline'

// User changes status
socket.updatePresenceStatus('away');
// Server broadcasts 'user:status'
```

---

## 📋 Event Reference

### Authentication
| Event | Direction | Description |
|-------|-----------|-------------|
| `auth:authenticate` | Client → Server | Send JWT token |
| `auth:authenticated` | Server → Client | Auth successful |
| `auth:error` | Server → Client | Auth failed |

### Messages
| Event | Direction | Description |
|-------|-----------|-------------|
| `message:send` | Client → Server | Send message |
| `message:new` | Server → Client | New message received |
| `message:edit` | Client → Server | Edit message |
| `message:edited` | Server → Client | Message edited |
| `message:delete` | Client → Server | Delete message |
| `message:deleted` | Server → Client | Message deleted |
| `message:read` | Both | Mark message read |

### Reactions
| Event | Direction | Description |
|-------|-----------|-------------|
| `reaction:add` | Client → Server | Add reaction |
| `reaction:added` | Server → Client | Reaction added |
| `reaction:remove` | Client → Server | Remove reaction |
| `reaction:removed` | Server → Client | Reaction removed |

### Typing
| Event | Direction | Description |
|-------|-----------|-------------|
| `typing:start` | Both | User started typing |
| `typing:stop` | Both | User stopped typing |

### Presence
| Event | Direction | Description |
|-------|-----------|-------------|
| `user:online` | Server → Client | User came online |
| `user:offline` | Server → Client | User went offline |
| `user:status` | Server → Client | User status changed |
| `presence:status` | Client → Server | Update own status |

### Conversations
| Event | Direction | Description |
|-------|-----------|-------------|
| `conversation:join` | Client → Server | Join conversation room |
| `conversation:leave` | Client → Server | Leave conversation room |
| `conversation:updated` | Server → Client | Conversation updated |
| `conversation:deleted` | Server → Client | Conversation deleted |
| `member:joined` | Server → Client | Member joined |
| `member:left` | Server → Client | Member left |

---

## ⚡ Performance Optimizations

### Server-Side
- **Connection State Recovery** - 2min buffer for reconnections
- **Room-based Broadcasting** - Only send to relevant users
- **Efficient Presence** - Only broadcast when last socket disconnects
- **Cleanup Jobs** - Periodic cleanup of stale typing indicators
- **Typed Events** - Full TypeScript safety, no runtime errors

### Client-Side
- **Debounced Typing** - Auto-stop after 3 seconds
- **Event Listener Management** - Easy subscribe/unsubscribe
- **Singleton Service** - Single socket instance per app
- **Reconnection Backoff** - Exponential backoff on reconnect
- **Status Tracking** - Real-time connection status

---

## 🔒 Security

- **JWT Authentication** - Token validation on every auth
- **Session Validation** - Check token not revoked in DB
- **Membership Checks** - Verify user is in conversation before allowing actions
- **CORS Configuration** - Restricted origins
- **No Secrets Exposed** - All validation server-side
- **Error Sanitization** - Safe error messages to client

---

## 🐛 Troubleshooting

### Connection Issues
```typescript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // 'io server disconnect' - server disconnected
  // 'io client disconnect' - client called disconnect()
  // 'ping timeout' - server didn't respond to ping
  // 'transport close' - connection lost
  // 'transport error' - error on connection
});
```

### Reconnection
```typescript
socket.on('reconnecting', (attempt) => {
  console.log(`Reconnecting... (attempt ${attempt})`);
});

socket.on('reconnect', (attempt) => {
  console.log(`Reconnected after ${attempt} attempts`);
  // Re-authenticate if needed
});

socket.on('reconnect_failed', () => {
  console.log('Reconnection failed');
  // Show error to user
});
```

---

This architecture is production-ready, scalable, and follows Socket.IO best practices! 🚀

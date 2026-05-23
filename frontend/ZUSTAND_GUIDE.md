# CyberChat Zustand Store Guide

Professional, scalable Zustand store architecture for realtime chat applications.

---

## 📁 Store Structure

```
src/store/
├── index.ts              # Main store + selectors
├── types.ts              # TypeScript type definitions
└── slices/
    ├── userSlice.ts          # Current user state
    ├── friendsSlice.ts       # Friends & friend requests
    ├── conversationsSlice.ts # Conversations list
    ├── messagesSlice.ts      # Messages by conversation
    ├── typingSlice.ts        # Typing indicators
    ├── themeSlice.ts         # Theme state
    ├── onlineUsersSlice.ts   # Online user tracking
    └── notificationsSlice.ts # Notifications
```

---

## 🚀 Quick Start

### Basic Usage

```tsx
import {
  useCurrentUser,
  useConversations,
  useActiveConversationId,
  useTheme,
  useStoreActions,
} from './store';

function ChatApp() {
  const user = useCurrentUser();
  const conversations = useConversations();
  const activeId = useActiveConversationId();
  const theme = useTheme();
  const { setActiveConversationId } = useStoreActions();

  return (
    <div>
      <h1>Welcome, {user?.username}!</h1>
      {/* ... */}
    </div>
  );
}
```

---

## 🎯 Individual Selectors

### User State

```tsx
import {
  useCurrentUser,
  useSetCurrentUser,
  useUpdateCurrentUser,
  useAuthContext,
} from './store';

function UserProfile() {
  const user = useCurrentUser();
  const setUser = useSetCurrentUser();
  const updateUser = useUpdateCurrentUser();
  const { clearCurrentUser } = useAuthContext();

  const handleLogin = () => {
    setUser({
      id: '1',
      username: 'cyber_user',
      status: 'online',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const handleUpdateBio = () => {
    updateUser({ bio: 'Living in the future!' });
  };

  const handleLogout = () => {
    clearCurrentUser();
  };
}
```

### Friends & Requests

```tsx
import {
  useFriends,
  usePendingRequests,
  useSentRequests,
  useStoreActions,
} from './store';

function FriendsList() {
  const friends = useFriends();
  const pending = usePendingRequests();
  const sent = useSentRequests();
  const { addFriend, removeFriend, setPendingRequests } = useStoreActions();

  return (
    <div>
      <h3>Friends ({friends.length})</h3>
      {friends.map((friend) => (
        <div key={friend.id}>
          <span>{friend.username}</span>
          <button onClick={() => removeFriend(friend.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Conversations

```tsx
import {
  useConversations,
  useActiveConversationId,
  useActiveConversation,
  usePinnedConversations,
  useUnpinnedConversations,
  useTotalUnreadCount,
  useStoreActions,
} from './store';

function ConversationSidebar() {
  const conversations = useConversations();
  const activeId = useActiveConversationId();
  const active = useActiveConversation();
  const pinned = usePinnedConversations();
  const unpinned = useUnpinnedConversations();
  const totalUnread = useTotalUnreadCount();
  const {
    setActiveConversationId,
    pinConversation,
    unpinConversation,
    markAsRead,
  } = useStoreActions();

  return (
    <div>
      <div className="unread-badge">{totalUnread}</div>
      
      {pinned.map((conv) => (
        <div
          key={conv.id}
          className={conv.id === activeId ? 'active' : ''}
          onClick={() => {
            setActiveConversationId(conv.id);
            markAsRead(conv.id);
          }}
        >
          {conv.name}
          <button onClick={() => unpinConversation(conv.id)}>
            Unpin
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Messages

```tsx
import {
  useMessages,
  useStoreActions,
} from './store';

function MessageList({ conversationId }: { conversationId: string }) {
  const messages = useMessages(conversationId);
  const { addMessage, updateMessage, removeMessage, addReaction, removeReaction } = useStoreActions();

  const handleSendMessage = (text: string) => {
    addMessage(conversationId, {
      id: crypto.randomUUID(),
      conversationId,
      senderId: 'current-user',
      type: 'text',
      content: text,
      status: 'sent',
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const handleAddReaction = (messageId: string, emoji: string, userId: string) => {
    addReaction(conversationId, messageId, emoji, userId);
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <p>{msg.content}</p>
          <button onClick={() => handleAddReaction(msg.id, '👍', 'user-1')}>
            👍
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Typing Indicators

```tsx
import {
  useTypingUsers,
  useStoreActions,
} from './store';

function TypingIndicator({ conversationId }: { conversationId: string }) {
  const typingUsers = useTypingUsers(conversationId);
  const { setTyping } = useStoreActions();

  const handleTypingStart = (userId: string) => {
    setTyping(conversationId, userId, true);
  };

  const handleTypingStop = (userId: string) => {
    setTyping(conversationId, userId, false);
  };

  if (typingUsers.length === 0) return null;

  return (
    <div>
      {typingUsers.length === 1
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.join(', ')} are typing...`}
    </div>
  );
}
```

### Theme State

```tsx
import {
  useTheme,
  useThemeMode,
  useThemeAccent,
  useThemeContext,
  useToggleThemeMode,
} from './store';

function ThemeSettings() {
  const theme = useTheme();
  const mode = useThemeMode();
  const accent = useThemeAccent();
  const { setThemeMode, setThemeAccent } = useThemeContext();
  const toggleMode = useToggleThemeMode();

  return (
    <div>
      <p>Current mode: {mode}</p>
      <p>Current accent: {accent}</p>
      
      <button onClick={toggleMode}>
        Toggle Theme
      </button>
      
      <button onClick={() => setThemeMode('dark')}>
        Dark
      </button>
      
      <button onClick={() => setThemeMode('light')}>
        Light
      </button>
      
      <button onClick={() => setThemeAccent('purple')}>
        Purple Accent
      </button>
      
      <button onClick={() => setThemeAccent('cyan')}>
        Cyan Accent
      </button>
    </div>
  );
}
```

### Online Users

```tsx
import {
  useOnlineUserIds,
  useIsUserOnline,
  useStoreActions,
} from './store';

function OnlineUsersList() {
  const onlineIds = useOnlineUserIds();
  const isAliceOnline = useIsUserOnline('alice-123');
  const { addOnlineUser, removeOnlineUser, setOnlineUsers } = useStoreActions();

  return (
    <div>
      <h3>Online ({onlineIds.length})</h3>
      <p>Alice is {isAliceOnline ? 'online' : 'offline'}</p>
    </div>
  );
}
```

### Notifications

```tsx
import {
  useNotifications,
  useUnreadNotificationsCount,
  useStoreActions,
} from './store';

function NotificationsPanel() {
  const notifications = useNotifications();
  const unreadCount = useUnreadNotificationsCount();
  const {
    addNotification,
    markNotificationAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useStoreActions();

  return (
    <div>
      <div className="badge">{unreadCount}</div>
      
      <button onClick={markAllAsRead}>
        Mark all as read
      </button>
      
      <button onClick={clearAllNotifications}>
        Clear all
      </button>
      
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={!notif.isRead ? 'unread' : ''}
        >
          <h4>{notif.title}</h4>
          <p>{notif.body}</p>
          <button onClick={() => markNotificationAsRead(notif.id)}>
            Mark read
          </button>
          <button onClick={() => removeNotification(notif.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Batch Selectors

For multiple related values, use batch selectors to minimize rerenders:

```tsx
import {
  useChatContext,
  useThemeContext,
  useAuthContext,
} from './store';

function ChatApp() {
  const { currentUser, activeConversationId, conversations } = useChatContext();
  const { theme, setThemeMode, toggleThemeMode } = useThemeContext();
  const { currentUser: user, setCurrentUser, clearCurrentUser } = useAuthContext();

  return <div>{/* ... */}</div>;
}
```

---

## 🔧 Action Batch Selector

Get all actions at once with `useStoreActions`:

```tsx
import { useStoreActions } from './store';

function ChatFeatures() {
  const {
    addMessage,
    updateMessage,
    addReaction,
    setActiveConversationId,
    pinConversation,
    markAsRead,
    setTyping,
    addNotification,
    markAllAsRead,
    setThemeMode,
    toggleThemeMode,
  } = useStoreActions();

  return <div>{/* ... */}</div>;
}
```

---

## 💾 Persistence

The store automatically persists these paths to localStorage:
- `theme` - Theme settings
- `currentUser` - Current user
- `friends` - Friends list
- `conversations` - Conversations list

On app load, these are automatically rehydrated.

---

## 🎨 Optimized Rerenders

### Single Value Selectors (Best!)

```tsx
// Only rerenders when this specific value changes
const user = useCurrentUser();
const conversations = useConversations();
const theme = useTheme();
```

### Shallow Comparison for Objects

Use `shallow` from Zustand when selecting multiple values:

```tsx
import { shallow } from 'zustand/shallow';

// Rerenders only when one of the values changes
const { user, theme } = useAppStore(
  (state) => ({
    user: state.currentUser,
    theme: state.theme,
  }),
  shallow
);
```

### Batch Selectors (Pre-built!)

```tsx
// Already uses shallow comparison!
const { currentUser, activeConversationId } = useChatContext();
```

---

## 🔄 Resetting the Store

```tsx
import { useStoreActions } from './store';

function LogoutButton() {
  const { resetStore } = useStoreActions();

  const handleLogout = () => {
    resetStore();
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## 📋 Store API Summary

### State
- `currentUser` - Current authenticated user
- `friends` - Friends list
- `pendingRequests` - Incoming friend requests
- `sentRequests` - Outgoing friend requests
- `conversations` - All conversations
- `activeConversationId` - Currently selected conversation
- `messages` - Messages by conversation ID
- `typingStates` - Typing users by conversation
- `theme` - Theme settings (mode, accent)
- `onlineUserIds` - Set of online user IDs
- `notifications` - Notifications list
- `unreadCount` - Unread notifications count

### Actions
- User: `setCurrentUser`, `updateCurrentUser`, `clearCurrentUser`
- Friends: `setFriends`, `addFriend`, `removeFriend`, `updateFriend`
- Conversations: `setConversations`, `addConversation`, `updateConversation`, `removeConversation`, `setActiveConversationId`, `pinConversation`, `unpinConversation`, `markAsRead`
- Messages: `setMessages`, `addMessage`, `updateMessage`, `removeMessage`, `clearMessages`, `addReaction`, `removeReaction`
- Typing: `setTyping`, `clearTyping`, `getTypingUsers`
- Theme: `setThemeMode`, `setThemeAccent`, `toggleThemeMode`
- Online Users: `setOnlineUsers`, `addOnlineUser`, `removeOnlineUser`, `isUserOnline`
- Notifications: `setNotifications`, `addNotification`, `markNotificationAsRead`, `markAllAsRead`, `removeNotification`, `clearAllNotifications`
- Global: `resetStore`

---

## 🎯 Best Practices

1. **Use individual selectors** for single values - most optimized
2. **Use batch selectors** for related values
3. **Avoid selecting the entire state** - causes unnecessary rerenders
4. **Use `useStoreActions`** for multiple actions
5. **Prefer the pre-built selectors** over custom ones
6. **Keep slices small and focused** - one responsibility per slice
7. **Use TypeScript** - full type safety everywhere

---

## 🔧 Advanced: Direct Store Access

```tsx
import { getAppStore, subscribeToStore } from './store';

// Get store imperatively (outside React)
const store = getAppStore();
console.log(store.currentUser);

// Subscribe to changes (outside React)
const unsubscribe = subscribeToStore(
  (state) => state.theme,
  (theme) => {
    console.log('Theme changed:', theme);
  }
);

// Call actions imperatively
store.setThemeMode('dark');
store.addMessage('conv-1', { /* ... */ });
```

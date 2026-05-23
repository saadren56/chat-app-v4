# Refactoring Guide & Best Practices

## 📁 Cleaner Architecture

### Folder Structure
```
frontend/src/
├── features/           # Feature-based organization
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   ├── socket/
│   │   ├── SocketProvider.tsx
│   │   ├── SocketService.ts
│   │   └── index.ts
│   └── ...
├── components/         # Reusable components
│   ├── MessageBubble.tsx
│   ├── MessageInput.tsx
│   ├── ChatList.tsx
│   ├── ChatWindow.tsx
│   ├── Notifications.tsx
│   └── index.ts
├── store/             # Zustand store
│   ├── slices/
│   ├── types.ts
│   └── index.ts
├── shared/
│   ├── components/ui/  # Base UI components
│   ├── hooks/         # Custom hooks
│   ├── services/      # API services
│   ├── utils/         # Utility functions
│   └── types/         # Shared types
└── App.lazy.tsx       # Lazy-loaded app
```

---

## 🔄 Code Splitting & Lazy Loading

### Route-Based Splitting
```tsx
// App.lazy.tsx
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => 
  import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage }))
);

const ChatList = lazy(() => 
  import('./components/ChatList').then(m => ({ default: m.ChatList }))
);
```

### Component-Level Splitting
```tsx
// Heavy components split into chunks
const HeavyComponent = lazy(() => 
  import('./HeavyComponent')
);
```

### Suspense Fallback
```tsx
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

---

## 🪝 Reusable Hooks

### useQuery Hook (API Caching)
```typescript
import { useQuery } from './shared/hooks';

const {
  data,
  error,
  isLoading,
  isFetching,
  refetch,
  invalidate,
} = useQuery(
  'conversations',
  () => conversationApi.fetchAll(),
  {
    enabled: true,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: true,
  }
);
```

### Custom Hooks
```typescript
// useDebounce
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// useLocalStorage
const [theme, setTheme] = useLocalStorage('theme', 'dark');

// useMediaQuery
const isMobile = useMediaQuery('(max-width: 768px)');

// useOnClickOutside
useOnClickOutside(ref, () => setIsOpen(false));
```

---

## ⚡ Performance Optimization

### Memoization
```typescript
// Memoize expensive components
const MemoizedComponent = React.memo(Component);

// Memoize callbacks
const handleClick = useCallback(() => {
  // ...
}, [deps]);

// Memoize values
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### Virtual Lists
```tsx
import { FixedSizeList as List } from 'react-window';

const VirtualMessageList = ({ messages }) => (
  <List
    height={600}
    itemCount={messages.length}
    itemSize={100}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <MessageBubble message={messages[index]} />
      </div>
    )}
  </List>
);
```

### Debounce/Throttle
```typescript
// Debounce search
const handleSearch = useDebouncedCallback(
  (value) => searchMessages(value),
  300
);

// Throttle scroll
const handleScroll = useThrottledCallback(
  () => checkScrollPosition(),
  100
);
```

---

## 🔌 Socket.IO Optimization

### Reconnection Strategy
```typescript
// SocketService.ts
const config = {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.5,
};

// Exponential backoff: 1s, 2s, 4s, 8s, 16s, up to 30s
```

### Connection Status
```typescript
type ConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';
```

### Event Listeners
```typescript
// Clean up listeners
const unsubscribe = socketService.on('message:new', handleNewMessage);
// Later: unsubscribe();
```

---

## 🛡️ Security Improvements

### XSS Protection
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userInput);

// Never use dangerouslySetInnerHTML
```

### Secure Storage
```typescript
// Token storage
const apiClient = getApiClient();
apiClient.setToken(accessToken); // In memory
localStorage.setItem('refresh_token', refreshToken); // Persisted
```

### Input Validation
```typescript
// Validate all inputs
import { z } from 'zod';

const MessageSchema = z.object({
  content: z.string().min(1).max(2000),
  conversationId: z.string().uuid(),
});
```

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' ws: wss:;
">
```

---

## ✅ TypeScript Best Practices

### Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Definitions
```typescript
// No `any`!
// Good:
interface User {
  id: string;
  username: string;
}

// Bad:
const user: any = { ... };
```

### Generic Utilities
```typescript
type Maybe<T> = T | null | undefined;
type AsyncReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => Promise<infer R> ? R : any;
```

### Type Guards
```typescript
function isUser(user: unknown): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'username' in user
  );
}
```

---

## 🔧 Error Boundaries

### Usage
```tsx
<ErrorBoundary
  fallback={<CustomErrorUI />}
  onReset={() => resetState()}
>
  <YourComponent />
</ErrorBoundary>
```

### HOC
```tsx
const SafeComponent = withErrorBoundary(Component, {
  fallback: <ErrorFallback />
});
```

---

## 📊 Performance Monitoring

### Web Vitals
```typescript
import { reportWebVitals } from './utils/webVitals';

reportWebVitals(console.log);
```

### Error Tracking
```typescript
// Sentry example
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_DSN',
  environment: 'production',
});
```

---

## 🚀 Build & Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze
```

### Environment Variables
```env
# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=wss://socket.yourdomain.com
NODE_ENV=production
```

---

## 📋 Architecture Principles

1. **Single Responsibility Principle** - Each component/hook does one thing
2. **Open/Closed Principle** - Open for extension, closed for modification
3. **Dependency Inversion** - Depend on abstractions, not concretions
4. **Composition Over Inheritance** - Favor composition
5. **DRY** - Don't Repeat Yourself
6. **KISS** - Keep It Simple, Stupid
7. **YAGNI** - You Aren't Gonna Need It

---

## 🎯 Quick Wins

- [ ] Enable React strict mode
- [ ] Add ESLint strict rules
- [ ] Set up Prettier
- [ ] Add Husky pre-commit hooks
- [ ] Set up lint-staged
- [ ] Add type checking to CI
- [ ] Add bundle size checks
- [ ] Set up error tracking
- [ ] Add performance monitoring
- [ ] Set up automated tests

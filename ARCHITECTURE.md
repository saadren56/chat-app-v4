# CyberChat - Professional Realtime Chat Application Architecture

## 📁 Complete Project Structure

```
v4/
├── frontend/                          # React + Vite + TypeScript Client
│   ├── public/                        # Static assets
│   │   ├── fonts/                     # Custom fonts
│   │   ├── images/                    # Images, icons, logos
│   │   └── locales/                   # i18n translations
│   │
│   ├── src/
│   │   ├── app/                       # App root configuration
│   │   │   ├── App.tsx                # Main app component
│   │   │   ├── main.tsx               # Entry point
│   │   │   └── providers.tsx          # Context providers wrapper
│   │   │
│   │   ├── features/                   # Feature-based architecture (DOMAIN DRIVEN)
│   │   │   ├── auth/                   # Authentication feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   ├── RegisterForm.tsx
│   │   │   │   │   └── AuthModal.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useAuth.ts
│   │   │   │   │   └── useLogin.ts
│   │   │   │   ├── store/
│   │   │   │   │   └── useAuthStore.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── auth.types.ts
│   │   │   │   └── index.ts           # Public API
│   │   │   │
│   │   │   ├── chat/                   # Core chat feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── ChatWindow.tsx
│   │   │   │   │   ├── ChatHeader.tsx
│   │   │   │   │   ├── MessageBubble.tsx
│   │   │   │   │   ├── MessageList.tsx
│   │   │   │   │   ├── MessageInput.tsx
│   │   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   │   └── ReadReceipts.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useChat.ts
│   │   │   │   │   ├── useMessages.ts
│   │   │   │   │   └── useTyping.ts
│   │   │   │   ├── store/
│   │   │   │   │   └── useChatStore.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── chat.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── conversations/          # Conversations list feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── ConversationList.tsx
│   │   │   │   │   ├── ConversationItem.tsx
│   │   │   │   │   └── ConversationSearch.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useConversations.ts
│   │   │   │   │   └── useConversation.ts
│   │   │   │   ├── store/
│   │   │   │   │   └── useConversationStore.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── conversation.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── users/                   # Users/contacts feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── UserList.tsx
│   │   │   │   │   ├── UserCard.tsx
│   │   │   │   │   ├── UserProfile.tsx
│   │   │   │   │   └── UserStatus.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useUsers.ts
│   │   │   │   │   └── useUserPresence.ts
│   │   │   │   ├── store/
│   │   │   │   │   └── useUserStore.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── user.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── notifications/           # Notifications feature
│   │   │   │   ├── components/
│   │   │   │   │   ├── NotificationList.tsx
│   │   │   │   │   ├── NotificationToast.tsx
│   │   │   │   │   └── NotificationBadge.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useNotifications.ts
│   │   │   │   │   └── usePushNotifications.ts
│   │   │   │   ├── store/
│   │   │   │   │   └── useNotificationStore.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── notification.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── settings/               # Settings feature
│   │   │       ├── components/
│   │   │       │   ├── SettingsModal.tsx
│   │   │       │   ├── ThemeSettings.tsx
│   │   │       │   ├── PrivacySettings.tsx
│   │   │       │   └── NotificationSettings.tsx
│   │   │       ├── hooks/
│   │   │       │   └── useSettings.ts
│   │   │       ├── store/
│   │   │       │   └── useSettingsStore.ts
│   │   │       ├── types/
│   │   │       │   └── settings.types.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── shared/                     # SHARED RESOURCES (used across features)
│   │   │   ├── components/             # Reusable UI components
│   │   │   │   ├── ui/                 # Atomic UI primitives
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Textarea.tsx
│   │   │   │   │   ├── Avatar.tsx
│   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Dropdown.tsx
│   │   │   │   │   ├── Tooltip.tsx
│   │   │   │   │   ├── Skeleton.tsx
│   │   │   │   │   ├── Spinner.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Tabs.tsx
│   │   │   │   │   └── Switch.tsx
│   │   │   │   │
│   │   │   │   ├── layout/             # Layout components
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Container.tsx
│   │   │   │   │   └── ResponsiveWrapper.tsx
│   │   │   │   │
│   │   │   │   └── ThemeToggle.tsx
│   │   │   │
│   │   │   ├── hooks/                  # Global reusable hooks
│   │   │   │   ├── useLocalStorage.ts
│   │   │   │   ├── useDebounce.ts
│   │   │   │   ├── useOnClickOutside.ts
│   │   │   │   ├── useIntersectionObserver.ts
│   │   │   │   ├── useMediaQuery.ts
│   │   │   │   ├── useCopyToClipboard.ts
│   │   │   │   └── useInterval.ts
│   │   │   │
│   │   │   ├── services/               # Business logic services
│   │   │   │   ├── api/                # API layer
│   │   │   │   │   ├── client.ts       # Axios/fetch client
│   │   │   │   │   ├── endpoints.ts    # API endpoints
│   │   │   │   │   └── interceptors.ts # Request/response interceptors
│   │   │   │   │
│   │   │   │   ├── socket/             # Socket.IO layer
│   │   │   │   │   ├── client.ts       # Socket client instance
│   │   │   │   │   ├── events.ts       # Socket event constants
│   │   │   │   │   └── handlers.ts     # Socket event handlers
│   │   │   │   │
│   │   │   │   ├── storage/            # Storage service
│   │   │   │   │   ├── local.ts
│   │   │   │   │   └── session.ts
│   │   │   │   │
│   │   │   │   └── logger.ts           # Logging service
│   │   │   │
│   │   │   ├── store/                  # Global Zustand stores
│   │   │   │   ├── useThemeStore.ts
│   │   │   │   ├── useUIStore.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── utils/                  # Utility functions
│   │   │   │   ├── date.ts             # Date formatting utilities
│   │   │   │   ├── string.ts           # String manipulation
│   │   │   │   ├── validation.ts       # Validation functions
│   │   │   │   ├── format.ts           # Number/formatting utilities
│   │   │   │   ├── constants.ts        # App constants
│   │   │   │   └── helpers.ts          # Generic helpers
│   │   │   │
│   │   │   ├── styles/                 # Global styles
│   │   │   │   ├── index.css           # Tailwind imports + base styles
│   │   │   │   ├── globals.css         # Global CSS
│   │   │   │   └── themes/             # Theme definitions
│   │   │   │       ├── dark.css
│   │   │   │       └── light.css
│   │   │   │
│   │   │   └── types/                  # Global TypeScript types
│   │   │       ├── index.ts            # Global exports
│   │   │       ├── common.ts           # Common types
│   │   │       └── api.ts              # API response types
│   │   │
│   │   ├── pages/                      # Page components (for routing)
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   │
│   │   ├── routes/                     # Routing configuration
│   │   │   ├── index.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   └── routes.ts
│   │   │
│   │   ├── config/                     # Configuration files
│   │   │   ├── constants.ts
│   │   │   ├── environment.ts
│   │   │   └── features.ts
│   │   │
│   │   └── assets/                     # Imported assets
│   │       ├── icons/
│   │       ├── images/
│   │       └── animations/
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env
│   ├── .env.local
│   └── .env.production
│
└── backend/                         # Node.js + Express + Socket.IO Server
    ├── src/
    │   ├── index.ts                 # Entry point
    │   ├── config/                   # Configuration
    │   │   ├── database.ts
    │   │   ├── socket.ts
    │   │   ├── cors.ts
    │   │   └── environment.ts
    │   │
    │   ├── modules/                  # Feature-based modules
    │   │   ├── auth/                 # Auth module
    │   │   │   ├── auth.controller.ts
    │   │   │   ├── auth.routes.ts
    │   │   │   ├── auth.service.ts
    │   │   │   ├── auth.validation.ts
    │   │   │   └── auth.types.ts
    │   │   │
    │   │   ├── users/                # Users module
    │   │   │   ├── users.controller.ts
    │   │   │   ├── users.routes.ts
    │   │   │   ├── users.service.ts
    │   │   │   └── users.types.ts
    │   │   │
    │   │   ├── chat/                 # Chat module
    │   │   │   ├── chat.controller.ts
    │   │   │   ├── chat.routes.ts
    │   │   │   ├── chat.service.ts
    │   │   │   └── chat.types.ts
    │   │   │
    │   │   ├── messages/             # Messages module
    │   │   │   ├── messages.controller.ts
    │   │   │   ├── messages.routes.ts
    │   │   │   ├── messages.service.ts
    │   │   │   └── messages.types.ts
    │   │   │
    │   │   └── conversations/        # Conversations module
    │   │       ├── conversations.controller.ts
    │   │       ├── conversations.routes.ts
    │   │       ├── conversations.service.ts
    │   │       └── conversations.types.ts
    │   │
    │   ├── socket/                   # Socket.IO handlers
    │   │   ├── index.ts              # Socket server setup
    │   │   ├── handlers/
    │   │   │   ├── connection.handler.ts
    │   │   │   ├── message.handler.ts
    │   │   │   ├── typing.handler.ts
    │   │   │   ├── presence.handler.ts
    │   │   │   └── room.handler.ts
    │   │   ├── middleware/
    │   │   │   ├── auth.middleware.ts
    │   │   │   └── logger.middleware.ts
    │   │   └── events.ts             # Socket event constants
    │   │
    │   ├── database/                 # Database layer
    │   │   ├── index.ts              # DB connection
    │   │   ├── schema/
    │   │   │   ├── migrations.ts
    │   │   │   └── seed.ts
    │   │   └── repositories/
    │   │       ├── UserRepository.ts
    │   │       ├── MessageRepository.ts
    │   │       ├── ConversationRepository.ts
    │   │       └── RoomRepository.ts
    │   │
    │   ├── middleware/               # Express middleware
    │   │   ├── error.middleware.ts
    │   │   ├── auth.middleware.ts
    │   │   ├── rateLimit.middleware.ts
    │   │   └── validation.middleware.ts
    │   │
    │   ├── shared/                   # Shared utilities
    │   │   ├── utils/
    │   │   │   ├── logger.ts
    │   │   │   ├── response.ts
    │   │   │   ├── errors.ts
    │   │   │   └── helpers.ts
    │   │   ├── constants/
    │   │   │   └── index.ts
    │   │   └── types/
    │   │       └── index.ts
    │   │
    │   └── tests/                    # Tests
    │       ├── unit/
    │       ├── integration/
    │       └── e2e/
    │
    ├── prisma/                       # (if using Prisma ORM)
    │   └── schema.prisma
    │
    ├── package.json
    ├── tsconfig.json
    ├── .env
    ├── .env.local
    └── .env.production
```

---

## 📖 Architecture Explanation

### 🏗️ **Frontend Architecture Deep Dive**

#### **1. `/src/app/` - Application Root**
**Purpose:** The entry point and root configuration of the React application.

- **App.tsx** - Main application component that sets up routing, themes, and global providers.
- **main.tsx** - Renders the React app into the DOM.
- **providers.tsx** - Wraps the app with all context providers (Zustand, Socket, Theme, etc.).

**Why?** Single place to configure app-wide concerns without cluttering feature modules.

---

#### **2. `/src/features/` - Feature-Based Architecture**
**Purpose:** Domain-driven design where each feature is self-contained and independent.

**Core Principles:**
- Each feature owns its components, hooks, store, and types
- Features only expose a public API via `index.ts`
- Minimal cross-feature dependencies
- Easy to add/remove features without breaking the app

**Feature Structure (e.g., `/auth/`):**
```
features/auth/
├── components/       # Feature-specific UI components
├── hooks/           # Feature-specific custom hooks
├── store/           # Feature-specific Zustand store
├── types/           # Feature-specific TypeScript types
└── index.ts         # Public API (exports only what's needed)
```

**Why Feature-Based?**
- **Scalability:** Team can work on different features simultaneously
- **Maintainability:** Related code is colocated
- **Testability:** Features can be tested in isolation
- **Reusability:** Clear public API boundaries

---

#### **3. `/src/shared/` - Shared Resources**
**Purpose:** Reusable code that's used across multiple features.

**Subdirectories:**

##### **`/components/ui/` - Atomic UI Primitives**
Low-level, unstyled components that follow the [Radix UI](https://www.radix-ui.com/) pattern.

Examples:
- **Button.tsx** - Polymorphic button component
- **Input.tsx** - Accessible input field
- **Modal.tsx** - Accessible modal dialog
- **Avatar.tsx** - User avatar component
- **Tooltip.tsx** - Tooltip wrapper
- **Skeleton.tsx** - Loading skeleton
- **Spinner.tsx** - Loading indicator

**Why Atomic?**
- Single responsibility principle
- Highly composable
- Consistent behavior across the app
- Easy to theme and customize

##### **`/components/layout/` - Layout Components**
Higher-level layout components used across pages.

Examples:
- **Sidebar.tsx** - Reusable sidebar container
- **Header.tsx** - Page header component
- **Container.tsx** - Max-width content container
- **ResponsiveWrapper.tsx** - Mobile/desktop responsive wrapper

##### **`/hooks/` - Global Custom Hooks**
Generic hooks that can be used anywhere in the app.

Examples:
- **useLocalStorage.ts** - Persist state to localStorage
- **useDebounce.ts** - Debounce user input
- **useOnClickOutside.ts** - Detect clicks outside an element
- **useIntersectionObserver.ts** - Lazy loading & infinite scroll
- **useMediaQuery.ts** - Responsive breakpoints
- **useCopyToClipboard.ts** - Copy text to clipboard
- **useInterval.ts** - Repeated function execution

##### **`/services/` - Business Logic & External Communication**

**`/services/api/` - API Layer**
- **client.ts** - Configured Axios/fetch instance with base URL, headers, etc.
- **endpoints.ts** - Centralized API endpoint definitions
- **interceptors.ts** - Request/response interceptors for auth, error handling, etc.

**Why Centralized API?**
- Single source of truth for API calls
- Easy to add auth tokens, logging, error handling
- Consistent error handling across the app
- Easy to mock for testing

**`/services/socket/` - Socket.IO Layer**
- **client.ts** - Singleton Socket.IO client instance
- **events.ts** - Type-safe event constants
- **handlers.ts** - Socket event handler registration

**Why?**
- Single socket connection managed app-wide
- Type-safe event emissions and listeners
- Easy to add authentication, reconnection logic

**`/services/storage/` - Storage Abstraction**
- **local.ts** - LocalStorage wrapper
- **session.ts** - SessionStorage wrapper

**Why?**
- Consistent API for storage operations
- Easy to add encryption, compression, etc.
- Easy to swap implementations

##### **`/store/` - Global Zustand Stores**
Stores that are truly global and used across many features.

- **useThemeStore.ts** - Dark/light theme management
- **useUIStore.ts** - Global UI state (sidebar open, modals, etc.)

**Why Global?** Theme and UI state are needed everywhere.

##### **`/utils/` - Pure Utility Functions**
Small, pure, well-tested utility functions.

Examples:
- **date.ts** - Date formatting, relative time (e.g., "2 minutes ago")
- **string.ts** - Truncation, capitalization, sanitization
- **validation.ts** - Email validation, password strength, etc.
- **format.ts** - Number formatting, file size, currency
- **constants.ts** - App constants (API URLs, limits, regex patterns)
- **helpers.ts** - Generic helper functions

**Why Pure Functions?**
- Easy to test
- No side effects
- Predictable behavior

##### **`/styles/` - Global Styles**
- **index.css** - Tailwind directives, base styles
- **globals.css** - Global CSS resets, font imports
- **themes/** - CSS variables for dark/light themes

##### **`/types/` - Global TypeScript Types**
- **common.ts** - Generic types (Pagination, Response, etc.)
- **api.ts** - API request/response types
- **index.ts** - Central export file

---

#### **4. `/src/pages/` - Page Components**
**Purpose:** Top-level route components that compose features together.

Examples:
- **LoginPage.tsx** - Composes auth feature components
- **ChatPage.tsx** - Composes chat, conversations, and sidebar
- **SettingsPage.tsx** - Composes settings feature

**Why?** Pages keep feature composition separate from feature implementation.

---

#### **5. `/src/routes/` - Routing Configuration**
- **index.tsx** - React Router configuration
- **PrivateRoute.tsx** - Protected route wrapper
- **routes.ts** - Route definition constants

---

#### **6. `/src/config/` - App Configuration**
- **constants.ts** - Build-time constants
- **environment.ts** - Environment variables (type-safe!)
- **features.ts** - Feature flags configuration

---

### 🔧 **Backend Architecture Deep Dive**

#### **1. `/src/modules/` - Feature Modules**
Each feature has its own module with:
- **controller.ts** - Request handlers
- **routes.ts** - Route definitions
- **service.ts** - Business logic
- **validation.ts** - Request validation schemas
- **types.ts** - Module-specific types

---

#### **2. `/src/socket/` - Socket.IO Layer**
- **handlers/** - Individual event handlers
- **middleware/** - Socket middleware (auth, logging)
- **events.ts** - Event constants

---

#### **3. `/src/database/` - Data Access Layer**
- **repositories/** - Repository pattern for data access
- **schema/** - Migrations and seed data

---

#### **4. `/src/middleware/` - Express Middleware**
- Error handling, authentication, rate limiting, validation

---

## 🎯 **Key Architectural Decisions**

### **Feature-Based vs Layered Architecture**
We chose **Feature-Based Architecture** because:
- ✅ Better for large teams and scaling
- ✅ Faster onboarding - devs can work in one folder
- ✅ Clear boundaries - features are independent
- ✅ Easier to delete or rewrite features
- ✅ Better separation of concerns

### **Zustand for State Management**
- Lightweight compared to Redux
- Simple API with hooks
- No boilerplate
- Built-in persistence middleware

### **Atomic Design for Components**
UI components follow Atomic Design principles:
- **Atoms:** Buttons, Inputs, Avatars
- **Molecules:** Form fields, Search bars
- **Organisms:** Chat windows, Sidebars
- **Templates:** Page layouts
- **Pages:** Actual page content

### **Repository Pattern (Backend)**
- Abstracts database operations
- Easy to switch databases later
- Centralized query logic
- Better testability

---

## 🚀 **Getting Started**

### **Frontend Development**
```bash
cd frontend
npm install
npm run dev
```

### **Backend Development**
```bash
cd backend
npm install
npm run dev
```

---

## 📋 **Best Practices Followed**

1. **Colocation:** Related code lives together
2. **Public API:** Each feature exposes only what's necessary
3. **Type Safety:** Full TypeScript coverage
4. **Single Responsibility:** Each file does one thing
5. **Dependency Inversion:** Features depend on abstractions
6. **Testability:** Easy to unit test components and hooks
7. **Accessibility:** ARIA labels, keyboard navigation
8. **Performance:** Code splitting, lazy loading, memoization
9. **Error Handling:** Graceful error states and fallbacks
10. **Documentation:** Clear, professional explanations

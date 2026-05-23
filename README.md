# CyberChat - Modern Realtime Chat Application

A production-ready realtime chat application with a modern luxury cyber aesthetic.

## Tech Stack

### Frontend
- **Vite** - Lightning-fast build tool
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icon set
- **Zustand** - Simple state management

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Realtime communication
- **better-sqlite3** - SQLite database

## Installation

### 1. Clone the repository and navigate to the project directory

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

## Running the Application

### Start the Backend Server

In the `backend` directory:

```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Start the Frontend Development Server

In the `frontend` directory:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Folder Structure

### Backend Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point - server setup
│   ├── db/
│   │   ├── index.ts          # Database initialization
│   │   └── queries.ts        # Database queries and types
│   └── socket/
│       └── index.ts          # Socket.IO event handlers
├── package.json
├── tsconfig.json
└── chat.db                   # SQLite database (auto-created)
```

### Frontend Structure

```
frontend/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main App component
│   ├── index.css             # Global styles with Tailwind
│   ├── types.ts              # TypeScript interfaces
│   ├── components/
│   │   ├── LoginForm.tsx     # Login screen component
│   │   ├── ChatRoom.tsx      # Main chat container
│   │   ├── Sidebar.tsx       # Room list sidebar
│   │   ├── ChatHeader.tsx    # Chat header with room info
│   │   ├── MessageList.tsx   # Message container
│   │   ├── MessageItem.tsx   # Individual message
│   │   ├── MessageInput.tsx  # Message input field
│   │   ├── TypingIndicator.tsx # Typing indicator
│   │   └── ThemeToggle.tsx   # Dark/light mode toggle
│   ├── hooks/
│   │   └── useSocket.ts      # Socket.IO hook
│   └── store/
│       ├── useChatStore.ts   # Zustand chat state
│       └── useThemeStore.ts  # Zustand theme state
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Features

- ✅ Realtime messaging with Socket.IO
- ✅ Multiple chat rooms
- ✅ Dark/light mode with persistence
- ✅ Typing indicators
- ✅ Smooth animations with Framer Motion
- ✅ Glassmorphism UI design
- ✅ Neon cyberpunk aesthetic
- ✅ Responsive layout
- ✅ Reusable components
- ✅ Type-safe with TypeScript
- ✅ SQLite database for message persistence

## Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## Key Technologies Explained

### Zustand Store
- `useChatStore`: Manages chat state (messages, rooms, user, typing status)
- `useThemeStore`: Manages dark/light theme with local storage persistence

### Socket.IO Events
- `join_room`: User joins a chat room
- `send_message`: Send a new message
- `typing` / `stop_typing`: Typing indicators
- `new_message`: Broadcast new message to room
- `room_data`: Initial room data on join

### Database Schema
- **users**: Stores user information
- **messages**: Stores chat messages with user references
- **rooms**: Stores chat room information

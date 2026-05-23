import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { ProtectedRoute, PublicRoute } from './features/auth';
import { SocketProvider } from './features/socket';

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      <p className="text-gray-400 animate-pulse">Loading...</p>
    </div>
  </div>
);

const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ChatList = lazy(() => import('./components/ChatList').then(m => ({ default: m.ChatList })));
const ChatWindow = lazy(() => import('./components/ChatWindow').then(m => ({ default: m.ChatWindow })));

const ChatPage = () => (
  <div className="flex h-screen bg-gray-900">
    <div className="w-96 flex-shrink-0 border-r border-gray-700/50">
      <ChatList />
    </div>
    <div className="flex-1">
      <ChatWindow />
    </div>
  </div>
);

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SocketProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </SocketProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

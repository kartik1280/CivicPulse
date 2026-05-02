// src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-load all pages
const Login     = lazy(() => import('./pages/Login'));
const Signup    = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Rooms     = lazy(() => import('./pages/Rooms'));
const ChatRoom  = lazy(() => import('./pages/ChatRoom'));
const NotFound  = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      <p className="text-surface-400 text-sm">Loading…</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/rooms"     element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
          <Route path="/rooms/:roomId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

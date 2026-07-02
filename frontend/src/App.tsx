import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useStore } from './app/store';
import { AppLayout } from './app/AppLayout';

// Pages
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Overview from './features/overview/Overview';
import Habits from './features/habits/Habits';
import Goals from './features/goals/Goals';
import Applications from './features/applications/Applications';
import Topics from './features/topics/Topics';
import LandingPage from './features/landing/LandingPage';
import Profile from './features/profile/Profile';
import ResetPassword from './features/auth/ResetPassword';
import VerifyEmail from './features/auth/VerifyEmail';

// Initialize TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useStore((state) => state.token);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

// Public Route Wrapper (Redirects to Overview if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useStore((state) => state.token);
  
  if (token) {
    return <Navigate to="/overview" replace />;
  }

  return <>{children}</>;
};

// 404 Not Found Page
const NotFound = () => {
  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
        <h1 className="text-6xl font-black text-primary-blue leading-none">404</h1>
        <h2 className="text-lg font-semibold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-sm text-gray-400 mt-2">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/overview">
          <button className="mt-6 bg-primary-blue hover:bg-primary-blue-hover text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors cursor-pointer w-full">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicRoute>
                <VerifyEmail />
              </PublicRoute>
            }
          />

          {/* Public Landing Page Route */}
          <Route
            path="/"
            element={<LandingPage />}
          />
          <Route
            path="/overview"
            element={
              <ProtectedRoute>
                <Overview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/habits"
            element={
              <ProtectedRoute>
                <Habits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics"
            element={
              <ProtectedRoute>
                <Topics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

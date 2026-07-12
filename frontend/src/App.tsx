import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import NotFound from './components/NotFound';

import { Logo } from './components/ui/Logo';

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

// NotFound is imported from components

function App() {
  const [isAppLoading, setAppLoading] = React.useState(true);
  const [isAppUnmounted, setAppUnmounted] = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState(0);

  React.useEffect(() => {
    // Start filling up progress bar immediately
    const progressTimer = setTimeout(() => {
      setLoadingProgress(100);
    }, 80);

    // Start fading out after 1000ms
    const fadeTimer = setTimeout(() => {
      setAppLoading(false);
    }, 1000);

    // Completely unmount after 1500ms (allowing 500ms transition to finish)
    const unmountTimer = setTimeout(() => {
      setAppUnmounted(true);
    }, 1500);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        
        {/* Hardware-Accelerated Fade-Out Splash Screen */}
        {!isAppUnmounted && (
          <div className={`fixed inset-0 z-[9999] bg-canvas-bg dark:bg-slate-950 flex flex-col items-center justify-center select-none text-center px-6 transition-opacity duration-500 ease-out overflow-hidden ${!isAppLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80" />
            
            {/* Glowing Ambient Color Blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-500/10 dark:bg-violet-600/10 blur-[100px] animate-pulse [animation-duration:8s]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 dark:bg-indigo-600/5 blur-[100px] animate-pulse [animation-duration:10s] [animation-delay:2s]" />

            {/* Floating content wrapper */}
            <div className="relative z-10 flex flex-col items-center max-w-sm w-full animate-scale-up">
              
              <div className="relative mb-8 mt-2">
                {/* Floating Shadow base */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 opacity-20 blur-xl animate-pulse" />
                
                {/* Outer counter-rotating ring */}
                <div className="absolute -inset-3.5 rounded-full border border-transparent border-t-violet-400/40 border-l-violet-400/40 animate-spin [animation-duration:3s]" style={{ animationDirection: 'reverse' }} />
                
                {/* Inner spinner ring */}
                <div className="absolute -inset-1.5 rounded-full border-2 border-transparent border-r-violet-500 border-b-violet-500 animate-spin [animation-duration:1.2s]" />
                
                {/* Branded spinner container */}
                <div className="relative w-20 h-20 flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-150/80 dark:border-gray-800 rounded-full shadow-lg">
                  <Logo showText={false} />
                </div>
              </div>
              
              {/* Logo text with official gradient theme matching logo chevrons */}
              <h1 className="text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight leading-none mt-2 drop-shadow-sm select-none">
                Disciplin
              </h1>
              
              {/* Tagline: focus. consistency. growth. */}
              <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 dark:text-gray-500 mt-3.5 select-none uppercase">
                focus. consistency. <span className="text-violet-500 dark:text-violet-400 font-extrabold">growth.</span>
              </p>

              {/* Custom animated progress bar with glow */}
              <div className="w-40 h-1.5 bg-gray-150 dark:bg-gray-800/80 rounded-full mt-6 overflow-hidden shadow-inner relative">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
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

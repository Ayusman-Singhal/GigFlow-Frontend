import { useAuth } from '@clerk/clerk-react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthUser } from './hooks/useAuthUser';
import { useApiClient } from './hooks/useApiClient';
import { useSocket } from './hooks/useSocket';
import { Navbar } from './components/ui/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import GigCreate from './pages/GigCreate';
import GigDetail from './pages/GigDetail';
import GigFeed from './pages/GigFeed';
import Login from './pages/Login';
import Register from './pages/Register';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <p className="text-sm font-medium text-slate-600">Loading session...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { isLoaded } = useAuthUser();
  const { isLoaded: apiLoaded } = useApiClient();
  const location = useLocation();

  // Initialize socket connection for real-time notifications
  useSocket();

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!isLoaded || !apiLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm font-medium text-zinc-400">Loading session...</p>
      </div>
    );
  }

  // Pages that don't need the container wrapper
  const fullWidthPages = ['/', '/login', '/register'];
  const isFullWidth = fullWidthPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50">
      <Navbar />

      {isFullWidth ? (
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 pt-24 pb-10">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-[0_10px_50px_-25px_rgba(0,0,0,0.6)] backdrop-blur">
            <Routes>
              <Route path="/gigs" element={<GigFeed />} />
              <Route
                path="/gigs/new"
                element={(
                  <ProtectedRoute>
                    <GigCreate />
                  </ProtectedRoute>
                )}
              />
              <Route path="/gigs/:id" element={<GigDetail />} />
              <Route
                path="/dashboard"
                element={(
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/dashboard/bids"
                element={(
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                )}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;

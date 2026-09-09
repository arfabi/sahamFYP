import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import { getCurrentUser, signOut, clearMasterSession, type AuthUser } from './services/auth';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (authUser: AuthUser) => {
    setUser(authUser);
  };

  const handleLogout = async () => {
    // Clear Supabase session (remote) if any
    try {
      await signOut();
    } catch {
      // ignore - daemon session no need sign out
    }
    // Clear master/local session
    clearMasterSession();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl block mb-4 animate-bounce">📰</span>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
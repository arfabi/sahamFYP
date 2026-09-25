import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { getCurrentUser, signOut, clearMasterSession, storeMasterSession, DEMO_CREDENTIALS, type AuthUser } from './services/auth';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');

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

  const handleEnterDemo = () => {
    const demoUser: AuthUser = {
      id: 'admin-user-id',
      email: DEMO_CREDENTIALS.email,
      role: 'admin',
    };
    storeMasterSession(demoUser);
    setUser(demoUser);
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
    setAuthView('landing');
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

  return (
    <BrowserRouter>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : authView === 'login' ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={() => setAuthView('landing')}
        />
      ) : (
        <LandingPage
          onGoToLogin={() => setAuthView('login')}
          onEnterDemo={handleEnterDemo}
        />
      )}
    </BrowserRouter>
  );
}
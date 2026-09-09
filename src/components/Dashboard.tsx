// ============================================================
// Dashboard Layout - Main dashboard with sidebar navigation
// ============================================================

import React, { useState } from 'react';
import Overview from './Overview';
import Settings from './Settings';
import ContentGenerator from './ContentGenerator';
import ScheduledPosts from './ScheduledPosts';
import PublishedPosts from './PublishedPosts';
import MediaLibrary from './MediaLibrary';
import Analytics from './Analytics';
import TemplatesPage from './TemplatesPage';
import ManualEditor from './ManualEditor';
import type { AuthUser } from '../services/auth';

type DashboardPage = 'overview' | 'generator' | 'scheduled' | 'published' | 'media' | 'analytics' | 'settings' | 'templates' | 'manual';

interface NavItem {
  id: DashboardPage;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'generator', label: 'Content Generator', icon: '📝' },
  { id: 'manual', label: 'Manual Editor', icon: '✏️' },
  { id: 'scheduled', label: 'Scheduled Posts', icon: '📅' },
  { id: 'published', label: 'Published Posts', icon: '✅' },
  { id: 'media', label: 'Media Library', icon: '🖼️' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'templates', label: 'Templates', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activePage, setActivePage] = useState<DashboardPage>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview onNavigate={(p) => setActivePage(p as DashboardPage)} />;
      case 'generator':
        return <ContentGenerator />;
      case 'manual':
        return <ManualEditor />;
      case 'scheduled':
        return <ScheduledPosts />;
      case 'published':
        return <PublishedPosts />;
      case 'media':
        return <MediaLibrary />;
      case 'analytics':
        return <Analytics />;
      case 'templates':
        return <TemplatesPage />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview onNavigate={(p) => setActivePage(p as DashboardPage)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-bold">📰 SahamFYP</h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-700 transition"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
                activePage === item.id
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {!sidebarCollapsed && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.email}</p>
                  <p className="text-xs text-slate-400">{user.role}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition flex items-center justify-center gap-2"
              >
                🚪 Logout
              </button>
              <p className="text-xs text-slate-500 text-center mt-3">v1.0.0 — SahamFYP</p>
            </>
          )}
          {sidebarCollapsed && (
            <button
              onClick={onLogout}
              className="w-full p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition text-center"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
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
    <div className="h-screen bg-slate-50 flex overflow-hidden">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar - persistent di semua modul/menu */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="text-base">{NAV_ITEMS.find((n) => n.id === activePage)?.icon || '📄'}</span>
              <span>{NAV_ITEMS.find((n) => n.id === activePage)?.label || 'Pages'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-xs text-slate-500">
                  <p className="font-medium text-slate-700 truncate">{user.email}</p>
                  <p className="text-slate-400">{user.role}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                title="Logout"
              >
                🚪 <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
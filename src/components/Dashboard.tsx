// ============================================================
// Dashboard Layout - Grouped navigation with real URL slugs
// React Router DOM v6 integration (/news, /marketbrief, /post)
// ============================================================

import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Overview from './Overview';
import ContentGenerator from './ContentGenerator';
import ManualEditor from './ManualEditor';
import NewsMonitoring from './NewsMonitoring';
import UnifiedMarketBrief from './UnifiedMarketBrief';
import StockDetailPage from './StockDetailPage';
import NewsDetailPage from './NewsDetailPage';
import Posts from './Posts';
import PostDetailPage from './PostDetailPage';
import Channels from './Channels';

import type { AuthUser } from '../services/auth';

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: string;
  badge?: 'soon' | 'beta';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'HOME',
    items: [
      { id: 'overview', path: '/overview', label: 'Dashboard Overview', icon: '📊' },
    ],
  },
  {
    label: 'SOURCES',
    items: [
      { id: 'news', path: '/news', label: 'News Monitoring', icon: '📡' },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { id: 'marketbrief', path: '/marketbrief', label: 'Market Brief', icon: '⚡' },
    ],
  },
  {
    label: 'PUBLISHING',
    items: [
      { id: 'accounts', path: '/accounts', label: 'Accounts', icon: '🔗' },
      { id: 'posts', path: '/post', label: 'Posts', icon: '🗂️' },
    ],
  },
];

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveItem = () => {
    const p = location.pathname;
    for (const g of NAV_GROUPS) {
      for (const item of g.items) {
        if (p === item.path || (item.path !== '/overview' && p.startsWith(item.path))) {
          return item;
        }
      }
    }
    return NAV_GROUPS[0].items[0];
  };

  const activeItem = getActiveItem();

  return (
    <div className="h-screen bg-[#0a060c] text-slate-100 flex overflow-hidden font-sans selection:bg-rose-500 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d070f] border-r border-[#251323] text-slate-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-[#251323]">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-sahamfyp.png"
              alt="SahamFYP Logo"
              className="w-8 h-8 rounded-full object-cover shadow-md shadow-rose-500/20 border border-rose-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">SahamFYP</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Engine
                </span>
              </div>
              <p className="text-[10px] text-rose-200/50 -mt-0.5">Monitoring & Automation</p>
            </div>
          </div>
        </div>

        {/* Navigation — clean fixed navigation */}
        <nav className="flex-1 overflow-y-auto space-y-5 p-3 scrollbar-thin scrollbar-thumb-[#251323]">
          {NAV_GROUPS.map((group) => {
            return (
              <div key={group.label} className="space-y-1">
                <div className="px-3 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300/50">
                    {group.label}
                  </span>
                </div>
                {group.items.map((item) => {
                  const disabled = item.badge === 'soon';
                  const active =
                    location.pathname === item.path ||
                    (item.path !== '/overview' && location.pathname.startsWith(item.path));

                  return (
                    <button
                      key={item.id}
                      onClick={() => (disabled ? undefined : navigate(item.path))}
                      disabled={disabled}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-xl font-medium transition cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-rose-500/20 via-orange-500/15 to-transparent text-white border border-rose-500/40 shadow-sm shadow-rose-500/10 font-bold'
                          : disabled
                          ? 'text-slate-600 cursor-not-allowed opacity-50'
                          : 'text-slate-400 hover:bg-[#170c18] hover:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.badge === 'beta' && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10">
                            BETA
                          </span>
                        )}
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500 animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0a060c]">
        {/* Topbar - persistent di semua modul/menu */}
        <header className="bg-[#0a060c]/85 backdrop-blur-md border-b border-[#251323] sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{activeItem?.icon || '📄'}</span>
              <span className="text-sm font-bold text-white tracking-wide">
                {activeItem?.label || 'Dashboard'}
              </span>
              <span className="text-xs text-rose-300/40 hidden sm:inline">• SahamFYP Autonomous OS</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#120914] border border-[#251323]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-rose-500/20">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-xs">
                  <p className="font-semibold text-slate-200 truncate max-w-[150px]">{user.email}</p>
                  <p className="text-[10px] text-rose-300/70 font-mono uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-[#170c18] hover:bg-rose-500/15 border border-[#33182f] hover:border-rose-500/40 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
                title="Logout"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview onNavigate={(p) => navigate(`/${p}`)} />} />
            
            {/* News Routes */}
            <Route path="/news" element={<NewsMonitoring />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />

            {/* Market Brief & Watchlist Routes (Unified) */}
            <Route path="/marketbrief" element={<UnifiedMarketBrief />} />
            <Route path="/marketbrief/:id" element={<StockDetailPage />} />

            {/* Posts Routes */}
            <Route path="/post" element={<Posts onNavigate={(p) => navigate(`/${p}`)} />} />
            <Route path="/post/detail/:id" element={<PostDetailPage />} />

            {/* Content Pipeline */}
            <Route path="/generator" element={<ContentGenerator />} />
            <Route path="/manual" element={<ManualEditor />} />
            <Route path="/accounts" element={<Channels onNavigate={(p) => navigate(`/${p}`)} />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

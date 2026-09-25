// ============================================================
// Dashboard Layout - Grouped navigation (content pipeline)
// SOURCES -> ANALYSIS -> CREATE -> PUBLISHING (+ Settings utility)
// ============================================================

import React, { useState } from 'react';
import Overview from './Overview';
import ContentGenerator from './ContentGenerator';
import ManualEditor from './ManualEditor';
import NewsMonitoring from './NewsMonitoring';
import DailyMarketBrief from './DailyMarketBrief';
import StockWatchlist from './StockWatchlist';
import Posts from './Posts';
import Channels from './Channels';

import type { AuthUser } from '../services/auth';

export type DashboardPage =
  | 'overview'
  | 'news-monitoring'
  | 'daily-market-brief'
  | 'stock-watchlist'
  | 'generator'
  | 'manual'
  | 'accounts'
  | 'posts';

interface NavItem {
  id: DashboardPage;
  label: string;
  icon: string;
  /** 'soon' = non-interactive; 'beta' = shows a badge */
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
      { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    ],
  },
  { label: 'SOURCES', items: [{ id: 'news-monitoring', label: 'News Monitoring', icon: '📡' }] },
  {
    label: 'ANALYSIS',
    items: [
      { id: 'daily-market-brief', label: 'Market Brief', icon: '📈' },
      { id: 'stock-watchlist', label: 'Stock Watchlist', icon: '👁️' },
    ],
  },
  {
    label: 'PUBLISHING',
    items: [
      { id: 'accounts', label: 'Accounts', icon: '🔗' },
      { id: 'posts', label: 'Posts', icon: '🗂️' },
    ],
  },
];

function findNavItem(id?: string): NavItem | undefined {
  if (!id) return undefined;
  for (const g of NAV_GROUPS) {
    const found = g.items.find((i) => i.id === id);
    if (found) return found;
  }
  return undefined;
}

interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activePage, setActivePage] = useState<DashboardPage>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (label: string) =>
    setOpenGroups((o) => ({ ...o, [label]: !o[label] }));

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview onNavigate={(p) => setActivePage(p as DashboardPage)} />;
      case 'news-monitoring':
        return <NewsMonitoring />;
      case 'daily-market-brief':
        return <DailyMarketBrief />;
      case 'stock-watchlist':
        return <StockWatchlist />;
      case 'generator':
        return <ContentGenerator />;
      case 'manual':
        return <ManualEditor />;
      case 'accounts':
        return <Channels onNavigate={(p) => setActivePage(p as DashboardPage)} />;
      case 'posts':
        return <Posts onNavigate={(p) => setActivePage(p as DashboardPage)} />;
      default:
        return <Overview onNavigate={(p) => setActivePage(p as DashboardPage)} />;
    }
  };

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
                  const active = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => (disabled ? undefined : setActivePage(item.id))}
                      disabled={disabled}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-xl font-medium transition ${
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
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0a060c]">
        {/* Topbar - persistent di semua modul/menu */}
        <header className="bg-[#0a060c]/85 backdrop-blur-md border-b border-[#251323] sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{findNavItem(activePage)?.icon || '📄'}</span>
              <span className="text-sm font-bold text-white tracking-wide">
                {findNavItem(activePage)?.label || 'Pages'}
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
                className="px-3 py-1.5 bg-[#170c18] hover:bg-rose-500/15 border border-[#33182f] hover:border-rose-500/40 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 shadow-xs"
                title="Logout"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">{renderPage()}</div>
      </main>
    </div>
  );
}

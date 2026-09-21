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
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-lg font-bold flex items-center gap-2.5">
            <img src="/logo-sahamfyp.png" alt="SahamFYP Logo" className="w-7 h-7 rounded-full object-cover shadow-sm" />
            <span>SahamFYP</span>
          </h1>
        </div>

        {/* Navigation — clean fixed navigation */}
        <nav className="flex-1 overflow-y-auto space-y-6 p-3">
          {NAV_GROUPS.map((group) => {
            return (
              <div key={group.label} className="space-y-1">
                <div className="px-3 py-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
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
                      className={`flex w-full items-center justify-between px-3 py-2 text-sm rounded-xl font-medium transition ${
                        active
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : disabled
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar - persistent di semua modul/menu */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="text-base">{findNavItem(activePage)?.icon || '📄'}</span>
              <span>{findNavItem(activePage)?.label || 'Pages'}</span>
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

        <div className="p-6">{renderPage()}</div>
      </main>
    </div>
  );
}

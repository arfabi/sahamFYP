// ============================================================
// Dashboard Layout - Main dashboard with sidebar navigation
// ============================================================

import React, { useState } from 'react';
import Overview from './Overview';
import Settings from './Settings';
import ContentGenerator from './ContentGenerator';
import MediaLibrary from './MediaLibrary';
import Analytics from './Analytics';
import TemplatesPage from './TemplatesPage';
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
  | 'templates'
  | 'scheduled' // rendered by <Posts/> wrapper (tab: Scheduled)
  | 'published' // rendered by <Posts/> wrapper (tab: Published)
  | 'media'
  | 'channels'
  | 'analytics'
  | 'settings';

interface NavItem {
  id: DashboardPage;
  label: string;
  icon: string;
  /** 'beta' shows a badge; 'soon' items are non-interactive in the sidebar */
  badge?: 'soon' | 'beta';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Grouped navigation mirroring the content pipeline:
 *   SOURCES -> ANALYSIS -> CREATE -> DISTRIBUTE -> CHANNELS
 * `Settings` is a utility page — rendered outside groups, pinned at the
 * bottom of the sidebar (see UTILITY_PAGES).
 */
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'SOURCES',
    items: [{ id: 'news-monitoring', label: 'News Monitoring', icon: '📡' }],
  },
  {
    label: 'ANALYSIS',
    items: [
      { id: 'daily-market-brief', label: 'Market Brief', icon: '📈' },
      { id: 'stock-watchlist', label: 'Stock Watchlist', icon: '👁️' },
    ],
  },
  {
    label: 'CREATE',
    items: [
      { id: 'generator', label: 'Content Generator', icon: '📝' },
      { id: 'manual', label: 'Manual Editor', icon: '✏️' },
      { id: 'templates', label: 'Templates', icon: '📋' },
    ],
  },
  {
    label: 'DISTRIBUTE',
    items: [
      { id: 'scheduled', label: 'Posts', icon: '🗂️' },
      { id: 'media', label: 'Media Library', icon: '🖼️' },
    ],
  },
  {
    label: 'CHANNELS',
    items: [
      { id: 'channels', label: 'Channels & Connections', icon: '🔗' },
      { id: 'analytics', label: 'Analytics', icon: '📈' },
    ],
  },
];

const UTILITY_PAGES: NavItem[] = [
  { id: 'settings' as DashboardPage, label: 'Settings', icon: '⚙️' },
];

/** Flat lookup for the topbar breadcrumb (scans groups then utility pages). */
function findNavItem(id?: string): NavItem | undefined {
  if (!id) return undefined;
  for (const g of NAV_GROUPS) {
    const found = g.items.find((i) => i.id === id);
    if (found) return found;
  }
  return UTILITY_PAGES.find((i) => i.id === id);
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
      case 'generator':
        return <ContentGenerator />;
      case 'manual':
        return <ManualEditor />;
            case 'scheduled':
        return <Posts defaultTab="scheduled" />;
      case 'published':
        return <Posts defaultTab="published" />;
      case 'stock-watchlist':
        return <StockWatchlist />;
      case 'channels':
        return <Channels onNavigate={(p) => setActivePage(p as DashboardPage)} />;
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

                {/* Navigation — grouped, collapsible per section */}
        <nav className="flex-1 overflow-y-auto space-y-6 p-3">
          {NAV_GROUPS.map((group) => {
            const isExpanded = openGroups[group.label] ?? true;
            const isActive = group.items.some((i) => i.id === activePage);
            const showItems = isExpanded || isActive;
            return (
              <div key={group.label} className="space-y-1">
                {!sidebarCollapsed && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className="flex w-full items-center justify-between px-3 text-left"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {group.label}
                    </span>
                    <span className="text-xs text-slate-500 transition-transform">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </button>
                )}
                {showItems &&
                  group.items.map((item) => {
                    const disabled = item.badge === 'soon';
                    const active = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => (disabled ? undefined : setActivePage(item.id))}
                        disabled={disabled}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
                          disabled
                            ? 'cursor-not-allowed opacity-60'
                            : active
                            ? 'bg-amber-500 text-white'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {!sidebarCollapsed && (
                          <span className="text-sm font-medium flex items-center gap-1.5">
                            {item.label}
                            {item.badge === 'beta' && (
                              <span className="px-1.5 py-0.25 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded">
                                Beta
                              </span>
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            );
          })}

          {/* Utility pages pinned at the bottom (Settings) */}
          <div className="pt-2 border-t border-slate-700 space-y-1">
            {UTILITY_PAGES.map((item) => (
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
          </div>
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

        <div className="p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
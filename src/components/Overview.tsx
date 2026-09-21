import React, { useState, useEffect } from 'react';
import { isReplizConfigured } from '../services/repliz';
import { supabase } from '../services/supabase';

interface OverviewProps {
  onNavigate: (page: string) => void;
}

interface ServiceInfo {
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  details: string;
  color: string;
}

export default function Overview({ onNavigate }: OverviewProps) {
  const [replizConnected, setReplizConnected] = useState(false);
  const [statsData, setStatsData] = useState({
    totalNews: 0,
    totalBriefs: 0,
    totalPosts: 0,
    autoPosts: 0,
    manualPosts: 0,
    watchlistToday: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    setReplizConnected(isReplizConfigured());
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [newsRes, briefRes, manualPostsRes, autoPostsRes, watchRes] = await Promise.all([
        supabase.from('sector_trigger_news').select('id', { count: 'exact', head: true }),
        supabase.from('sector_trigger_logs').select('id', { count: 'exact', head: true }),
        supabase.from('generated_posts').select('id', { count: 'exact', head: true }),
        supabase.from('automation_posts').select('id', { count: 'exact', head: true }),
        supabase.from('sector_trigger_candidates').select('id', { count: 'exact', head: true }).gte('created_at', `${todayStr}T00:00:00`),
      ]);

      const manualCount = manualPostsRes.count || 0;
      const autoCount = autoPostsRes.count || 0;

      setStatsData({
        totalNews: newsRes.count || 0,
        totalBriefs: briefRes.count || 0,
        totalPosts: manualCount + autoCount,
        autoPosts: autoCount,
        manualPosts: manualCount,
        watchlistToday: watchRes.count || 0,
      });
    } catch (e) {
      console.error('Failed to load Overview stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const stats = [
    { label: 'Total Berita', value: loadingStats ? '...' : statsData.totalNews, icon: '📡', color: 'bg-blue-50 text-blue-600', page: 'news-monitoring' },
    { label: 'Total Market Brief', value: loadingStats ? '...' : statsData.totalBriefs, icon: '📈', color: 'bg-purple-50 text-purple-600', page: 'daily-market-brief' },
    {
      label: 'Total Posts',
      value: loadingStats ? '...' : statsData.totalPosts,
      subtitle: loadingStats ? undefined : `${statsData.autoPosts} Auto • ${statsData.manualPosts} Manual`,
      icon: '📝',
      color: 'bg-amber-50 text-amber-600',
      page: 'posts'
    },
    { label: 'Stock Watchlist Today', value: loadingStats ? '...' : statsData.watchlistToday, icon: '👁️', color: 'bg-green-50 text-green-600', page: 'stock-watchlist' },
  ];

  // Services list:
  // 1. Sectors.app : Stocks Market Data, Stocks News & Filing
  // 2. Sumopod LLM
  // 3. Supabase
  // 4. Repliz (Sosial Media Aggregator)
  const services: ServiceInfo[] = [
    {
      name: 'Sectors.app',
      icon: '📊',
      description: 'Stocks Market Data, Stocks News & Filing',
      connected: !!import.meta.env.VITE_SECTORS_API_KEY,
      details: import.meta.env.VITE_SECTORS_API_KEY ? 'API key configured' : 'Not configured',
      color: 'bg-green-50 text-green-600',
    },
    {
      name: 'Sumopod LLM',
      icon: '🤖',
      description: 'Content generation (OpenAI compatible)',
      connected: !!import.meta.env.VITE_LLM_MODEL,
      details: import.meta.env.VITE_LLM_MODEL ? `Model: ${import.meta.env.VITE_LLM_MODEL}` : 'Not configured',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      name: 'Supabase',
      icon: '🗄️',
      description: 'Database & storage',
      connected: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
      details: import.meta.env.VITE_SUPABASE_URL ? 'Project connected' : 'Not configured',
      color: 'bg-slate-100 text-slate-600',
    },
    {
      name: 'Repliz (Sosial Media Aggregator)',
      icon: '📱',
      description: 'Multi-platform social media posting (Instagram, TikTok, Threads, FB, Telegram)',
      connected: replizConnected,
      details: replizConnected ? 'Account connected' : 'Not configured',
      color: 'bg-pink-50 text-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📊 Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan statistik & status infrastruktur SahamFYP</p>
        </div>
        <button
          onClick={() => onNavigate('generator')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition flex items-center gap-2"
        >
          ✍️ Generate Konten Baru
        </button>
      </div>

      {/* Product Highlight Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-slate-100 border border-amber-300/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-sm">
            💡
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                SahamFYP Engine — Make Market Data Make Sense
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Track 01 Sectors Hackathon
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Pelajari latar belakang masalah Gen Z, sistem anti-FOMO, dan arsitektur Sectors REST API.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('about')}
          className="px-4 py-2 bg-white hover:bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xs sm:text-sm rounded-xl transition shadow-xs shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Pelajari Selengkapnya</span>
          <span>→</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={() => onNavigate(stat.page)}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 cursor-pointer hover:border-amber-300 hover:shadow transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{stat.value}</p>
                {'subtitle' in stat && stat.subtitle && (
                  <p className="text-xs text-slate-400 mt-1 font-medium">{stat.subtitle}</p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status - Detailed */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">🔗 Connection Status</h2>
        <div className="space-y-3">
          {services.map((service, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${service.color}`}>
                  {service.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">{service.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${service.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {service.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{service.details}</p>
                </div>
              </div>
              {!service.connected && (
                <button
                  onClick={() => onNavigate('settings')}
                  className="px-4 py-2 text-xs font-medium text-amber-600 hover:text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50 transition"
                >
                  Setup
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <ActionCard icon="📝" title="Generate Konten" desc="Buat carousel dari berita" onClick={() => onNavigate('generator')} />
          <ActionCard icon="📈" title="Market Brief" desc="Dashboard summary market" onClick={() => onNavigate('daily-market-brief')} />
          <ActionCard icon="👁️" title="Stock Watchlist" desc="Pantau saham potensial" onClick={() => onNavigate('stock-watchlist')} />
          <ActionCard icon="🔗" title="Accounts" desc="Kelola IG / Telegram" onClick={() => onNavigate('accounts')} />
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, disabled = false }: { icon: string; title: string; desc: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-xl text-left transition ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-200'}`}
    >
      <span className="text-2xl block mb-2">{icon}</span>
      <p className="font-medium text-slate-800">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </button>
  );
}
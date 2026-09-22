import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import PipelineFlow from './PipelineFlow';
import TechnicalDepth from './TechnicalDepth';

interface OverviewProps {
  onNavigate: (page: string) => void;
}

export default function Overview({ onNavigate }: OverviewProps) {
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📊 Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan statistik & arsitektur sistem otomatisasi SahamFYP</p>
        </div>
        <button
          onClick={() => onNavigate('generator')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition flex items-center gap-2 shadow-xs"
        >
          ✍️ Generate Konten Baru
        </button>
      </div>

      {/* Metric Cards Grid */}
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

      {/* ⚡ Quick Actions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <ActionCard icon="📝" title="Generate Konten" desc="Buat carousel dari berita" onClick={() => onNavigate('generator')} />
          <ActionCard icon="📈" title="Market Brief" desc="Dashboard summary market" onClick={() => onNavigate('daily-market-brief')} />
          <ActionCard icon="👁️" title="Stock Watchlist" desc="Pantau saham potensial" onClick={() => onNavigate('stock-watchlist')} />
          <ActionCard icon="🔗" title="Accounts" desc="Kelola IG / Telegram" onClick={() => onNavigate('accounts')} />
        </div>
      </div>

      {/* 🌊 2 Saluran Sumber Utama Otomasi SahamFYP (Pipeline Flow dengan Animasi Mengalir) */}
      <PipelineFlow onNavigate={onNavigate} stats={statsData} />

      {/* 🧠 Technical Depth: Multi-API Orchestration, Zero-Hallucination Math, & Dual-Stage LLM */}
      <TechnicalDepth />
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
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
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#130a17]/70 backdrop-blur-md p-5 rounded-2xl border border-[#251323]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Live Mission Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>📊</span> Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Ringkasan metrik waktu nyata, arsitektur orkestrasi data, dan pipeline otomatisasi SahamFYP
          </p>
        </div>
        <button
          onClick={() => onNavigate('generator')}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>✍️</span> Generate Konten Baru
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={() => onNavigate(stat.page)}
            className="group relative bg-[#130a17]/80 hover:bg-[#1a0e20] backdrop-blur-md rounded-2xl p-5 border border-[#251323] hover:border-rose-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-rose-950/30"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
              <div className="w-10 h-10 rounded-xl bg-[#200f27] border border-[#341a3e] group-hover:scale-110 flex items-center justify-center text-xl transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">{stat.value}</span>
            </div>
            {'subtitle' in stat && stat.subtitle && (
              <p className="text-xs text-rose-400/90 mt-2 font-medium bg-[#1d0d24] px-2.5 py-1 rounded-md border border-[#31163b] inline-block">
                {stat.subtitle}
              </p>
            )}
            <div className="mt-3 flex items-center text-[11px] text-zinc-500 group-hover:text-rose-400 font-medium transition-colors">
              <span>Buka modul</span>
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* 🌊 2 Saluran Sumber Utama Otomasi SahamFYP (Pipeline Flow dengan Animasi Mengalir) */}
      <PipelineFlow onNavigate={onNavigate} stats={statsData} />

      {/* 🧠 Technical Depth: Multi-API Orchestration, Zero-Hallucination Math, & Dual-Stage LLM */}
      <TechnicalDepth />
    </div>
  );
}
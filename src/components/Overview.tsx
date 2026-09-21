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

      {/* ⚡ Quick Actions (Moved above Connection Status) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <ActionCard icon="📝" title="Generate Konten" desc="Buat carousel dari berita" onClick={() => onNavigate('generator')} />
          <ActionCard icon="📈" title="Market Brief" desc="Dashboard summary market" onClick={() => onNavigate('daily-market-brief')} />
          <ActionCard icon="👁️" title="Stock Watchlist" desc="Pantau saham potensial" onClick={() => onNavigate('stock-watchlist')} />
          <ActionCard icon="🔗" title="Accounts" desc="Kelola IG / Telegram" onClick={() => onNavigate('accounts')} />
        </div>
      </div>

      {/* 📡 Sectors.app REST API Integration & Credit Usage */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              <h2 className="text-lg font-bold text-slate-800">Sectors.app REST API Integration & Credit Breakdown</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Daftar endpoint Sectors.app v2 yang digunakan secara otonom oleh backend & alur kerja n8n SahamFYP beserta alokasi credit API.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sectors v2 Active
            </span>
            <a
              href="https://sectors.app/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition underline underline-offset-2"
            >
              Docs ↗
            </a>
          </div>
        </div>

        {/* 2 Columns: Market Brief vs News Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Column 1: Daily Market Brief */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <h3 className="font-bold text-slate-800 text-base">Market Brief</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                  Scheduled Batch (08:00 & 16:00 WIB)
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Dipanggil 2x sehari oleh n8n scheduler / serverless endpoint (<code className="text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">api/sector-trigger/open.ts</code> & <code className="text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">close.ts</code>) untuk merangkum kondisi pasar, IHSG, top movers, broker flow, dan analisa emiten.
              </p>

              <div className="space-y-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/index-daily/ihsg/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      1 Credit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Data makro harian IHSG (harga penutupan, persentase perubahan, rentang historis).
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/companies/top-changes/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      2 Credits
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Mendeteksi Top 5 Gainers & Top 5 Losers harian (<code className="text-slate-700 font-mono">1d</code>, min market cap Rp500M–1T) untuk radar pasar.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/brokers/top/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      2 Credits
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Foreign broker flow summary: total net inflow/outflow, net buy broker, dan net sell broker asing.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/filings/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      1 Credit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Keterbukaan informasi resmi emiten BEI (aksi korporasi, dividen, dan insider trading).
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/news/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      1 Credit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Berita pasar terkini terkurasi dengan filter tag (<code className="text-slate-700 font-mono">bullish</code>, <code className="text-slate-700 font-mono">rights-issue</code>).
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/company/report/{'{ticker}'}/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                      3 Credits / emiten
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Laporan fundamental lengkap emiten terpilih: PER vs Sektor, PBV vs Sektor, ROE, DER, serta perbandingan Peers.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/daily/{'{ticker}'}/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                      1 Credit / emiten
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Riwayat harga 400 hari untuk kalkulasi teknikal MA20, MA50, Golden/Death Cross, dan jarak terhadap 52-Week High.
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Summary Pill */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between bg-blue-50/70 -mx-1 -mb-1 p-3 rounded-xl border border-blue-100">
              <span className="text-xs font-semibold text-blue-900">Total Estimasi Konsumsi per Sesi:</span>
              <span className="text-xs font-extrabold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                ~18 – 25 Credits / sesi
              </span>
            </div>
          </div>

          {/* Column 2: News Monitoring */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📰</span>
                  <h3 className="font-bold text-slate-800 text-base">News Monitoring</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Event-Driven / Webhook Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Dipanggil secara otomatis via pipeline n8n (<code className="text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">SahamFYP - News Monitoring.json</code>) serta endpoint (<code className="text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">api/news.ts</code> & <code className="text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">api/enrich.ts</code>) untuk sinkronisasi feed berita dan pengayaan data emiten.
              </p>

              <div className="space-y-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/news/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      1 Credit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Feed berita pasar modal terverifikasi dengan filtering parameter ticker, keyword, sektor, dan rentang tanggal publikasi.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/filings/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      1 Credit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Dokumen resmi keterbukaan informasi emiten untuk validasi berita aksi korporasi & perubahan kepemilikan saham.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/company/report/{'{symbol}'}/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                      3 Credits / emiten
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Enrichment fundamental cepat ketika ada emiten tertentu yang sedang trending/viral dalam arus berita (<code className="text-slate-700 font-mono">api/enrich.ts</code>).
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/foreign-flow/{'{symbol}'}/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                      1 Credit / emiten
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Verifikasi arus dana asing pada emiten yang sedang dibahas di berita untuk mendeteksi apakah berita direspon institusi.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      GET /v2/daily/{'{symbol}'}/
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                      1 Credit / emiten
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Pengecekan teknikal reaksi harga saham (price action) dan lonjakan volume pasca rilis berita pada hari bursa aktif.
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Summary Pill */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between bg-emerald-50/70 -mx-1 -mb-1 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-900">Total Estimasi Konsumsi per Berita:</span>
              <span className="text-xs font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                ~4 – 5 Credits / artikel ter-enrich
              </span>
            </div>
          </div>
        </div>
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
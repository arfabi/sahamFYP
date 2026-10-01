// ============================================================
// Unified Market Brief & Watchlist
// Menggabungkan Daily Market Brief (Sesi & Makro) dan Stock Watchlist (Kandidat & Analisis Detail)
// menjadi satu modul terpadu.
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import FeatureInfoCard from './FeatureInfoCard';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';

interface TriggerLog {
  id: string;
  session: string;
  trigger_date: string;
  data_date: string;
  ihsg_price: number | null;
  ihsg_change: number | null;
  credits_used: number;
  tickers_selected: number;
  news_fetched: number;
  reasoning: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  foreign_flow_json?: any | null;
}

interface TriggerCandidate {
  id: string;
  ticker: string;
  company_name: string | null;
  sector: string | null;
  news_title: string | null;
  news_tags: string[] | null;
  news_body: string | null;
  price: number | null;
  market_cap: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  roe: number | null;
  der: number | null;
  avg_sector_pe: number | null;
  avg_sector_pb: number | null;
  avg_sector_pbv?: number | null;
  avg_sector_roe: number | null;
  avg_sector_der: number | null;
  pe_signal: string | null;
  pbv_signal: string | null;
  roe_signal: string | null;
  der_signal: string | null;
  technical_json?: any | null;
  enrichment_json?: any | null;
  created_at: string;
}

interface TriggerMover {
  id: string;
  classification: 'top_gainers' | 'top_losers';
  symbol: string;
  company_name: string | null;
  price_change: number | null;
  last_price?: number | null;
  point_change?: number | null;
}

interface TriggerNews {
  id: string;
  title: string | null;
  body: string | null;
  thumbnail_url: string | null;
  source_url: string | null;
  symbols: string[];
  tags: string[];
  sector: string | null;
  is_selected: boolean;
}

interface TriggerSkipped {
  id: string;
  ticker: string;
  reason: string | null;
}

export default function UnifiedMarketBrief() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<TriggerLog | null>(null);
  const [candidates, setCandidates] = useState<TriggerCandidate[]>([]);
  const [movers, setMovers] = useState<TriggerMover[]>([]);
  const [news, setNews] = useState<TriggerNews[]>([]);
  const [skipped, setSkipped] = useState<TriggerSkipped[]>([]);

  // Big Calendar Picker Modal state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => new Date());

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidates' | 'news' | 'skipped'>('candidates');
  const [searchQuery, setSearchQuery] = useState('');

  // Read Foreign Flow directly from the selected session log in the Database
  const foreignFlowData = useMemo(() => {
    if (!selectedLog?.foreign_flow_json) return null;
    let data = selectedLog.foreign_flow_json;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    // If format is { net_foreign_flow, net_buy, net_sell, is_inflow, raw }
    if (data.net_foreign_flow !== undefined || data.raw !== undefined) {
      const net = data.net_foreign_flow || (data.raw?.net_total ? `Rp ${(data.raw.net_total / 1e9).toFixed(1)} M` : '-');
      const buy = data.net_buy || (data.raw?.net_buy ? `Rp ${(data.raw.net_buy / 1e9).toFixed(1)} M` : '-');
      const sell = data.net_sell || (data.raw?.net_sell ? `Rp ${(data.raw.net_sell / 1e9).toFixed(1)} M` : '-');
      const isInflow = data.is_inflow ?? ((data.raw?.net_total ?? 0) >= 0);
      return {
        net,
        buy,
        sell,
        isInflow,
      };
    }
    // If format is { totalBuy, totalSell, netFlow }
    if (data.netFlow !== undefined) {
      const isInflow = data.netFlow >= 0;
      return {
        net: `${isInflow ? '+' : ''}Rp ${(data.netFlow / 1e9).toFixed(1)} M`,
        buy: `Rp ${(data.totalBuy / 1e9).toFixed(1)} M`,
        sell: `Rp ${(data.totalSell / 1e9).toFixed(1)} M`,
        isInflow,
      };
    }
    return null;
  }, [selectedLog]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sector_trigger_logs')
        .select('*')
        .order('trigger_date', { ascending: false })
        .limit(60);

      if (error) throw error;
      const list = data || [];
      setLogs(list);
      if (list.length > 0) {
        await loadLogDetail(list[0]);
      }
    } catch (e) {
      console.error('UnifiedMarketBrief fetchLogs error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadLogDetail = async (log: TriggerLog) => {
    setSelectedLog(log);
    setDetailLoading(true);
    try {
      const [candRes, movRes, newsRes, skipRes] = await Promise.all([
        supabase.from('sector_trigger_candidates').select('*').eq('log_id', log.id),
        supabase.from('sector_trigger_movers').select('*').eq('log_id', log.id),
        supabase.from('sector_trigger_news').select('*').eq('log_id', log.id).order('news_index', { ascending: true }),
        supabase.from('sector_trigger_skipped').select('*').eq('log_id', log.id),
      ]);

      const cands = candRes.data || [];
      setCandidates(cands);
      setMovers((movRes.data as TriggerMover[]) || []);

      let fetchedNews = (newsRes.data as TriggerNews[]) || [];
      // Fallback: If sector_trigger_news is empty for this session, extract candidates' news so tab isn't empty!
      if (fetchedNews.length === 0 && cands.length > 0) {
        fetchedNews = cands
          .filter((c) => c.news_title)
          .map((c, idx) => ({
            id: c.id,
            title: c.news_title,
            body: c.news_body,
            thumbnail_url: null,
            source_url: null,
            symbols: [c.ticker],
            tags: c.news_tags || [],
            sector: c.sector,
            is_selected: true,
          }));
      }
      setNews(fetchedNews);
      setSkipped(skipRes.data || []);
    } catch (e) {
      console.error('loadLogDetail error:', e);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const fmtNum = (num: number | null | undefined, decimals: number = 2) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const fmtPct = (val: any) => {
    if (val == null || val === 'N/A' || val === '') return '-';
    if (typeof val === 'number') return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
    const str = String(val).trim();
    if (str.endsWith('%')) {
      const parsed = parseFloat(str.slice(0, -1));
      if (!isNaN(parsed)) return `${parsed >= 0 ? '+' : ''}${parsed.toFixed(2)}%`;
      return str;
    }
    const parsed = parseFloat(str);
    if (isNaN(parsed)) return str;
    return `${parsed >= 0 ? '+' : ''}${parsed.toFixed(2)}%`;
  };

  const getTech = (cand: TriggerCandidate) => {
    if (!cand.technical_json) return {};
    if (typeof cand.technical_json === 'string') {
      try {
        return JSON.parse(cand.technical_json);
      } catch {
        return {};
      }
    }
    return cand.technical_json;
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.ticker.toLowerCase().includes(q) ||
      (c.company_name && c.company_name.toLowerCase().includes(q)) ||
      (c.sector && c.sector.toLowerCase().includes(q))
    );
  });

  // Calendar Helpers: Group logs by date
  const logsByDate = useMemo(() => {
    const map: Record<string, TriggerLog[]> = {};
    for (const l of logs) {
      if (!l.trigger_date) continue;
      const key = l.trigger_date.split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(l);
    }
    return map;
  }, [logs]);

  // Calendar days generation for month
  const calendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust for Monday-first: (day + 6) % 7
    const adjustedFirstDay = (firstDayIndex + 6) % 7;

    const days: ({ day: number; dateStr: string; logs: TriggerLog[] } | null)[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        dateStr,
        logs: logsByDate[dateStr] || [],
      });
    }
    return days;
  }, [calendarViewDate, logsByDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-zinc-300 font-medium">Memuat Market Brief...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* 1. Header & Interactive Session Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs">
              MODUL RESMI TERPADU
            </span>
            <span className="text-xs text-rose-600 font-semibold">• Makro Sesi + Analisis Saham</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <span>⚡</span> Market Brief
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Riwayat kondisi pasar harian terintegrasi dengan daftar saham terpilih & analisis mendalam
          </p>
        </div>

        {/* Interactive Session Button with Calendar Picker Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition cursor-pointer group"
            title="Klik untuk membuka Kalender Pemilih Sesi"
          >
            <CalendarIcon className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
            <span>
              {selectedLog ? formatDate(selectedLog.trigger_date) : 'Pilih Sesi'} ·{' '}
              {selectedLog?.session === 'open' ? '☀️ Sesi Open' : '🌙 Sesi Close'}
            </span>
            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-mono font-bold">
              PILIH TANGGAL ▼
            </span>
          </button>

          <button
            onClick={fetchLogs}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
            title="Refresh Data"
          >
            🔄
          </button>
        </div>
      </div>

      <FeatureInfoCard
        id="unified-market-brief"
        title="Tentang Market Brief & Watchlist Terpadu"
        badge="UNIFIED ANALYSIS"
        description="Pusat intelijen pasar modal harian yang menyatukan kondisi makro indeks IHSG, top movers bursa, dan emiten terseleksi beserta rasio valuasi fundamental serta indikator teknikalnya."
        functionality="Menyajikan sinyal beli/jual berbasis data riil tanpa halusinasi, komparasi terhadap rata-rata sektor (PER, PBV, ROE, DER), serta analogi edukasi finansial ramah pemula."
        dataSource="Diekstrak langsung dari tabel sector_trigger_logs & sector_trigger_candidates dengan data terverifikasi BEI dan Sectors.app v2 API."
        pipeline="Dijalankan terjadwal 2x sehari (08:00 WIB Sesi Open & 16:30 WIB Sesi Close) oleh cron workflow n8n."
        links={[{ label: 'Sectors.app Financials API', url: 'https://sectors.app/api' }]}
      />

      {selectedLog && (
        <>
          {/* 2. KPI Cards Bar: 1. IHSG, 2. Emiten Terpilih, 3. Berita Di-Scan, 4. FOREIGN FLOW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* 1. IHSG Card */}
            <div className="bg-white hover:bg-slate-50/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-xs transition">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Indeks IHSG</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">{fmtNum(selectedLog.ihsg_price, 0)}</span>
                <span
                  className={`text-xs font-bold font-mono ${
                    selectedLog.ihsg_change && selectedLog.ihsg_change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {selectedLog.ihsg_change && selectedLog.ihsg_change >= 0 ? '+' : ''}
                  {fmtNum(selectedLog.ihsg_change, 2)}%
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                Data Date: {formatDate(selectedLog.data_date)}
              </span>
            </div>

            {/* 2. Emiten Watchlist Terpilih */}
            <div className="bg-white hover:bg-slate-50/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-xs transition">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Emiten Terpilih</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {selectedLog.tickers_selected || 0} Saham
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Lolos seleksi AI CIO</span>
            </div>

            {/* 3. Berita Di-Scan */}
            <div className="bg-white hover:bg-slate-50/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-xs transition">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Berita Di-Scan</span>
              <span className="text-2xl font-black text-sky-600 mt-1 block">
                {selectedLog.news_fetched || 0} Artikel
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">BEI & media nasional dipindai</span>
            </div>

            {/* 4. FOREIGN FLOW */}
            <div className="bg-white hover:bg-slate-50/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-xs transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                    Foreign Flow
                  </span>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                    Database BEI
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-[11px] text-slate-400 font-medium block">Net Foreign Flow:</span>
                  {foreignFlowData ? (
                    <span
                      className={`text-xl font-black font-mono block ${
                        foreignFlowData.isInflow ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {foreignFlowData.net}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400 block mt-1">
                      Belum Tercatat di Sesi Ini
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Buy Foreign:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {foreignFlowData ? foreignFlowData.buy : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sell Foreign:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {foreignFlowData ? foreignFlowData.sell : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. AI Macro Reasoning Quote */}
          {selectedLog.reasoning && (
            <div className="bg-gradient-to-r from-rose-50/70 to-orange-50/50 p-4 sm:p-5 rounded-2xl border border-rose-200/80 shadow-xs flex items-start gap-3.5">
              <span className="text-2xl mt-0.5">🧠</span>
              <div className="flex-1">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">
                  Analisis Makro & Reasoning AI CIO ({selectedLog.session.toUpperCase()}):
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  {selectedLog.reasoning}
                </p>
              </div>
            </div>
          )}

          {/* 4. Top Movers Quick Bar with NAMA PT LENGKAP */}
          {movers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['top_gainers', 'top_losers'] as const).map((cls) => {
                const list = movers.filter((m) => m.classification === cls);
                if (!list.length) return null;
                const isGainer = cls === 'top_gainers';
                return (
                  <div
                    key={cls}
                    className="bg-white backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs"
                  >
                    <h3
                      className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                        isGainer ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      <span>{isGainer ? '🚀 Top 5 Gainers' : '🔻 Top 5 Losers'}</span>
                    </h3>
                    <div className="space-y-2">
                      {list.slice(0, 5).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs hover:border-rose-300 hover:bg-white transition"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0 shadow-xs">
                              {m.symbol}
                            </span>
                            {/* NAMA PT LENGKAP (Tanpa pemotongan) */}
                            <span className="text-slate-700 font-medium whitespace-normal leading-tight">
                              {m.company_name || m.symbol}
                            </span>
                          </div>
                          <span
                            className={`font-mono font-bold shrink-0 ${
                              m.price_change != null && m.price_change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {m.price_change != null ? `${m.price_change > 0 ? '+' : ''}${fmtNum(m.price_change, 2)}%` : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Main Tabbed Navigation (Watchlist vs Berita vs Skipped) */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-1">
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={() => setActiveTab('candidates')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'candidates'
                      ? 'border-rose-600 text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>⭐</span>
                  <span>Daftar Saham Pilihan ({candidates.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('news')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'news'
                      ? 'border-rose-600 text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>📰</span>
                  <span>Berita Terindeks ({news.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('skipped')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'skipped'
                      ? 'border-rose-600 text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>📋</span>
                  <span>Emiten Ditolak / Skipped ({skipped.length})</span>
                </button>
              </div>

              {activeTab === 'candidates' && (
                <div className="w-full sm:w-64 mb-2">
                  <input
                    type="text"
                    placeholder="Cari Ticker / Nama / Sektor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-xs"
                  />
                </div>
              )}
            </div>

            {/* TAB CONTENT 1: Candidates Watchlist Table */}
            {activeTab === 'candidates' && (
              <div className="bg-white backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>📋</span> Kandidat Saham Pilihan AI
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik salah satu baris atau tombol "Detail Analisa" untuk membuka halaman analisis penuh emiten
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200 text-left">
                        <th className="py-3 px-4">Ticker</th>
                        <th className="py-3 px-4">Perusahaan</th>
                        <th className="py-3 px-4">Sektor</th>
                        <th className="py-3 px-4 text-right">Harga Terakhir</th>
                        <th className="py-3 px-4 text-center">Sinyal & Tren Teknikal</th>
                        <th className="py-3 px-4">Berita Utama & Katalis</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCandidates.map((c) => {
                        const tech = getTech(c);
                        const chg1d = tech.chg1d;
                        const isUp = typeof chg1d === 'number' && chg1d > 0;
                        const isDown = typeof chg1d === 'number' && chg1d < 0;

                        return (
                          <tr
                            key={c.id}
                            onClick={() => navigate(`/marketbrief/${c.id}`)}
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                          >
                            <td className="py-3 px-4">
                              <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-mono text-xs shadow-xs group-hover:border-amber-400 transition">
                                {c.ticker}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px]" title={c.company_name || ''}>
                              {c.company_name || '-'}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 font-medium">
                              {c.sector || '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-mono font-bold text-amber-700 text-base">
                                Rp {fmtNum(c.price || tech.last, 0)}
                              </div>
                              {chg1d != null && (
                                <span className={`text-[11px] font-mono font-semibold block ${isUp ? 'text-emerald-600' : isDown ? 'text-rose-600' : 'text-slate-400'}`}>
                                  {fmtPct(chg1d)} (1D)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {tech.crossSignal ? (
                                <div className="inline-flex flex-col items-center gap-1">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                    tech.crossSignal.toLowerCase().includes('bullish') || tech.crossSignal.includes('🟢')
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : tech.crossSignal.toLowerCase().includes('bearish') || tech.crossSignal.includes('🔴') || tech.crossSignal.toLowerCase().includes('death')
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}>
                                    {tech.crossSignal}
                                  </span>
                                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
                                    {tech.ma20 && <span>Supp: Rp {fmtNum(tech.ma20, 0)}</span>}
                                    {tech.volumeSignal && (
                                      <span className="capitalize px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                                        Vol: {tech.volumeSignal}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 max-w-md">
                              <p className="text-xs text-slate-800 font-medium line-clamp-1" title={c.news_title || ''}>
                                {c.news_title || '-'}
                              </p>
                              {c.news_tags && c.news_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {c.news_tags.slice(0, 3).map((t, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/marketbrief/${c.id}`);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 mx-auto"
                              >
                                <span>Detail Analisa</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: News List */}
            {activeTab === 'news' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">Arsip Berita Sesi Ini ({news.length} artikel)</h3>
                  <span className="text-xs text-slate-500">BEI & Media Partner</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                  {news.map((n, idx) => (
                    <div
                      key={n.id || idx}
                      onClick={() => navigate(`/news/${n.id}`)}
                      className={`p-4 rounded-xl border transition cursor-pointer hover:border-rose-400 hover:bg-slate-50 ${
                        n.is_selected
                          ? 'bg-amber-50/40 border-amber-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {n.symbols?.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        {n.is_selected && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                            ★ Terpilih AI
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {n.title}
                      </h4>
                      {n.body && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {n.body}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Skipped Audit */}
            {activeTab === 'skipped' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm mb-2">Transparansi Audit Emiten Ditolak ({skipped.length})</h3>
                <p className="text-xs text-slate-500 mb-4">
                  AI menolak emiten-emiten berikut untuk menjaga standar kualitas dan melindungi pengguna dari saham gorengan / berisiko tinggi:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {skipped.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mr-2">
                        {s.ticker}
                      </span>
                      <span className="text-slate-700">{s.reason || 'Tanpa alasan terurai'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── BIG CALENDAR PICKER MODAL (Sesuai Permintaan User) ─── */}
      {isCalendarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Month Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-rose-600" />
                  <span>Pilih Tanggal Sesi Pasar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik tanggal untuk memuat data bursa & watchlist sesi tersebut
                </p>
              </div>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <button
                onClick={() =>
                  setCalendarViewDate(
                    new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1)
                  )
                }
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm text-slate-900 capitalize">
                {calendarViewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() =>
                  setCalendarViewDate(
                    new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1)
                  )
                }
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 uppercase">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span className="text-rose-500">Sab</span>
              <span className="text-rose-500">Min</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} className="h-14 rounded-xl opacity-0" />;
                }

                const hasLogs = cell.logs.length > 0;
                const isCurrentSelected = cell.logs.some((l) => l.id === selectedLog?.id);

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => {
                      if (hasLogs) {
                        loadLogDetail(cell.logs[0]);
                        setIsCalendarOpen(false);
                      }
                    }}
                    className={`h-14 p-1.5 rounded-xl border flex flex-col justify-between transition text-xs select-none ${
                      isCurrentSelected
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-200'
                        : hasLogs
                        ? 'bg-white border-slate-200 hover:bg-rose-50/50 hover:border-rose-300 shadow-2xs cursor-pointer'
                        : 'bg-slate-50/50 border-transparent text-slate-300 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        isCurrentSelected ? 'text-rose-700' : hasLogs ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {/* Session Indicators */}
                    {hasLogs && (
                      <div className="flex gap-1 flex-wrap">
                        {cell.logs.map((l) => (
                          <span
                            key={l.id}
                            className={`text-[9px] px-1 rounded font-bold ${
                              l.session === 'open'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                            title={`Sesi ${l.session.toUpperCase()}`}
                          >
                            {l.session === 'open' ? '☀️' : '🌙'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Helper footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Sesi Open
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Sesi Close
                </span>
              </div>

              <button
                onClick={() => {
                  if (logs.length > 0) {
                    loadLogDetail(logs[0]);
                    setIsCalendarOpen(false);
                  }
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
              >
                Lompat ke Sesi Terbaru ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

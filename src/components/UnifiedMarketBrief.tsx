// ============================================================
// Unified Market Brief & Watchlist
// Menggabungkan Daily Market Brief (Sesi & Makro) dan Stock Watchlist (Kandidat & Analisis Detail)
// menjadi satu modul terpadu.
// ============================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import FeatureInfoCard from './FeatureInfoCard';

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
  news_index: number;
  title: string;
  tags: string[];
  symbols: string[];
  sector: string | null;
  is_selected: boolean;
}

interface TriggerSkipped {
  id: string;
  ticker: string;
  reason: string | null;
}

export default function UnifiedMarketBrief() {
  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<TriggerLog | null>(null);
  const [candidates, setCandidates] = useState<TriggerCandidate[]>([]);
  const [movers, setMovers] = useState<TriggerMover[]>([]);
  const [news, setNews] = useState<TriggerNews[]>([]);
  const [skipped, setSkipped] = useState<TriggerSkipped[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'candidates' | 'news' | 'skipped'>('candidates');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalCandidate, setActiveModalCandidate] = useState<TriggerCandidate | null>(null);

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
        .limit(30);

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

      setCandidates(candRes.data || []);
      setMovers((movRes.data as TriggerMover[]) || []);
      setNews((newsRes.data as TriggerNews[]) || []);
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

  const signalBadge = (s: string | null) => {
    if (!s) return <span className="text-zinc-500 text-xs">-</span>;
    let bg = 'bg-[#200f27] text-zinc-400 border border-[#341a3e]';
    if (s.includes('murah') || s.includes('atas') || s.includes('wajar')) {
      bg = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    } else if (s.includes('mahal') || s.includes('berisiko') || s.includes('bawah')) {
      bg = 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
    }
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ${bg}`}>
        {s}
      </span>
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-zinc-300 font-medium">Memuat Market Brief & Watchlist...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Unified Session Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#130a17]/70 backdrop-blur-md p-5 rounded-2xl border border-[#251323]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs">
              MODUL TERPADU
            </span>
            <span className="text-xs text-rose-400 font-semibold">• Makro Sesi + Analisis Saham</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <span>⚡</span> Market Brief & Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Riwayat kondisi pasar harian terintegrasi dengan daftar saham terpilih & analisis mendalam
          </p>
        </div>

        {/* Session Run Selector Dropdown */}
        <div className="flex items-center gap-2 bg-[#180b1d] p-2 rounded-xl border border-[#2d142d] shadow-sm">
          <span className="text-xs font-bold text-zinc-400 uppercase px-2">Sesi:</span>
          <select
            value={selectedLog?.id || ''}
            onChange={(e) => {
              const found = logs.find((l) => l.id === e.target.value);
              if (found) loadLogDetail(found);
            }}
            className="px-3 py-1.5 border border-[#3d1947] rounded-lg text-sm bg-[#130917] font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            {logs.map((l) => (
              <option key={l.id} value={l.id} className="bg-[#130917] text-white">
                {formatDate(l.trigger_date)} · {l.session === 'open' ? '☀️ Open (08:00 WIB)' : '🌙 Close (16:30 WIB)'} · {l.status.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            onClick={fetchLogs}
            className="p-2 hover:bg-[#250f2e] text-zinc-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Refresh"
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
        links={[
          { label: 'Sectors.app Financials API', url: 'https://sectors.app/api' }
        ]}
      />

      {selectedLog && (
        <>
          {/* 2. KPI Cards Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* IHSG Card */}
            <div className="bg-[#130a17]/80 hover:bg-[#1a0e20] backdrop-blur-md rounded-2xl p-4 border border-[#251323] shadow-lg transition">
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">Indeks IHSG</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white font-mono">{fmtNum(selectedLog.ihsg_price, 0)}</span>
                <span
                  className={`text-xs font-bold font-mono ${
                    selectedLog.ihsg_change && selectedLog.ihsg_change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedLog.ihsg_change && selectedLog.ihsg_change >= 0 ? '+' : ''}
                  {fmtNum(selectedLog.ihsg_change, 2)}%
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono mt-1 block">
                Data Date: {formatDate(selectedLog.data_date)}
              </span>
            </div>

            {/* Emiten Watchlist Terpilih */}
            <div className="bg-[#130a17]/80 hover:bg-[#1a0e20] backdrop-blur-md rounded-2xl p-4 border border-[#251323] shadow-lg transition">
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">Emiten Terpilih</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">
                {selectedLog.tickers_selected || 0} Saham
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">Lolos seleksi AI CIO</span>
            </div>

            {/* Berita Di-Scan */}
            <div className="bg-[#130a17]/80 hover:bg-[#1a0e20] backdrop-blur-md rounded-2xl p-4 border border-[#251323] shadow-lg transition">
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">Berita Terindeks</span>
              <span className="text-2xl font-black text-sky-400 mt-1 block">
                {selectedLog.news_fetched || 0} Artikel
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">BEI & media nasional</span>
            </div>

            {/* Status & Credits */}
            <div className="bg-[#130a17]/80 hover:bg-[#1a0e20] backdrop-blur-md rounded-2xl p-4 border border-[#251323] shadow-lg transition flex flex-col justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">Status & Biaya</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedLog.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-purple-300 font-mono font-bold bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30">
                    {selectedLog.credits_used} cr
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 truncate font-mono">
                {selectedLog.session === 'open' ? 'Sesi Open' : 'Sesi Close'}
              </span>
            </div>
          </div>

          {/* 3. AI Macro Reasoning Quote */}
          {selectedLog.reasoning && (
            <div className="bg-gradient-to-r from-[#1c0f24] to-[#150a1b] p-4 sm:p-5 rounded-2xl border border-[#2d1437] shadow-lg flex items-start gap-3.5">
              <span className="text-2xl mt-0.5">🧠</span>
              <div className="flex-1">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  Analisis Makro & Reasoning AI CIO ({selectedLog.session.toUpperCase()}):
                </span>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                  {selectedLog.reasoning}
                </p>
              </div>
            </div>
          )}

          {/* 4. Top Movers Quick Bar */}
          {movers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['top_gainers', 'top_losers'] as const).map((cls) => {
                const list = movers.filter((m) => m.classification === cls);
                if (!list.length) return null;
                const isGainer = cls === 'top_gainers';
                return (
                  <div key={cls} className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl p-4 border border-[#251323] shadow-lg">
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isGainer ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span>{isGainer ? '🚀 Top 5 Gainers' : '🔻 Top 5 Losers'}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {list.slice(0, 4).map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-[#1a0e21] border border-[#281329] text-xs">
                          <div>
                            <span className="font-mono font-bold text-white bg-[#281132] border border-[#3b1949] px-1.5 py-0.5 rounded mr-1.5">
                              {m.symbol}
                            </span>
                            <span className="text-zinc-400 truncate max-w-[90px] inline-block align-bottom font-medium">
                              {m.company_name}
                            </span>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              m.price_change != null && m.price_change >= 0 ? 'text-emerald-400' : 'text-rose-400'
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
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251323] pb-1">
              <div className="flex gap-2 sm:gap-4">
                <button
                  onClick={() => setActiveTab('candidates')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'candidates'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>⭐</span>
                  <span>Daftar Saham Pilihan ({candidates.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('news')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'news'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>📰</span>
                  <span>Berita Terindeks ({news.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('skipped')}
                  className={`pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                    activeTab === 'skipped'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
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
                    className="w-full px-3 py-1.5 text-xs bg-[#1a0e21] border border-[#341a3e] rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* TAB CONTENT 1: Candidates Watchlist Table */}
            {activeTab === 'candidates' && (
              <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] shadow-xl overflow-hidden">
                <div className="p-4 border-b border-[#251323] bg-[#170b1d]/60 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>📋</span> Kandidat Saham Pilihan AI
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Klik salah satu baris untuk membuka Analisis Detail (Katalis 3W, Fundamental vs Sektor & Teknikal)
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#1a0e21]/70 text-zinc-400 text-xs font-semibold border-b border-[#251323] text-left">
                        <th className="py-3 px-4">Ticker</th>
                        <th className="py-3 px-4">Perusahaan</th>
                        <th className="py-3 px-4">Sektor</th>
                        <th className="py-3 px-4 text-right">Harga</th>
                        <th className="py-3 px-2 text-center">PER Signal</th>
                        <th className="py-3 px-2 text-center">PBV Signal</th>
                        <th className="py-3 px-2 text-center">ROE Signal</th>
                        <th className="py-3 px-2 text-center">DER Signal</th>
                        <th className="py-3 px-4">Berita Utama & Katalis</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#200f24]">
                      {filteredCandidates.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setActiveModalCandidate(c)}
                          className="hover:bg-[#1d0e24] cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono text-xs shadow-xs">
                              {c.ticker}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white max-w-[170px] truncate" title={c.company_name || ''}>
                            {c.company_name || '-'}
                          </td>
                          <td className="py-3 px-4 text-xs text-zinc-400 font-medium">
                            {c.sector || '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            {fmtNum(c.price, 0)}
                          </td>
                          <td className="py-3 px-2 text-center">{signalBadge(c.pe_signal)}</td>
                          <td className="py-3 px-2 text-center">{signalBadge(c.pbv_signal)}</td>
                          <td className="py-3 px-2 text-center">{signalBadge(c.roe_signal)}</td>
                          <td className="py-3 px-2 text-center">{signalBadge(c.der_signal)}</td>
                          <td className="py-3 px-4 max-w-[260px]">
                            <p className="text-xs text-zinc-300 font-medium truncate" title={c.news_title || ''}>
                              {c.news_title || '-'}
                            </p>
                            {c.news_tags && c.news_tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {c.news_tags.slice(0, 2).map((t, i) => (
                                  <span key={i} className="text-[10px] bg-[#240f2b] text-zinc-400 border border-[#381a42] px-1.5 py-0.5 rounded">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModalCandidate(c);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-950/40 transition cursor-pointer"
                            >
                              Detail Analisa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCandidates.length === 0 && (
                    <div className="p-10 text-center text-zinc-500 text-sm">
                      Tidak ada kandidat saham yang sesuai dengan filter pencarian.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: News Feed */}
            {activeTab === 'news' && (
              <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] p-5 shadow-lg space-y-3">
                <h3 className="font-bold text-white text-sm mb-3">Daftar Berita Terindeks ({news.length})</h3>
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                  {news.map((n) => (
                    <div
                      key={n.id}
                      className={`text-sm p-3.5 rounded-xl border transition ${
                        n.is_selected
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-[#1a0e21] border-[#281329] hover:bg-[#200f27]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-zinc-500 text-xs mt-0.5 font-mono">{n.news_index}.</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {n.is_selected && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                TERPILIH LOLOS
                              </span>
                            )}
                            {n.sector && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#240f2b] text-zinc-400 border border-[#381642]">
                                {n.sector}
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-200 text-xs sm:text-sm font-medium leading-relaxed">{n.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {n.symbols.slice(0, 4).map((s) => (
                              <span key={s} className="text-[10px] bg-[#240f2b] text-amber-300 border border-[#381642] px-1.5 py-0.5 rounded font-mono font-bold">
                                {s}
                              </span>
                            ))}
                            {n.tags.slice(0, 2).map((t) => (
                              <span key={t} className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-semibold">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Skipped Audit */}
            {activeTab === 'skipped' && (
              <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] p-5 shadow-lg space-y-3">
                <h3 className="font-bold text-white text-sm mb-2">Transparansi Audit Emiten Ditolak ({skipped.length})</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  AI menolak emiten-emiten berikut untuk menjaga standar kualitas dan melindungi pengguna dari saham gorengan / berisiko tinggi:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {skipped.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-[#1a0e21] border border-[#281329] text-xs">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 mr-2">
                        {s.ticker}
                      </span>
                      <span className="text-zinc-300">{s.reason || 'Tanpa alasan terurai'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 6. Stock Candidate Deep Detail Modal */}
      {activeModalCandidate && (
        <CandidateDetailModal
          candidate={activeModalCandidate}
          onClose={() => setActiveModalCandidate(null)}
        />
      )}
    </div>
  );
}

function CandidateDetailModal({
  candidate: c,
  onClose,
}: {
  candidate: TriggerCandidate;
  onClose: () => void;
}) {
  const fmtNum = (n: number | null | undefined, d = 2) =>
    n == null ? '-' : n.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

  const fmtPct = (val: any) => {
    if (val == null || val === 'N/A' || val === '') return '-';
    if (typeof val === 'number') {
      return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
    }
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

  const tech = c.technical_json || {};
  const tags = c.news_tags || [];
  const displayPrice = tech.last || c.price;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#130a17] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#251323] text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1c0c22] to-[#140818] text-white p-6 rounded-t-2xl border-b border-[#251323] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold font-mono text-base rounded-lg">
                {c.ticker}
              </span>
              <span className="text-xs bg-[#240f2b] text-zinc-300 border border-[#391942] px-2.5 py-1 rounded-md font-semibold">
                {c.sector || 'Sektor N/A'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-2 tracking-tight">{c.company_name || c.ticker}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-300">
              <span>Harga Terakhir: <strong className="font-mono text-amber-400 text-base">Rp {fmtNum(displayPrice, 0)}</strong></span>
              {c.market_cap && <span>Market Cap: <strong className="text-zinc-200">Rp {fmtNum(c.market_cap / 1e12, 2)} T</strong></span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#220e28] hover:bg-[#2f1338] text-zinc-400 hover:text-white flex items-center justify-center text-lg font-bold border border-[#381642] cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tags & Investment Horizon */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#180c1d] rounded-xl border border-[#281329]">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Tags & Sentimen</span>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      t.toLowerCase().includes('bullish')
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : t.toLowerCase().includes('bearish')
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {t}
                  </span>
                ))}
                {!tags.length && <span className="text-xs text-zinc-500">Tidak ada tag</span>}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Horizon / Trading Style</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-xs rounded-lg">
                ⚡ Swing / Short-term Katalis
              </span>
            </div>
          </div>

          {/* Berita Utama & Katalis */}
          {c.news_title && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                📰 Berita Utama & Katalis
              </h3>
              <p className="font-bold text-white text-base">{c.news_title}</p>
              {c.news_body && (
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{c.news_body}</p>
              )}
            </div>
          )}

          {/* Data Fundamental Lengkap */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              📊 Data Fundamental vs Rata-Rata Sektor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* PER */}
              <div className="p-3.5 bg-[#180c1d] rounded-xl border border-[#281329] shadow-sm">
                <span className="text-xs font-medium text-zinc-400 block">PER (Price to Earnings)</span>
                <span className="text-lg font-extrabold text-white font-mono block mt-1">
                  {c.pe_ratio != null ? `${fmtNum(c.pe_ratio)}x` : 'N/A'}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-0.5 font-mono">
                  Rata-rata Sektor: {c.avg_sector_pe != null ? `${fmtNum(c.avg_sector_pe)}x` : 'N/A'}
                </span>
                <div className="mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#240f2b] text-zinc-300 border border-[#381642] block text-center">
                    {c.pe_signal ? `${c.pe_signal} dari rata-rata sektor` : '-'}
                  </span>
                </div>
              </div>

              {/* PBV */}
              <div className="p-3.5 bg-[#180c1d] rounded-xl border border-[#281329] shadow-sm">
                <span className="text-xs font-medium text-zinc-400 block">PBV (Price to Book Value)</span>
                <span className="text-lg font-extrabold text-white font-mono block mt-1">
                  {c.pb_ratio != null ? `${fmtNum(c.pb_ratio)}x` : 'N/A'}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-0.5 font-mono">
                  Rata-rata Sektor: {c.avg_sector_pb || c.avg_sector_pbv ? `${fmtNum(c.avg_sector_pb || c.avg_sector_pbv)}x` : 'N/A'}
                </span>
                <div className="mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#240f2b] text-zinc-300 border border-[#381642] block text-center">
                    {c.pbv_signal ? `${c.pbv_signal} dari rata-rata sektor` : '-'}
                  </span>
                </div>
              </div>

              {/* ROE */}
              <div className="p-3.5 bg-[#180c1d] rounded-xl border border-[#281329] shadow-sm">
                <span className="text-xs font-medium text-zinc-400 block">ROE (Return on Equity)</span>
                <span className="text-lg font-extrabold text-white font-mono block mt-1">
                  {c.roe != null ? `${fmtNum(c.roe)}%` : 'N/A'}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-0.5 font-mono">
                  Rata-rata Sektor: {c.avg_sector_roe != null ? `${fmtNum(c.avg_sector_roe)}%` : 'N/A'}
                </span>
                <div className="mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#240f2b] text-zinc-300 border border-[#381642] block text-center">
                    {c.roe_signal ? `${c.roe_signal} rata-rata sektor` : '-'}
                  </span>
                </div>
              </div>

              {/* DER */}
              <div className="p-3.5 bg-[#180c1d] rounded-xl border border-[#281329] shadow-sm">
                <span className="text-xs font-medium text-zinc-400 block">DER (Debt to Equity)</span>
                <span className="text-lg font-extrabold text-white font-mono block mt-1">
                  {c.der != null ? `${fmtNum(c.der)}x` : 'N/A'}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-0.5 font-mono">
                  Rata-rata Sektor: {c.avg_sector_der != null ? `${fmtNum(c.avg_sector_der)}x` : 'N/A'}
                </span>
                <div className="mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#240f2b] text-zinc-300 border border-[#381642] block text-center">
                    {c.der_signal ? `${c.der_signal} dibanding sektor` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Kamus Fundamental Gen Z Guide Box */}
            <div className="mt-3 p-4 bg-[#1b0d23] border border-[#2d1437] rounded-xl text-xs space-y-1.5 text-zinc-300">
              <p className="font-bold text-amber-400 text-xs flex items-center gap-1">💡 Kamus Fundamental Gen Z & Analogi Real Life:</p>
              <p>• <strong className="text-white">PER (Price to Earnings Ratio)</strong>: Berapa tahun balik modal dari laba per saham. <span className="text-emerald-400 font-semibold">Lebih KECIL dari sektor = LEBIH MURAH</span>.<br/>
              <span className="text-zinc-500 italic pl-3 inline-block">💬 Analogi: Beli HP Rp15jt, tiap tahun untung Rp1jt → PER = 15x balik modal.</span></p>
              <p>• <strong className="text-white">PBV (Price to Book Value)</strong>: Bayar berapa kali lipat harga vs aset bersih modal. <span className="text-emerald-400 font-semibold">Lebih KECIL dari sektor = LEBIH DISKON</span>.<br/>
              <span className="text-zinc-500 italic pl-3 inline-block">💬 Analogi: Harga modal asli Rp1jt tapi bayar Rp3jt (PBV 3x) = bayar ekspektasi/brand.</span></p>
              <p>• <strong className="text-white">ROE (Return on Equity)</strong>: Efisiensi modal sendiri menghasilkan cuan/profit. <span className="text-emerald-400 font-semibold">Lebih BESAR dari sektor = LEBIH JAGO CUAN</span>.<br/>
              <span className="text-zinc-500 italic pl-3 inline-block">💬 Analogi: Modal Rp1jt untung Rp200rb (ROE 20%) vs modal Rp5jt cuma untung Rp200rb (ROE 4%).</span></p>
              <p>• <strong className="text-white">DER (Debt to Equity Ratio)</strong>: Bandingkan total beban utang vs modal bersih sendiri. <span className="text-emerald-400 font-semibold">Lebih KECIL dari sektor = LEBIH AMAN</span>.<br/>
              <span className="text-zinc-500 italic pl-3 inline-block">💬 Analogi: DER 1x = utang 100% dari modal. DER 3x = utang 3x lipat modal sendiri (risiko tinggi).</span></p>
            </div>
          </div>

          {/* Data Technical Lengkap */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              📈 Data Teknikal & Pergerakan Harga
            </h3>
            <div className="bg-[#180c1d] border border-[#281329] text-white rounded-xl p-5 space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                <div className="bg-[#220e28] border border-[#34163e] p-2 rounded-lg text-center">
                  <span className="text-[10px] text-zinc-400 block">Harga Terakhir</span>
                  <span className="font-mono font-bold text-amber-400 text-xs">Rp {fmtNum(displayPrice, 0)}</span>
                </div>
                <div className="bg-[#220e28] border border-[#34163e] p-2 rounded-lg text-center">
                  <span className="text-[10px] text-zinc-400 block">MA20 (Support)</span>
                  <span className="font-mono font-bold text-blue-400 text-xs">{fmtNum(tech.ma20, 0)}</span>
                </div>
                <div className="bg-[#220e28] border border-[#34163e] p-2 rounded-lg text-center">
                  <span className="text-[10px] text-zinc-400 block">MA50 (Trend)</span>
                  <span className="font-mono font-bold text-cyan-400 text-xs">{fmtNum(tech.ma50, 0)}</span>
                </div>
                <div className="bg-[#220e28] border border-[#34163e] p-2 rounded-lg text-center">
                  <span className="text-[10px] text-zinc-400 block">MA200 (Long)</span>
                  <span className="font-mono font-bold text-indigo-300 text-xs">{fmtNum(tech.ma200, 0)}</span>
                </div>
                <div className="bg-[#220e28] border border-[#34163e] p-2 rounded-lg text-center">
                  <span className="text-[10px] text-zinc-400 block">Chg 1D</span>
                  <span className={`font-mono font-bold text-xs ${String(tech.chg1d).includes('-') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {fmtPct(tech.chg1d)}
                  </span>
                </div>
                <div className="bg-[#220e28] border border-[#34163e] p-2 rounded-lg text-center">
                  <span className="text-[10px] text-zinc-400 block">Chg 5D</span>
                  <span className={`font-mono font-bold text-xs ${String(tech.chg5d).includes('-') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {fmtPct(tech.chg5d)}
                  </span>
                </div>
                <div className="bg-[#220e28] border border-[#34163e] p-2 rounded-lg text-center">
                  <span className="text-[10px] text-zinc-400 block">Chg 20D</span>
                  <span className={`font-mono font-bold text-xs ${String(tech.chg20d).includes('-') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {fmtPct(tech.chg20d)}
                  </span>
                </div>
                <div className="bg-[#220e28] border border-[#34163e] p-2 rounded-lg text-center">
                  <span className="text-[10px] text-zinc-400 block">High 52W</span>
                  <span className="font-mono font-bold text-amber-300 text-xs">{fmtNum(tech.high52w, 0)}</span>
                </div>
              </div>

              {/* Technical Sinyal Cross (Golden/Death Cross) */}
              {tech.crossSignal && (
                <div className="bg-[#220e28] px-3.5 py-2 rounded-xl border border-[#34163e] flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">MA Crossover Signal:</span>
                  <span className="text-xs font-bold text-amber-300 font-mono">{tech.crossSignal}</span>
                </div>
              )}

              {/* vibeCheck, Trigger, TLDR & Warning Analysis */}
              {(tech.vibeCheck || tech.trigger || tech.tldr || tech.warning) && (
                <div className="pt-2 border-t border-[#2d1437] space-y-2.5">
                  {tech.vibeCheck && (
                    <div className="bg-[#220e28] p-3 rounded-xl border border-[#34163e]">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase block mb-1">Vibe Check Gen Z</span>
                      <p className="text-sm font-semibold text-amber-300">{tech.vibeCheck}</p>
                    </div>
                  )}
                  {tech.trigger && (
                    <div className="bg-[#220e28] p-3 rounded-xl border border-[#34163e]">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase block mb-1">Trading Trigger & Support/Resistance</span>
                      <p className="text-xs text-zinc-200 leading-relaxed">{tech.trigger}</p>
                    </div>
                  )}
                  {tech.tldr && (
                    <div className="bg-[#220e28] p-3 rounded-xl border border-[#34163e]">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase block mb-1">TL;DR Ringkasan AI</span>
                      <p className="text-xs text-zinc-200 leading-relaxed">{tech.tldr}</p>
                    </div>
                  )}
                  {tech.warning && (
                    <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-800/50">
                      <span className="text-[11px] font-semibold text-rose-400 uppercase block mb-1">⚠️ Awas / Risk Warning</span>
                      <p className="text-xs text-rose-200 leading-relaxed">{tech.warning}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Kamus Teknikal Gen Z Guide Box */}
              <div className="p-3 bg-[#1d0e24] border border-[#31163b] rounded-xl text-xs space-y-1.5 text-zinc-300">
                <p className="font-bold text-amber-300 text-xs flex items-center gap-1">💡 Kamus Teknikal Gen Z & Analogi:</p>
                <p>• <strong className="text-white">MA20 & MA50 (Moving Average 20 & 50 Hari)</strong>: Garis bantal rata-rata harga 20 & 50 hari terakhir.<br/>
                <span className="text-zinc-500 italic pl-3 inline-block">💬 Analogi: Batas aman 'napas' harga. Golden Cross 🚀 (MA20 potong ke atas MA50 = sinyal terbang), Death Cross ☠️ (potong ke bawah = sinyal downtrend).</span></p>
                <p>• <strong className="text-white">Bullish vs Bearish</strong>:<br/>
                <span className="text-zinc-500 italic pl-3 inline-block">💬 Analogi: Bullish (banteng menyundul ke atas = tren naik), Bearish (beruang mencakar ke bawah = tren lesu/turun).</span></p>
                <p>• <strong className="text-white">Chg 1D / 5D / 20D & Volume</strong>: Persentase naik-turun harga 1 hari, 1 minggu, 1 bulan bursa.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#140818] border-t border-[#251323] rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-rose-950/40 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

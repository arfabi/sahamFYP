// ============================================================
// Daily Market Brief - Dashboard for viewing sector trigger logs
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

interface TriggerNews {
  id: string;
  news_index: number;
  title: string;
  tags: string[];
  symbols: string[];
  sector: string | null;
  is_selected: boolean;
}

interface TriggerCandidate {
  id: string;
  ticker: string;
  company_name: string | null;
  sector: string | null;
  news_title: string | null;
  news_tags: string[];
  price: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  roe: number | null;
  der: number | null;
  avg_sector_pe: number | null;
  avg_sector_pbv: number | null;
  avg_sector_roe: number | null;
  avg_sector_der: number | null;
  pe_signal: string | null;
  pbv_signal: string | null;
  roe_signal: string | null;
  der_signal: string | null;
}

interface TriggerMover {
  id: string;
  classification: string;
  symbol: string;
  company_name: string | null;
  price_change: number | null;
}

interface TriggerSkipped {
  id: string;
  ticker: string;
  reason: string | null;
}

export default function DailyMarketBrief() {
  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<TriggerLog | null>(null);
  const [news, setNews] = useState<TriggerNews[]>([]);
  const [candidates, setCandidates] = useState<TriggerCandidate[]>([]);
  const [movers, setMovers] = useState<TriggerMover[]>([]);
  const [skipped, setSkipped] = useState<TriggerSkipped[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

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
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogDetail = async (log: TriggerLog) => {
    setSelectedLog(log);
    setDetailLoading(true);
    try {
      const [newsRes, candidatesRes, moversRes, skippedRes] = await Promise.all([
        supabase.from('sector_trigger_news').select('*').eq('log_id', log.id).order('news_index'),
        supabase.from('sector_trigger_candidates').select('*').eq('log_id', log.id),
        supabase.from('sector_trigger_movers').select('*').eq('log_id', log.id),
        supabase.from('sector_trigger_skipped').select('*').eq('log_id', log.id),
      ]);

      setNews(newsRes.data || []);
      setCandidates(candidatesRes.data || []);
      setMovers(moversRes.data || []);
      setSkipped(skippedRes.data || []);
    } catch (error) {
      console.error('Error fetching log detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number | null, decimals: number = 2) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const getSignalColor = (signal: string | null) => {
    if (!signal) return 'text-zinc-500';
    if (signal.includes('murah') || signal.includes('atas') || signal.includes('wajar')) return 'text-emerald-400 font-semibold';
    if (signal.includes('mahal') || signal.includes('berisiko') || signal.includes('bawah')) return 'text-rose-400 font-semibold';
    return 'text-zinc-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full">SUCCESS</span>;
      case 'no_candidates':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full">NO CANDIDATES</span>;
      case 'error':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-full">ERROR</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full">{status.toUpperCase()}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-zinc-300 font-medium">Memuat Daily Market Brief...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#130a17]/70 backdrop-blur-md p-5 rounded-2xl border border-[#251323]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <span>📈</span> Daily Market Brief
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Riwayat trigger market open/close dengan data berita dan watchlist</p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white bg-[#1a0e21] border border-[#341a3e] rounded-xl hover:border-rose-500/40 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <span>🔄</span> Refresh
        </button>
      </div>

      <FeatureInfoCard
        id="daily-market-brief"
        title="Tentang Daily Market Brief"
        badge="ANALYSIS"
        description="Ringkasan harian kondisi pasar modal Indonesia yang dieksekusi 2 kali sehari: saat Market Open (pagi) dan Market Close (sore)."
        functionality="Menganalisis pergerakan indeks IHSG, top gainers/losers, ringkasan berita katalis utama, serta seleksi emiten potensial berdasarkan valuasi sektoral."
        dataSource="Data historis dan metrik finansial emiten ditarik dari Sectors.app Market & Financials API dan disimpan di tabel Supabase sector_trigger_logs."
        pipeline="Dijalankan secara terjadwal otomatis oleh workflow n8n / cron endpoint (/api/sector-trigger) untuk menghasilkan log komprehensif sebagai dasar pembuatan konten pasar."
        links={[
          { label: 'Sectors.app API', url: 'https://sectors.app/api' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Log List */}
        <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#251323] bg-[#160b1b]/60 flex items-center justify-between">
            <h2 className="font-bold text-white text-base">Riwayat Run (30 hari terakhir)</h2>
            <span className="text-xs text-zinc-400">{logs.length} logs</span>
          </div>
          <div className="divide-y divide-[#200f24] max-h-[620px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-10 text-center text-zinc-500 text-sm">
                Belum ada data. Jalankan trigger terlebih dahulu.
              </div>
            ) : (
              logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => fetchLogDetail(log)}
                  className={`w-full p-4 text-left hover:bg-[#1d0e24] transition cursor-pointer ${
                    selectedLog?.id === log.id ? 'bg-[#250f2e] border-l-4 border-rose-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-white">
                      {formatDate(log.trigger_date)}
                    </span>
                    {getStatusBadge(log.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>Sesi: <strong className="text-zinc-200 capitalize">{log.session}</strong></span>
                    <span>IHSG: <strong className="text-zinc-200 font-mono">{formatNumber(log.ihsg_price, 0)}</strong></span>
                    <span className={`font-mono font-bold ${log.ihsg_change && log.ihsg_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {log.ihsg_change && log.ihsg_change >= 0 ? '+' : ''}{formatNumber(log.ihsg_change)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2 font-mono">
                    <span>📰 {log.news_fetched} berita</span>
                    <span>🎯 {log.tickers_selected} ticker</span>
                    <span>💳 {log.credits_used} credits</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Detail */}
        <div className="space-y-4">
          {!selectedLog ? (
            <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] shadow-lg p-10 text-center text-zinc-500">
              <p className="text-base font-semibold text-zinc-300">Pilih salah satu run di sebelah kiri</p>
              <p className="text-xs text-zinc-500 mt-1">Detail kandidat, berita, dan top movers akan ditampilkan di sini.</p>
            </div>
          ) : detailLoading ? (
            <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] shadow-lg p-10 text-center text-zinc-400 flex items-center justify-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full" />
              <span>Memuat rincian run...</span>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] shadow-lg p-5">
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider text-rose-400">Run Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-[#1a0e21] p-3 rounded-xl border border-[#29132a]">
                    <span className="text-xs text-zinc-400 block mb-0.5">Data Date:</span>
                    <span className="font-semibold text-white">{formatDate(selectedLog.data_date)}</span>
                  </div>
                  <div className="bg-[#1a0e21] p-3 rounded-xl border border-[#29132a]">
                    <span className="text-xs text-zinc-400 block mb-0.5">Sesi:</span>
                    <span className="font-semibold text-white capitalize">{selectedLog.session}</span>
                  </div>
                  <div className="col-span-2 bg-[#1a0e21] p-3 rounded-xl border border-[#29132a]">
                    <span className="text-xs text-zinc-400 block mb-0.5">Reasoning:</span>
                    <span className="text-xs text-zinc-300 leading-relaxed">{selectedLog.reasoning || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Top Movers */}
              {movers.length > 0 && (
                <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] shadow-lg p-5">
                  <h3 className="font-bold text-white mb-3 text-sm">Pergerakan Top Movers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a0e21] p-3.5 rounded-xl border border-[#281329]">
                      <p className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                        <span>🚀</span> Top Gainers
                      </p>
                      <div className="space-y-1.5">
                        {movers.filter(m => m.classification === 'top_gainers').map((m) => (
                          <div key={m.id} className="flex justify-between items-center text-xs">
                            <span className="font-mono font-bold text-white bg-[#250f2e] border border-[#381642] px-1.5 py-0.5 rounded">{m.symbol}</span>
                            <span className="text-emerald-400 font-mono font-bold">+{formatNumber(m.price_change)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#1a0e21] p-3.5 rounded-xl border border-[#281329]">
                      <p className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                        <span>🔻</span> Top Losers
                      </p>
                      <div className="space-y-1.5">
                        {movers.filter(m => m.classification === 'top_losers').map((m) => (
                          <div key={m.id} className="flex justify-between items-center text-xs">
                            <span className="font-mono font-bold text-white bg-[#250f2e] border border-[#381642] px-1.5 py-0.5 rounded">{m.symbol}</span>
                            <span className="text-rose-400 font-mono font-bold">{formatNumber(m.price_change)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidates */}
              {candidates.length > 0 && (
                <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] shadow-lg p-5">
                  <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
                    <span>🎯</span> Watchlist Candidates ({candidates.length})
                  </h3>
                  <div className="space-y-3">
                    {candidates.map((c) => (
                      <div key={c.id} className="border border-[#281329] bg-[#1a0e21] rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-amber-300 font-mono text-sm bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">{c.ticker}</span>
                          <span className="text-xs text-zinc-400">{c.company_name}</span>
                        </div>
                        <p className="text-xs text-zinc-300 mb-2.5 leading-relaxed">{c.news_title}</p>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="bg-[#240f2b] p-2 rounded-lg text-center border border-[#381642]">
                            <span className="text-[10px] text-zinc-400 block">PER</span>
                            <p className={getSignalColor(c.pe_signal)}>{formatNumber(c.pe_ratio)}x</p>
                          </div>
                          <div className="bg-[#240f2b] p-2 rounded-lg text-center border border-[#381642]">
                            <span className="text-[10px] text-zinc-400 block">PBV</span>
                            <p className={getSignalColor(c.pbv_signal)}>{formatNumber(c.pb_ratio)}x</p>
                          </div>
                          <div className="bg-[#240f2b] p-2 rounded-lg text-center border border-[#381642]">
                            <span className="text-[10px] text-zinc-400 block">ROE</span>
                            <p className={getSignalColor(c.roe_signal)}>{formatNumber(c.roe)}%</p>
                          </div>
                          <div className="bg-[#240f2b] p-2 rounded-lg text-center border border-[#381642]">
                            <span className="text-[10px] text-zinc-400 block">DER</span>
                            <p className={getSignalColor(c.der_signal)}>{formatNumber(c.der)}x</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped */}
              {skipped.length > 0 && (
                <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] shadow-lg p-5">
                  <h3 className="font-bold text-white mb-3 text-sm">Skipped Tickers ({skipped.length})</h3>
                  <div className="space-y-2">
                    {skipped.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#1a0e21] border border-[#281329]">
                        <span className="font-mono font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">{s.ticker}</span>
                        <span className="text-zinc-400">{s.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {news.length > 0 && (
                <div className="bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323] shadow-lg p-5">
                  <h3 className="font-bold text-white mb-3 text-sm">Berita Terkait ({news.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {news.map((n) => (
                      <div key={n.id} className={`text-sm p-3 rounded-xl border ${n.is_selected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#1a0e21] border-[#281329]'}`}>
                        <div className="flex items-start gap-2">
                          <span className="text-zinc-500 text-xs mt-0.5 font-mono">{n.news_index}.</span>
                          <div>
                            <p className="text-zinc-200 text-xs leading-relaxed">{n.title}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {n.symbols.slice(0, 3).map((s) => (
                                <span key={s} className="text-[10px] bg-[#240f2b] text-zinc-300 border border-[#381642] px-1.5 py-0.5 rounded font-mono font-bold">{s}</span>
                              ))}
                              {n.tags.slice(0, 2).map((t) => (
                                <span key={t} className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-semibold">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
    if (!signal) return 'text-slate-400';
    if (signal.includes('murah') || signal.includes('atas') || signal.includes('wajar')) return 'text-emerald-700 font-semibold';
    if (signal.includes('mahal') || signal.includes('berisiko') || signal.includes('bawah')) return 'text-rose-700 font-semibold';
    return 'text-slate-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">SUCCESS</span>;
      case 'no_candidates':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">NO CANDIDATES</span>;
      case 'error':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">ERROR</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-full">{status.toUpperCase()}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-slate-600 font-medium">Memuat Daily Market Brief...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <span>📈</span> Daily Market Brief
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Riwayat trigger market open/close dengan data berita dan watchlist</p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Riwayat Run (30 hari terakhir)</h2>
            <span className="text-xs text-slate-500">{logs.length} logs</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                Belum ada data. Jalankan trigger terlebih dahulu.
              </div>
            ) : (
              logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => fetchLogDetail(log)}
                  className={`w-full p-4 text-left hover:bg-slate-50/80 transition cursor-pointer ${
                    selectedLog?.id === log.id ? 'bg-rose-50/60 border-l-4 border-rose-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-900">
                      {formatDate(log.trigger_date)}
                    </span>
                    {getStatusBadge(log.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Sesi: <strong className="text-slate-800 capitalize">{log.session}</strong></span>
                    <span>IHSG: <strong className="text-slate-800 font-mono">{formatNumber(log.ihsg_price, 0)}</strong></span>
                    <span className={`font-mono font-bold ${log.ihsg_change && log.ihsg_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {log.ihsg_change && log.ihsg_change >= 0 ? '+' : ''}{formatNumber(log.ihsg_change)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-800">Pilih salah satu run di sebelah kiri</p>
              <p className="text-xs text-slate-500 mt-1">Detail kandidat, berita, dan top movers akan ditampilkan di sini.</p>
            </div>
          ) : detailLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 text-center text-slate-400 flex items-center justify-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full" />
              <span>Memuat rincian run...</span>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="font-bold text-rose-600 mb-3 text-sm uppercase tracking-wider">Run Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-0.5">Data Date:</span>
                    <span className="font-semibold text-slate-900">{formatDate(selectedLog.data_date)}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-0.5">Sesi:</span>
                    <span className="font-semibold text-slate-900 capitalize">{selectedLog.session}</span>
                  </div>
                  <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block mb-0.5">Reasoning:</span>
                    <span className="text-xs text-slate-700 leading-relaxed">{selectedLog.reasoning || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Top Movers */}
              {movers.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">Pergerakan Top Movers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                        <span>🚀</span> Top Gainers
                      </p>
                      <div className="space-y-1.5">
                        {movers.filter(m => m.classification === 'top_gainers').map((m) => (
                          <div key={m.id} className="flex justify-between items-center text-xs">
                            <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">{m.symbol}</span>
                            <span className="text-emerald-600 font-mono font-bold">+{formatNumber(m.price_change)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1.5">
                        <span>🔻</span> Top Losers
                      </p>
                      <div className="space-y-1.5">
                        {movers.filter(m => m.classification === 'top_losers').map((m) => (
                          <div key={m.id} className="flex justify-between items-center text-xs">
                            <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">{m.symbol}</span>
                            <span className="text-rose-600 font-mono font-bold">{formatNumber(m.price_change)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidates */}
              {candidates.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                    <span>🎯</span> Watchlist Candidates ({candidates.length})
                  </h3>
                  <div className="space-y-3">
                    {candidates.map((c) => (
                      <div key={c.id} className="border border-slate-200 bg-slate-50 rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-amber-800 font-mono text-sm bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">{c.ticker}</span>
                          <span className="text-xs text-slate-500">{c.company_name}</span>
                        </div>
                        <p className="text-xs text-slate-800 mb-2.5 leading-relaxed">{c.news_title}</p>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="bg-white p-2 rounded-lg text-center border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-500 block">PER</span>
                            <p className={getSignalColor(c.pe_signal)}>{formatNumber(c.pe_ratio)}x</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg text-center border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-500 block">PBV</span>
                            <p className={getSignalColor(c.pbv_signal)}>{formatNumber(c.pb_ratio)}x</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg text-center border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-500 block">ROE</span>
                            <p className={getSignalColor(c.roe_signal)}>{formatNumber(c.roe)}%</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg text-center border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-500 block">DER</span>
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
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">Skipped Tickers ({skipped.length})</h3>
                  <div className="space-y-2">
                    {skipped.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{s.ticker}</span>
                        <span className="text-slate-600">{s.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {news.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">Berita Terkait ({news.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {news.map((n) => (
                      <div key={n.id} className={`text-sm p-3 rounded-xl border ${n.is_selected ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 text-xs mt-0.5 font-mono">{n.news_index}.</span>
                          <div>
                            <p className="text-slate-800 text-xs leading-relaxed">{n.title}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {n.symbols.slice(0, 3).map((s) => (
                                <span key={s} className="text-[10px] bg-white text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold shadow-2xs">{s}</span>
                              ))}
                              {n.tags.slice(0, 2).map((t) => (
                                <span key={t} className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-semibold">{t}</span>
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

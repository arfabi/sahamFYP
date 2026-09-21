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
    if (!signal) return 'text-slate-500';
    if (signal.includes('murah') || signal.includes('atas') || signal.includes('wajar')) return 'text-green-600';
    if (signal.includes('mahal') || signal.includes('berisiko') || signal.includes('bawah')) return 'text-red-600';
    return 'text-slate-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Success</span>;
      case 'no_candidates':
        return <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">No Candidates</span>;
      case 'error':
        return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Error</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📈 Daily Market Brief</h1>
          <p className="text-sm text-slate-500 mt-1">Riwayat trigger market open/close dengan data berita dan watchlist</p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          🔄 Refresh
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Riwayat Run (30 hari terakhir)</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Belum ada data. Jalankan trigger terlebih dahulu.
              </div>
            ) : (
              logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => fetchLogDetail(log)}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition ${
                    selectedLog?.id === log.id ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">
                      {formatDate(log.trigger_date)}
                    </span>
                    {getStatusBadge(log.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Session: <span className="font-medium">{log.session}</span></span>
                    <span>IHSG: <span className="font-medium">{formatNumber(log.ihsg_price, 0)}</span></span>
                    <span className={log.ihsg_change && log.ihsg_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {log.ihsg_change && log.ihsg_change >= 0 ? '+' : ''}{formatNumber(log.ihsg_change)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
              <p>Pilih salah satu run di sebelah kiri untuk melihat detail</p>
            </div>
          ) : detailLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
              Loading detail...
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h3 className="font-semibold text-slate-800 mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Data Date:</span>
                    <span className="ml-2 font-medium">{formatDate(selectedLog.data_date)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Reasoning:</span>
                    <span className="ml-2 font-medium">{selectedLog.reasoning || '-'}</span>
                  </div>
                </div>
              </div>
              {/* Top Movers */}
              {movers.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">Top Movers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-2">🟢 Top Gainers</p>
                      <div className="space-y-1">
                        {movers.filter(m => m.classification === 'top_gainers').map((m) => (
                          <div key={m.id} className="flex justify-between text-sm">
                            <span className="font-medium">{m.symbol}</span>
                            <span className="text-green-600">+{formatNumber(m.price_change)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-600 mb-2">🔴 Top Losers</p>
                      <div className="space-y-1">
                        {movers.filter(m => m.classification === 'top_losers').map((m) => (
                          <div key={m.id} className="flex justify-between text-sm">
                            <span className="font-medium">{m.symbol}</span>
                            <span className="text-red-600">{formatNumber(m.price_change)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidates */}
              {candidates.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">Watchlist Candidates</h3>
                  <div className="space-y-3">
                    {candidates.map((c) => (
                      <div key={c.id} className="border border-slate-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-800">{c.ticker}</span>
                          <span className="text-xs text-slate-500">{c.company_name}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{c.news_title}</p>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">PER</span>
                            <p className={getSignalColor(c.pe_signal)}>{formatNumber(c.pe_ratio)}x</p>
                          </div>
                          <div>
                            <span className="text-slate-400">PBV</span>
                            <p className={getSignalColor(c.pbv_signal)}>{formatNumber(c.pb_ratio)}x</p>
                          </div>
                          <div>
                            <span className="text-slate-400">ROE</span>
                            <p className={getSignalColor(c.roe_signal)}>{formatNumber(c.roe)}%</p>
                          </div>
                          <div>
                            <span className="text-slate-400">DER</span>
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
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">Skipped</h3>
                  <div className="space-y-2">
                    {skipped.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600">{s.ticker}</span>
                        <span className="text-slate-400 text-xs">{s.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {news.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">Berita ({news.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {news.map((n) => (
                      <div key={n.id} className={`text-sm p-2 rounded ${n.is_selected ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 text-xs mt-0.5">{n.news_index}.</span>
                          <div>
                            <p className="text-slate-700">{n.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {n.symbols.slice(0, 3).map((s) => (
                                <span key={s} className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                              ))}
                              {n.tags.slice(0, 2).map((t) => (
                                <span key={t} className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">{t}</span>
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

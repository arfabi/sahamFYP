// ============================================================
// Stock Watchlist - read-only history of Daily Market Brief
// candidates (sector_trigger_*). Reuses the same Supabase tables
// populated by api/sector-trigger/{open,close}.tsx.
// ============================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

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
  price: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  roe: number | null;
  der: number | null;
  avg_sector_pe: number | null;
  avg_sector_pb: number | null;
  avg_sector_roe: number | null;
  avg_sector_der: number | null;
  pe_signal: string | null;
  pbv_signal: string | null;
  roe_signal: string | null;
  der_signal: string | null;
  created_at: string;
}

interface TriggerMover {
  id: string;
  classification: 'top_gainers' | 'top_losers';
  symbol: string;
  company_name: string | null;
  price_change: number | null;
}

interface TriggerSkipped {
  id: string;
  ticker: string;
  reason: string | null;
}

export default function StockWatchlist() {
  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [selected, setSelected] = useState<TriggerLog | null>(null);
  const [candidates, setCandidates] = useState<TriggerCandidate[]>([]);
  const [movers, setMovers] = useState<TriggerMover[]>([]);
  const [skipped, setSkipped] = useState<TriggerSkipped[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      if (list.length > 0) await fetchLogDetail(list[0]);
    } catch (e) {
      console.error('fetchLogs error', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogDetail = async (log: TriggerLog) => {
    setSelected(log);
    setDetailLoading(true);
    try {
      const [candRes, movRes, skpRes] = await Promise.all([
        supabase.from('sector_trigger_candidates').select('*').eq('log_id', log.id),
        supabase.from('sector_trigger_movers').select('*').eq('log_id', log.id),
        supabase.from('sector_trigger_skipped').select('*').eq('log_id', log.id),
      ]);
      setCandidates((candRes.data as TriggerCandidate[]) || []);
      setMovers((movRes.data as TriggerMover[]) || []);
      setSkipped((skpRes.data as TriggerSkipped[]) || []);
    } catch (e) {
      console.error('fetchLogDetail error', e);
    } finally {
      setDetailLoading(false);
    }
  };

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtNum = (n: number | null, d = 2) =>
    n == null ? '-' : n.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

  const signalBadge = (s: string | null) => {
    if (!s) return <span className="text-slate-400 text-xs">-</span>;
    let bg = 'bg-slate-100 text-slate-600';
    if (s.includes('murah') || s.includes('atas') || s.includes('wajar')) {
      bg = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (s.includes('mahal') || s.includes('berisiko') || s.includes('bawah')) {
      bg = 'bg-rose-50 text-rose-700 border border-rose-200';
    }
    return (
      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${bg}`}>
        {s}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      no_candidates: 'bg-amber-100 text-amber-800 border border-amber-200',
      error: 'bg-rose-100 text-rose-800 border border-rose-200',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-700'}`}>
        {status.toUpperCase()}
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
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-slate-600 font-medium">Memuat Watchlist...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            👁️ Stock Watchlist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kandidat saham pilihan AI dari Daily Market Brief & Katalis Pasar
          </p>
        </div>
        {/* Selector Session */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase px-2">Session Run:</span>
          <select
            value={selected?.id || ''}
            onChange={(e) => {
              const l = logs.find((x) => x.id === e.target.value);
              if (l) fetchLogDetail(l);
            }}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {logs.map((l) => (
              <option key={l.id} value={l.id}>
                {fmtDate(l.trigger_date)} · {l.session === 'open' ? '☀️ Open (08:00 WIB)' : '🌙 Close'} · {l.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!logs.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-5xl block mb-3">📭</span>
          <p className="text-base font-medium text-slate-700">Belum ada data watchlist</p>
          <p className="text-xs text-slate-400 mt-1">Jalankan Market Brief via trigger API / n8n terlebih dahulu.</p>
        </div>
      ) : detailLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
          <div className="animate-spin w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full" />
          <span className="ml-2 text-sm text-slate-500">Memuat rincian kandidat...</span>
        </div>
      ) : (
        <>
          {/* Summary KPIs Banner */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-400 font-medium block">Sesi Market</span>
              <span className="text-base font-bold text-slate-800 mt-1 block">
                {selected?.session === 'open' ? '☀️ Open' : '🌙 Close'}
              </span>
              <span className="text-xs text-slate-500">{selected?.trigger_date}</span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-400 font-medium block">Ticker Terpilih</span>
              <span className="text-2xl font-bold text-amber-600 mt-1 block">
                {selected?.tickers_selected || 0}
              </span>
              <span className="text-xs text-slate-500">Emiten Unggulan</span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-400 font-medium block">Berita Di-Scan</span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">
                {selected?.news_fetched || 0}
              </span>
              <span className="text-xs text-slate-500">Artikel Berita</span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-400 font-medium block">Sectors Credits</span>
              <span className="text-2xl font-bold text-purple-600 mt-1 block">
                {selected?.credits_used || 0}
              </span>
              <span className="text-xs text-slate-500">Credit Dipakai</span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm col-span-2 md:col-span-1 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium block">Status Run</span>
              <div className="mt-1">{statusBadge(selected?.status || 'unknown')}</div>
              <span className="text-xs text-slate-400 mt-1 truncate">{selected?.error_message || 'OK'}</span>
            </div>
          </div>

          {/* Search & Header table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">📋 Daftar Saham Terpilih</h2>
                <p className="text-xs text-slate-500">Kandidat dengan katalis & fundamental terbaik</p>
              </div>
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari Ticker / Nama / Sektor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200 text-left">
                    <th className="py-3 px-4">Ticker</th>
                    <th className="py-3 px-4">Perusahaan</th>
                    <th className="py-3 px-4">Sektor</th>
                    <th className="py-3 px-4 text-right">Harga</th>
                    <th className="py-3 px-2 text-center">PER Signal</th>
                    <th className="py-3 px-2 text-center">PBV Signal</th>
                    <th className="py-3 px-2 text-center">ROE Signal</th>
                    <th className="py-3 px-2 text-center">DER Signal</th>
                    <th className="py-3 px-4">Berita Utama & Katalis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-amber-50/50 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-mono text-xs">
                          {c.ticker}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-[180px] truncate" title={c.company_name || ''}>
                        {c.company_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                        {c.sector || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                        {fmtNum(c.price, 0)}
                      </td>
                      <td className="py-3 px-2 text-center">{signalBadge(c.pe_signal)}</td>
                      <td className="py-3 px-2 text-center">{signalBadge(c.pbv_signal)}</td>
                      <td className="py-3 px-2 text-center">{signalBadge(c.roe_signal)}</td>
                      <td className="py-3 px-2 text-center">{signalBadge(c.der_signal)}</td>
                      <td className="py-3 px-4 max-w-[280px]">
                        <p className="text-xs text-slate-700 truncate" title={c.news_title || ''}>
                          {c.news_title || '-'}
                        </p>
                        {c.news_tags && c.news_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.news_tags.slice(0, 2).map((t, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCandidates.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Tidak ada kandidat saham yang sesuai dengan filter.
                </div>
              )}
            </div>
          </div>

          {/* Movers Grid */}
          {movers.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {(['top_gainers', 'top_losers'] as const).map((cls) => {
                const list = movers.filter((m) => m.classification === cls);
                if (!list.length) return null;
                const isGainer = cls === 'top_gainers';
                return (
                  <div key={cls} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isGainer ? 'text-emerald-700' : 'text-rose-700'}`}>
                      <span>{isGainer ? '🚀 Top Gainers Market' : '🔻 Top Losers Market'}</span>
                    </h3>
                    <div className="space-y-2">
                      {list.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                          <div>
                            <span className="font-mono font-bold text-xs text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 mr-2">
                              {m.symbol}
                            </span>
                            <span className="text-xs text-slate-600 truncate max-w-[150px] inline-block align-bottom">
                              {m.company_name}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-xs font-bold ${
                              m.price_change == null
                                ? 'text-slate-400'
                                : m.price_change >= 0
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {m.price_change != null
                              ? `${m.price_change > 0 ? '+' : ''}${fmtNum(m.price_change, 2)}%`
                              : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Skipped detail Accordion */}
          {skipped.length > 0 && (
            <details className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-sm group">
              <summary className="cursor-pointer font-semibold text-slate-700 flex items-center justify-between select-none">
                <span>📋 Skipped Tickers Audit ({skipped.length} emiten dilewati)</span>
                <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                {skipped.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-lg bg-slate-50 text-xs">
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mr-2">
                      {s.ticker}
                    </span>
                    <span className="text-slate-600">{s.reason || 'Tanpa alasan terurai'}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}



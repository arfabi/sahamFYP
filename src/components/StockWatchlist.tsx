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
  news_body: string | null;
  price: number | null;
  market_cap: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  roe: number | null;
  der: number | null;
  revenue: number | null;
  net_income: number | null;
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
            Kandidat saham pilihan AI dari Daily Market Brief & Katalis Pasar <span className="text-amber-600 font-semibold">(Klik baris untuk detail lengkap)</span>
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
                <p className="text-xs text-slate-500">Klik salah satu baris untuk melihat analisis detail (Fundamental + Technical)</p>
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
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setActiveModalCandidate(c)}
                      className="hover:bg-amber-50/70 cursor-pointer transition"
                    >
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
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalCandidate(c);
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-lg transition"
                        >
                          Detail
                        </button>
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

      {/* Stock Candidate Detail Modal */}
      {activeModalCandidate && (
        <StockCandidateDetailModal
          candidate={activeModalCandidate}
          onClose={() => setActiveModalCandidate(null)}
        />
      )}
    </div>
  );
}

function StockCandidateDetailModal({
  candidate: c,
  onClose,
}: {
  candidate: TriggerCandidate;
  onClose: () => void;
}) {
  const fmtNum = (n: number | null | undefined, d = 2) =>
    n == null ? '-' : n.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

  const tech = c.technical_json || {};
  const tags = c.news_tags || [];

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 rounded-t-2xl flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-500 text-slate-950 font-extrabold font-mono text-base rounded-lg">
                {c.ticker}
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-medium">
                {c.sector || 'Sektor N/A'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2">{c.company_name || c.ticker}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span>Harga Terakhir: <strong className="font-mono text-amber-400 text-base">Rp {fmtNum(c.price, 0)}</strong></span>
              {c.market_cap && <span>Market Cap: <strong className="text-slate-300">Rp {fmtNum(c.market_cap / 1e12, 2)} T</strong></span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tags & Investment Horizon */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Tags & Sentimen</span>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      t.toLowerCase().includes('bullish')
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.toLowerCase().includes('bearish')
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t}
                  </span>
                ))}
                {!tags.length && <span className="text-xs text-slate-400">Tidak ada tag</span>}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Horizon / Trading Style</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 font-semibold text-xs rounded-lg">
                ⚡ Swing / Short-term Katalis
              </span>
            </div>
          </div>

          {/* Berita Utama & Katalis */}
          {c.news_title && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
                📰 Berita Utama & Katalis
              </h3>
              <p className="font-bold text-slate-900 text-base">{c.news_title}</p>
              {c.news_body && (
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">{c.news_body}</p>
              )}
            </div>
          )}

          {/* Data Fundamental Lengkap */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              📊 Data Fundamental vs Rata-Rata Sektor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* PER */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 block">PER (Price to Earnings)</span>
                <span className="text-lg font-extrabold text-slate-800 font-mono block mt-1">
                  {c.pe_ratio != null ? `${fmtNum(c.pe_ratio)}x` : 'N/A'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Rata-rata Sektor: {c.avg_sector_pe != null ? `${fmtNum(c.avg_sector_pe)}x` : 'N/A'}
                </span>
                <div className="mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 block text-center">
                    {c.pe_signal ? `${c.pe_signal} dari rata-rata sektor` : '-'}
                  </span>
                </div>
              </div>

              {/* PBV */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 block">PBV (Price to Book Value)</span>
                <span className="text-lg font-extrabold text-slate-800 font-mono block mt-1">
                  {c.pb_ratio != null ? `${fmtNum(c.pb_ratio)}x` : 'N/A'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Rata-rata Sektor: {c.avg_sector_pb || c.avg_sector_pbv ? `${fmtNum(c.avg_sector_pb || c.avg_sector_pbv)}x` : 'N/A'}
                </span>
                <div className="mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 block text-center">
                    {c.pbv_signal ? `${c.pbv_signal} dari rata-rata sektor` : '-'}
                  </span>
                </div>
              </div>

              {/* ROE */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 block">ROE (Return on Equity)</span>
                <span className="text-lg font-extrabold text-slate-800 font-mono block mt-1">
                  {c.roe != null ? `${fmtNum(c.roe)}%` : 'N/A'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Rata-rata Sektor: {c.avg_sector_roe != null ? `${fmtNum(c.avg_sector_roe)}%` : 'N/A'}
                </span>
                <div className="mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 block text-center">
                    {c.roe_signal ? `${c.roe_signal} rata-rata sektor` : '-'}
                  </span>
                </div>
              </div>

              {/* DER */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 block">DER (Debt to Equity)</span>
                <span className="text-lg font-extrabold text-slate-800 font-mono block mt-1">
                  {c.der != null ? `${fmtNum(c.der)}x` : 'N/A'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Rata-rata Sektor: {c.avg_sector_der != null ? `${fmtNum(c.avg_sector_der)}x` : 'N/A'}
                </span>
                <div className="mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 block text-center">
                    {c.der_signal ? `${c.der_signal} dibanding sektor` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Technical Lengkap */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              📈 Data Teknikal & Pergerakan Harga
            </h3>
            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block">Harga Terakhir</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{fmtNum(tech.last || c.price, 0)}</span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block">MA20 (Support)</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">{fmtNum(tech.ma20, 0)}</span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block">Chg 1D</span>
                  <span className={`font-mono font-bold text-sm ${String(tech.chg1d).includes('-') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {tech.chg1d || '-'}
                  </span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block">Chg 5D</span>
                  <span className={`font-mono font-bold text-sm ${String(tech.chg5d).includes('-') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {tech.chg5d || '-'}
                  </span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block">Chg 20D</span>
                  <span className={`font-mono font-bold text-sm ${String(tech.chg20d).includes('-') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {tech.chg20d || '-'}
                  </span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block">Volume Signal</span>
                  <span className="font-mono font-bold text-purple-400 text-sm">{tech.volumeSignal || 'normal'}</span>
                </div>
              </div>

              {/* vibeCheck & Trigger */}
              {(tech.vibeCheck || tech.trigger) && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  {tech.vibeCheck && (
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Vibe Check Gen Z</span>
                      <p className="text-sm font-semibold text-amber-300">{tech.vibeCheck}</p>
                    </div>
                  )}
                  {tech.trigger && (
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Trading Trigger & Key Support</span>
                      <p className="text-xs text-slate-200 leading-relaxed">{tech.trigger}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}



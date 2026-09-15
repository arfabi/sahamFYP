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

  const signalColor = (s: string | null) => {
    if (!s) return 'text-slate-400';
    if (s.includes('murah') || s.includes('atas') || s.includes('wajar')) return 'text-green-700';
    if (s.includes('mahal') || s.includes('berisiko') || s.includes('bawah')) return 'text-red-700';
    return 'text-slate-600';
  };
  const signalBadge = (s: string | null, i: number) => (
    <span key={i} className={`text-xs font-medium px-1.5 py-0.25 rounded ${signalColor(s)}`}>
      {s || '-'}
    </span>
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      success: 'bg-green-100 text-green-700',
      no_candidates: 'bg-amber-100 text-amber-700',
      error: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-slate-100 text-slate-700'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">👁️ Stock Watchlist</h1>
        <p className="text-sm text-slate-500 mt-1">Kandidat saham dari Daily Market Brief (read-only history).</p>
      </div>

      {/* Run selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <label className="text-xs font-semibold uppercase text-slate-500 mb-2 block">Pilih run</label>
        <select
          value={selected?.id || ''}
          onChange={(e) => {
            const l = logs.find((x) => x.id === e.target.value);
            if (l) fetchLogDetail(l);
          }}
          className="w-full md:w-80 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
          {logs.map((l) => (
            <option key={l.id} value={l.id}>
              {fmtDate(l.trigger_date)} · {l.session === 'open' ? '📈 Open' : '📉 Close'} · {l.status}
            </option>
          ))}
        </select>
      </div>

      {!logs.length ? (
        <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
          <span className="text-3xl block mb-2">🕐</span>
          <p>
            Belum ada data watchlist. Jalankan <strong className="text-slate-600">Market Brief</strong> dulu di grup
            Automation.
          </p>
        </div>
      ) : detailLoading ? (
        <div className="text-slate-500">Memuat kandidat…</div>
            ) : (
        <>
          {/* Run summary banner */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-slate-500">Run:</span>{' '}
              <strong className="text-slate-800">
                {selected?.session === 'open' ? 'Market Open' : 'Market Close'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Tanggal:</span>{' '}
              <strong className="text-slate-800">{selected?.trigger_date}</strong>
            </div>
            <div>
              <span className="text-slate-500">Ticker terpilih:</span>{' '}
              <strong className="text-slate-800">{selected?.tickers_selected}</strong>
            </div>
            <div>
              <span className="text-slate-500">Berita:</span>{' '}
              <strong className="text-slate-800">{selected?.news_fetched}</strong>
            </div>
            <div>
              <span className="text-slate-500">Credits:</span>{' '}
              <strong className="text-slate-800">{selected?.credits_used}</strong>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{' '}
              {statusBadge(selected?.status || 'unknown')}
            </div>
          </div>

          {/* Candidates table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-slate-800">Watchlist Candidates</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase">
                <tr>
                  <th className="text-left px-4 py-2">Ticker</th>
                  <th className="text-left px-4 py-2">Perusahaan</th>
                  <th className="text-left px-4 py-2">Sektor</th>
                  <th className="text-right px-4 py-2">Harga</th>
                  <th className="text-center px-1 py-2" colSpan={4}>
                    Signal vs Sektor (PE / PBV / ROE / DER)
                  </th>
                  <th className="text-left px-4 py-2">Berita (judul)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800">{c.ticker}</td>
                    <td className="px-4 py-2">{c.company_name || '-'}</td>
                    <td className="px-4 py-2 text-slate-600">{c.sector || '-'}</td>
                    <td className="px-4 py-2 text-right">{fmtNum(c.price, 0)}</td>
                    <td className="px-1 py-2 text-center">{signalBadge(c.pe_signal, 0)}</td>
                    <td className="px-1 py-2 text-center">{signalBadge(c.pbv_signal, 1)}</td>
                    <td className="px-1 py-2 text-center">{signalBadge(c.roe_signal, 2)}</td>
                    <td className="px-1 py-2 text-center">{signalBadge(c.der_signal, 3)}</td>
                    <td className="px-4 py-2 text-slate-600">{c.news_title || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {candidates.length === 0 && (
              <div className="p-6 text-center text-slate-400">Tidak ada kandidat pada run ini.</div>
            )}
          </div>

                    {/* Top movers */}
          {movers.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {(['top_gainers', 'top_losers'] as const).map((cls) => {
                const list = movers.filter((m) => m.classification === cls);
                if (!list.length) return null;
                return (
                  <div key={cls} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      {cls === 'top_gainers' ? '📈 Top Gainers' : '📉 Top Losers'}
                    </h3>
                    <ul className="space-y-1.5 text-sm">
                      {list.map((m) => (
                        <li key={m.id} className="flex justify-between">
                          <span>
                            {m.symbol}{' '}
                            <span className="text-slate-500">({m.company_name})</span>
                          </span>
                          <span
                            className={
                              m.price_change == null
                                ? 'text-slate-400'
                                : m.price_change >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {m.price_change != null
                              ? `${m.price_change > 0 ? '+' : ''}${fmtNum(m.price_change, 2)}`
                              : '-'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Skipped (audit) */}
          {skipped.length > 0 && (
            <details className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-sm">
              <summary className="cursor-pointer font-medium text-slate-700">
                📋 Skipped tickers ({skipped.length}) — klik untuk lihat alasan
              </summary>
              <ul className="mt-2 list-disc list-inside text-slate-600 space-y-1">
                {skipped.map((s) => (
                  <li key={s.id}>
                    {s.ticker} — {s.reason || 'tanpa alasan'}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}



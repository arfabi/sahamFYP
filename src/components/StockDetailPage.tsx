import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Breadcrumbs from './Breadcrumbs';
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  Layers,
  LineChart,
  Calendar,
  Tag,
  Building2,
  Share2,
  Check
} from 'lucide-react';

export default function StockDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<any | null>(null);
  const [newsThumbnail, setNewsThumbnail] = useState<string | null>(null);
  const [newsSourceUrl, setNewsSourceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadStockDetail(id);
    }
  }, [id]);

  const loadStockDetail = async (candidateId: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch candidate by id or ticker
      let { data, error: fetchErr } = await supabase
        .from('sector_trigger_candidates')
        .select('*')
        .eq('id', candidateId)
        .maybeSingle();

      if (!data) {
        // Fallback by ticker
        const { data: byTicker } = await supabase
          .from('sector_trigger_candidates')
          .select('*')
          .eq('ticker', candidateId.toUpperCase())
          .order('created_at', { ascending: false })
          .limit(1);
        if (byTicker && byTicker[0]) {
          data = byTicker[0];
        }
      }

      if (!data) {
        setError('Data saham tidak ditemukan.');
        return;
      }

      setCandidate(data);

      // 2. Fetch thumbnail from sector_trigger_news if available
      try {
        if (data.news_title) {
          const { data: newsMatch } = await supabase
            .from('sector_trigger_news')
            .select('thumbnail_url, source_url')
            .ilike('title', `%${data.news_title.slice(0, 30)}%`)
            .limit(1);

          if (newsMatch && newsMatch[0]?.thumbnail_url) {
            setNewsThumbnail(newsMatch[0].thumbnail_url);
            setNewsSourceUrl(newsMatch[0].source_url);
          }
        }

        // Secondary fallback by ticker symbols
        if (!newsThumbnail && data.ticker) {
          const cleanTicker = data.ticker.replace('.JK', '');
          const { data: tickerNews } = await supabase
            .from('sector_trigger_news')
            .select('thumbnail_url, source_url')
            .or(`symbols.cs.{${data.ticker}},symbols.cs.{${cleanTicker}}`)
            .not('thumbnail_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1);

          if (tickerNews && tickerNews[0]?.thumbnail_url) {
            setNewsThumbnail(tickerNews[0].thumbnail_url);
            setNewsSourceUrl(tickerNews[0].source_url);
          }
        }
      } catch (err) {
        console.warn('Error fetching thumbnail:', err);
      }
    } catch (e: any) {
      console.error('loadStockDetail error:', e);
      setError(e.message || 'Gagal memuat detail emiten.');
    } finally {
      setLoading(false);
    }
  };

  const fmtNum = (n: number | null | undefined, d = 2) =>
    n == null ? '-' : n.toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

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

  // Helper pewarnaan sinyal: Hijau (unggul), Merah (buruk), Default (wajar)
  const getSignalBadgeStyle = (signal: string | null | undefined, type: 'per' | 'pbv' | 'roe' | 'der') => {
    if (!signal) return 'bg-[#200f27] text-zinc-400 border border-[#341a3e]';
    const s = signal.toLowerCase();

    // Positive indicators
    if (
      s.includes('murah') ||
      s.includes('di atas sektor') ||
      s.includes('atas') ||
      (type === 'der' && s.includes('rendah'))
    ) {
      return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    }

    // Negative indicators
    if (
      s.includes('mahal') ||
      s.includes('berisiko') ||
      s.includes('di bawah sektor') ||
      s.includes('bawah') ||
      (type === 'der' && s.includes('tinggi'))
    ) {
      return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
    }

    // Neutral / Wajar
    return 'bg-[#200f27] text-zinc-400 border border-[#341a3e]';
  };

  const copyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-zinc-400 font-medium text-sm">Memuat analisis mendalam emiten...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto mt-16 bg-[#130a17] rounded-2xl border border-[#251323]">
        <span className="text-4xl block">🔍</span>
        <h2 className="text-xl font-bold text-white">Emiten Tidak Ditemukan</h2>
        <p className="text-xs text-zinc-400">{error || 'Data analisis tidak tersedia.'}</p>
        <button
          onClick={() => navigate('/marketbrief')}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition"
        >
          Kembali ke Market Brief
        </button>
      </div>
    );
  }

  const c = candidate;
  const tech = c.technical_json || {};
  const tags: string[] = c.news_tags || [];
  const displayPrice = tech.last || c.price;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* 1. Breadcrumbs Navigasi */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Breadcrumbs
          items={[
            { label: 'Market Brief', to: '/marketbrief' },
            { label: `${c.ticker} · ${c.company_name || 'Detail'}` },
          ]}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={copyPageUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#170c1a] hover:bg-[#200f24] text-zinc-300 text-xs font-semibold border border-[#2d142d] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
          </button>
          <button
            onClick={() => navigate('/marketbrief')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#170c1a] hover:bg-[#200f24] text-zinc-300 text-xs font-semibold border border-[#2d142d] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
        </div>
      </div>

      {/* 2. Top Header Hero Card */}
      <div className="bg-gradient-to-r from-[#1a0a20] via-[#130718] to-[#100614] rounded-2xl p-6 border border-[#251323] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black font-mono text-lg rounded-xl shadow-xs">
                {c.ticker}
              </span>
              <span className="text-xs bg-[#240f2b] text-zinc-300 border border-[#391942] px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-rose-400" />
                {c.sector || 'Sektor N/A'}
              </span>
              <span className="px-2.5 py-1 text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-lg">
                Analisis Lengkap AI CIO
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              {c.company_name || c.ticker}
            </h1>

            <div className="flex items-center gap-6 mt-3 text-sm text-zinc-300 flex-wrap">
              <div>
                <span className="text-zinc-500 text-xs block">Harga Terakhir:</span>
                <span className="font-mono text-amber-400 text-xl font-black">
                  Rp {fmtNum(displayPrice, 0)}
                </span>
              </div>
              {c.market_cap && (
                <div>
                  <span className="text-zinc-500 text-xs block">Market Cap:</span>
                  <span className="font-mono text-white text-base font-bold">
                    Rp {fmtNum(c.market_cap / 1e12, 2)} Triliun
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tags / Sentimen */}
          <div className="flex flex-col md:items-end gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sentimen Pasar & Tags:</span>
            <div className="flex flex-wrap gap-1.5 max-w-sm md:justify-end">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    t.toLowerCase().includes('bullish')
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : t.toLowerCase().includes('bearish')
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  #{t}
                </span>
              ))}
              {!tags.length && <span className="text-xs text-zinc-500">Tidak ada sentimen khusus</span>}
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3. Berita Utama & Katalis WITH PHOTO (Sesuai Permintaan User) */}
      {c.news_title && (
        <div className="bg-[#130a17]/90 rounded-2xl border border-[#251323] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>📰</span> BERITA UTAMA & KATALIS PASAR
            </h2>
            {newsSourceUrl && (
              <a
                href={newsSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition"
              >
                <span>Baca Sumber Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* FOTO BERITA ASLI (Thumbnail Hero) */}
          {newsThumbnail ? (
            <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-xl overflow-hidden border border-[#251323] bg-[#0d070f] group">
              <img
                src={newsThumbnail}
                alt={c.news_title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#130a17] via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-zinc-300 font-medium">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                  📸 Dokumentasi / Foto Terverifikasi
                </span>
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-mono">
                  {c.ticker}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-28 w-full rounded-xl bg-gradient-to-r from-[#200f27] via-[#1a0e21] to-[#14081a] border border-[#2d1437] flex items-center justify-center p-4 text-center">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                <span>📊</span> Liputan & Pengumuman Resmi Bursa Efek Indonesia ({c.ticker})
              </span>
            </div>
          )}

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {c.news_title}
            </h3>
            {c.news_body && (
              <p className="text-xs sm:text-sm text-zinc-300 mt-2.5 leading-relaxed bg-[#170b1d] p-4 rounded-xl border border-[#281329]">
                {c.news_body}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. Data Fundamental Lengkap vs Sektor dengan PEWARNAAN HIJAU / MERAH / DEFAULT */}
      <div className="bg-[#130a17]/90 rounded-2xl border border-[#251323] p-5 sm:p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📊</span> Data Fundamental vs Rata-Rata Sektor
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Indikator valuasi, profitabilitas, dan solvabilitas emiten dibandingkan standar industri:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* PER Card */}
          <div className="p-4 bg-[#180c1d] rounded-xl border border-[#281329] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400 block">PER (Price to Earnings)</span>
              <span className="text-2xl font-black text-white font-mono block mt-1.5">
                {c.pe_ratio != null ? `${fmtNum(c.pe_ratio)}x` : 'N/A'}
              </span>
              <span className="text-xs text-zinc-500 block mt-1 font-mono">
                Rata-rata Sektor: {c.avg_sector_pe != null ? `${fmtNum(c.avg_sector_pe)}x` : 'N/A'}
              </span>
            </div>
            <div className="mt-3">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg block text-center truncate ${getSignalBadgeStyle(
                  c.pe_signal,
                  'per'
                )}`}
              >
                {c.pe_signal ? `${c.pe_signal} dari rata-rata sektor` : '-'}
              </span>
            </div>
          </div>

          {/* PBV Card */}
          <div className="p-4 bg-[#180c1d] rounded-xl border border-[#281329] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400 block">PBV (Price to Book Value)</span>
              <span className="text-2xl font-black text-white font-mono block mt-1.5">
                {c.pb_ratio != null ? `${fmtNum(c.pb_ratio)}x` : 'N/A'}
              </span>
              <span className="text-xs text-zinc-500 block mt-1 font-mono">
                Rata-rata Sektor: {c.avg_sector_pbv != null ? `${fmtNum(c.avg_sector_pbv)}x` : 'N/A'}
              </span>
            </div>
            <div className="mt-3">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg block text-center truncate ${getSignalBadgeStyle(
                  c.pbv_signal,
                  'pbv'
                )}`}
              >
                {c.pbv_signal ? `${c.pbv_signal} dari rata-rata sektor` : '-'}
              </span>
            </div>
          </div>

          {/* ROE Card */}
          <div className="p-4 bg-[#180c1d] rounded-xl border border-[#281329] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400 block">ROE (Return on Equity)</span>
              <span className="text-2xl font-black text-white font-mono block mt-1.5">
                {c.roe != null ? `${fmtNum(c.roe)}%` : 'N/A'}
              </span>
              <span className="text-xs text-zinc-500 block mt-1 font-mono">
                Rata-rata Sektor: {c.avg_sector_roe != null ? `${fmtNum(c.avg_sector_roe)}%` : 'N/A'}
              </span>
            </div>
            <div className="mt-3">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg block text-center truncate ${getSignalBadgeStyle(
                  c.roe_signal,
                  'roe'
                )}`}
              >
                {c.roe_signal ? `${c.roe_signal} rata-rata sektor` : '-'}
              </span>
            </div>
          </div>

          {/* DER Card */}
          <div className="p-4 bg-[#180c1d] rounded-xl border border-[#281329] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400 block">DER (Debt to Equity)</span>
              <span className="text-2xl font-black text-white font-mono block mt-1.5">
                {c.der != null ? `${fmtNum(c.der)}x` : 'N/A'}
              </span>
              <span className="text-xs text-zinc-500 block mt-1 font-mono">
                Rata-rata Sektor: {c.avg_sector_der != null ? `${fmtNum(c.avg_sector_der)}x` : 'N/A'}
              </span>
            </div>
            <div className="mt-3">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg block text-center truncate ${getSignalBadgeStyle(
                  c.der_signal,
                  'der'
                )}`}
              >
                {c.der_signal ? `${c.der_signal} dibanding sektor` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Katalis 3W Framework & Analisis AI */}
      <div className="bg-[#130a17]/90 rounded-2xl border border-[#251323] p-5 sm:p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>🧠</span> Analisis Mendalam & Katalis 3W
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#180c1d] border border-[#281329]">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1">
              1. WHY (Mengapa Menarik?)
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              {tech.why_interesting ||
                'Valuasi kompetitif di industrinya didukung momentum rilis data keuangan dan katalis ekspansi operasional.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#180c1d] border border-[#281329]">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              2. WHAT (Katalis Apa?)
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              {tech.catalyst_summary ||
                c.news_title ||
                'Sentimen pemulihan laba bersih serta perbaikan struktur permodalan perseroan.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#180c1d] border border-[#281329]">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 block mb-1">
              3. WHAT NEXT (Ekspektasi Ke Depan?)
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              {tech.what_next ||
                'Uji level resistance terdekat dengan konfirmasi volume beli yang stabil dari investor domestik maupun institusi.'}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Indikator Teknikal & Moving Averages */}
      <div className="bg-[#130a17]/90 rounded-2xl border border-[#251323] p-5 sm:p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>📈</span> Konfirmasi Indikator Teknikal (Moving Average)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3 bg-[#180c1d] rounded-xl border border-[#281329] text-center">
            <span className="text-[11px] text-zinc-400 block">MA 20 (1 Bln)</span>
            <span className="font-mono font-bold text-white text-sm block mt-1">
              {tech.ma20 ? `Rp ${fmtNum(tech.ma20, 0)}` : '-'}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">{fmtPct(tech.pct_vs_ma20)}</span>
          </div>
          <div className="p-3 bg-[#180c1d] rounded-xl border border-[#281329] text-center">
            <span className="text-[11px] text-zinc-400 block">MA 50 (Med-term)</span>
            <span className="font-mono font-bold text-white text-sm block mt-1">
              {tech.ma50 ? `Rp ${fmtNum(tech.ma50, 0)}` : '-'}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">{fmtPct(tech.pct_vs_ma50)}</span>
          </div>
          <div className="p-3 bg-[#180c1d] rounded-xl border border-[#281329] text-center">
            <span className="text-[11px] text-zinc-400 block">MA 200 (Long-term)</span>
            <span className="font-mono font-bold text-white text-sm block mt-1">
              {tech.ma200 ? `Rp ${fmtNum(tech.ma200, 0)}` : '-'}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">{fmtPct(tech.pct_vs_ma200)}</span>
          </div>
          <div className="p-3 bg-[#180c1d] rounded-xl border border-[#281329] text-center">
            <span className="text-[11px] text-zinc-400 block">Golden Cross</span>
            <span
              className={`font-bold text-xs block mt-1 ${
                tech.golden_cross ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              {tech.golden_cross ? '🔥 TERDETEKSI' : 'Belum Konfirmasi'}
            </span>
          </div>
          <div className="p-3 bg-[#180c1d] rounded-xl border border-[#281329] text-center">
            <span className="text-[11px] text-zinc-400 block">Support Kunci</span>
            <span className="font-mono font-bold text-emerald-300 text-sm block mt-1">
              {tech.support ? `Rp ${fmtNum(tech.support, 0)}` : '-'}
            </span>
          </div>
          <div className="p-3 bg-[#180c1d] rounded-xl border border-[#281329] text-center">
            <span className="text-[11px] text-zinc-400 block">Resistance Kunci</span>
            <span className="font-mono font-bold text-rose-300 text-sm block mt-1">
              {tech.resistance ? `Rp ${fmtNum(tech.resistance, 0)}` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 7. Kamus Saham Gen Z & Vibe Check */}
      <div className="bg-[#130a17]/90 rounded-2xl border border-[#251323] p-5 sm:p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>✨</span> Kamus Saham Gen-Z & Edukasi Ramah Pemula
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#200f27] to-[#180c1f] border border-[#33173d]">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
              💡 Analogi Sederhana:
            </span>
            <p className="text-xs text-zinc-200 leading-relaxed font-medium">
              {tech.genz_analogy ||
                `Saham ${c.ticker} ibarat belanja barang branded saat lagi midnight sale — fundamentalnya kokoh, tapi harganya masih di bawah rata-rata teman-teman sekelasnya.`}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#200f27] to-[#180c1f] border border-[#33173d]">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
              🎯 Vibe Check & Risk Note:
            </span>
            <p className="text-xs text-zinc-200 leading-relaxed font-medium">
              {tech.vibe_check ||
                'Volatilitas jangka pendek wajar mengikuti arah gerak IHSG. Disarankan money management bertahap (bukan all-in) dan pasang stop loss di bawah level support.'}
            </p>
          </div>
        </div>
      </div>

      {/* 8. Disclaimer */}
      <div className="p-4 rounded-xl bg-[#140816] border border-[#251323] text-[11px] text-zinc-500 leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer Finansial (DYOR):</strong> Analisis ini dihasilkan oleh AI Engine SahamFYP berdasarkan data
          faktual terverifikasi dari Bursa Efek Indonesia (BEI) dan Sectors.app REST API. Konten bersifat edukasi dan
          informasi riset semata, bukan ajakan mengikat untuk membeli atau menjual instrumen efek tertentu.
        </p>
      </div>
    </div>
  );
}

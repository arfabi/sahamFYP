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
  Check,
  Activity,
  BarChart2,
  AlertTriangle,
  Target,
  Zap
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

  const fmtVolume = (v: number | null | undefined) => {
    if (v == null) return '-';
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)} Miliar lbr`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(2)} Juta lbr`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)} Ribu lbr`;
    return `${v.toLocaleString('id-ID')} lbr`;
  };

  // Helper pewarnaan sinyal: Hijau (unggul), Merah (buruk), Default (wajar)
  const getSignalBadgeStyle = (signal: string | null | undefined, type: 'per' | 'pbv' | 'roe' | 'der') => {
    if (!signal) return 'bg-slate-100 text-slate-600 border border-slate-200';
    const s = signal.toLowerCase();

    // 1. Rasio Valuasi (PER, PBV): Lebih KECIL / Murah dari sektor = Bagus (Hijau)
    if (type === 'per' || type === 'pbv') {
      if (s.includes('murah') || s.includes('diskon') || s.includes('di bawah')) {
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      }
      if (s.includes('mahal') || s.includes('berisiko') || s.includes('di atas') || s.includes('tinggi') || s.includes('rugi')) {
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      }
      return 'bg-slate-100 text-slate-600 border border-slate-200';
    }

    // 2. Rasio Profitabilitas (ROE): Lebih BESAR / Efisien dari sektor = Bagus (Hijau)
    if (type === 'roe') {
      if (s.includes('di atas') || s.includes('tinggi') || s.includes('efisien') || s.includes('bagus') || s.includes('unggul')) {
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      }
      if (s.includes('di bawah') || s.includes('rendah') || s.includes('rugi') || s.includes('negatif') || s.includes('defisit')) {
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      }
      return 'bg-slate-100 text-slate-600 border border-slate-200';
    }

    // 3. Rasio Utang (DER): Lebih KECIL / Rendah dari sektor = Aman/Bagus (Hijau)
    if (type === 'der') {
      if (s.includes('rendah') || s.includes('di bawah') || s.includes('aman') || s.includes('sehat')) {
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      }
      if (s.includes('tinggi') || s.includes('berisiko') || s.includes('di atas') || s.includes('melebihi')) {
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      }
      return 'bg-slate-100 text-slate-600 border border-slate-200';
    }

    // Neutral / Wajar
    return 'bg-slate-100 text-slate-600 border border-slate-200';
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
        <p className="text-slate-500 font-medium text-sm">Memuat analisis mendalam emiten...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto mt-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-4xl block">🔍</span>
        <h2 className="text-xl font-bold text-slate-900">Emiten Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">{error || 'Data analisis tidak tersedia.'}</p>
        <button
          onClick={() => navigate('/marketbrief')}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition"
        >
          Kembali ke Market Brief
        </button>
      </div>
    );
  }

  const c = candidate;
  const tech = typeof c?.technical_json === 'string'
    ? (() => { try { return JSON.parse(c.technical_json); } catch { return {}; } })()
    : (c?.technical_json || {});
  const tags: string[] = c.news_tags || [];
  const displayPrice = tech.last || c.price || 0;

  // Technical Calculations & Safe Mappings
  const ma20 = tech.ma20;
  const ma50 = tech.ma50;
  const ma200 = tech.ma200;
  const high52w = tech.high52w;
  const chg1d = tech.chg1d;
  const chg5d = tech.chg5d;
  const chg20d = tech.chg20d;

  const pctVsMa20 = tech.pct_vs_ma20 != null ? tech.pct_vs_ma20 : (displayPrice && ma20 ? ((displayPrice - ma20) / ma20) * 100 : null);
  const pctVsMa50 = tech.pct_vs_ma50 != null ? tech.pct_vs_ma50 : (displayPrice && ma50 ? ((displayPrice - ma50) / ma50) * 100 : null);
  const pctVsMa200 = tech.pct_vs_ma200 != null ? tech.pct_vs_ma200 : (displayPrice && ma200 ? ((displayPrice - ma200) / ma200) * 100 : null);
  const pctFromHigh52w = tech.pctFromHigh52w != null ? tech.pctFromHigh52w : (displayPrice && high52w ? ((displayPrice - high52w) / high52w) * 100 : null);

  const crossSignal = tech.crossSignal || (tech.golden_cross ? 'Golden Cross 🟢' : null);
  const supportLevel = tech.support || (ma20 ? `Rp ${fmtNum(ma20, 0)} (MA20)` : null);
  const resistanceLevel = tech.resistance || (high52w ? `Rp ${fmtNum(high52w, 0)} (52W High)` : null);
  const vibeCheck = tech.vibeCheck || tech.vibe_check;
  const triggerText = tech.trigger;
  const lastVolume = tech.lastVolume;
  const avgVol20 = tech.avgVol20;
  const volumeSignal = tech.volumeSignal;
  const volumeRatio = (lastVolume && avgVol20) ? (lastVolume / avgVol20) : null;
  const tldrText = tech.tldr;
  const warningText = tech.warning;

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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
          </button>
          <button
            onClick={() => navigate('/marketbrief')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
        </div>
      </div>

      {/* 2. Top Header Hero Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-black font-mono text-lg rounded-xl shadow-xs">
                {c.ticker}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-rose-600" />
                {c.sector || 'Sektor N/A'}
              </span>
              <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                Analisis Lengkap AI CIO
              </span>
              {crossSignal && (
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  crossSignal.toLowerCase().includes('bullish') || crossSignal.includes('🟢')
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : crossSignal.toLowerCase().includes('bearish') || crossSignal.includes('🔴') || crossSignal.toLowerCase().includes('death')
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {crossSignal}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
              {c.company_name || c.ticker}
            </h1>

            <div className="flex items-center gap-6 mt-3 text-sm text-slate-700 flex-wrap">
              <div>
                <span className="text-slate-500 text-xs block">Harga Terakhir:</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-amber-700 text-xl font-black">
                    Rp {fmtNum(displayPrice, 0)}
                  </span>
                  {chg1d != null && (
                    <span className={`text-xs font-mono font-bold ${chg1d >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {fmtPct(chg1d)} (1D)
                    </span>
                  )}
                </div>
              </div>
              {c.market_cap && (
                <div>
                  <span className="text-slate-500 text-xs block">Market Cap:</span>
                  <span className="font-mono text-slate-900 text-base font-bold">
                    Rp {fmtNum(c.market_cap / 1e12, 2)} Triliun
                  </span>
                </div>
              )}
              {supportLevel && (
                <div>
                  <span className="text-slate-500 text-xs block">Support Terdekat:</span>
                  <span className="font-mono text-emerald-700 text-sm font-bold">
                    {supportLevel}
                  </span>
                </div>
              )}
              {resistanceLevel && (
                <div>
                  <span className="text-slate-500 text-xs block">Resistance Terdekat:</span>
                  <span className="font-mono text-rose-700 text-sm font-bold">
                    {resistanceLevel}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tags / Sentimen */}
          <div className="flex flex-col md:items-end gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sentimen Pasar & Tags:</span>
            <div className="flex flex-wrap gap-1.5 max-w-sm md:justify-end">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    t.toLowerCase().includes('bullish')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : t.toLowerCase().includes('bearish')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  #{t}
                </span>
              ))}
              {!tags.length && <span className="text-xs text-slate-400">Tidak ada sentimen khusus</span>}
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-50/50 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3. Berita Utama & Katalis WITH PHOTO (Sesuai Permintaan User) */}
      {c.news_title && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
              <span>📰</span> BERITA UTAMA & KATALIS PASAR
            </h2>
            {newsSourceUrl && (
              <a
                href={newsSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition"
              >
                <span>Baca Sumber Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* FOTO BERITA ASLI (Thumbnail Hero) */}
          {newsThumbnail ? (
            <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
              <img
                src={newsThumbnail}
                alt={c.news_title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-white font-medium">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                  📸 Dokumentasi / Foto Terverifikasi
                </span>
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 font-mono">
                  {c.ticker}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-28 w-full rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-4 text-center">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>📊</span> Liputan & Pengumuman Resmi Bursa Efek Indonesia ({c.ticker})
              </span>
            </div>
          )}

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {c.news_title}
            </h3>
            {c.news_body && (
              <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {c.news_body}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. Data Fundamental Lengkap vs Sektor dengan PEWARNAAN HIJAU / MERAH / DEFAULT */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📊</span> Data Fundamental vs Rata-Rata Sektor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Indikator valuasi, profitabilitas, dan solvabilitas emiten dibandingkan standar industri:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* PER Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">PER (Price to Earnings)</span>
              <span className="text-2xl font-black text-slate-900 font-mono block mt-1.5">
                {c.pe_ratio != null ? `${fmtNum(c.pe_ratio)}x` : 'N/A'}
              </span>
              <span className="text-xs text-slate-400 block mt-1 font-mono">
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
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">PBV (Price to Book Value)</span>
              <span className="text-2xl font-black text-slate-900 font-mono block mt-1.5">
                {c.pb_ratio != null ? `${fmtNum(c.pb_ratio)}x` : 'N/A'}
              </span>
              <span className="text-xs text-slate-400 block mt-1 font-mono">
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
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">ROE (Return on Equity)</span>
              <span className="text-2xl font-black text-slate-900 font-mono block mt-1.5">
                {c.roe != null ? `${fmtNum(c.roe)}%` : 'N/A'}
              </span>
              <span className="text-xs text-slate-400 block mt-1 font-mono">
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
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">DER (Debt to Equity)</span>
              <span className="text-2xl font-black text-slate-900 font-mono block mt-1.5">
                {c.der != null ? `${fmtNum(c.der)}x` : 'N/A'}
              </span>
              <span className="text-xs text-slate-400 block mt-1 font-mono">
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
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>🧠</span> Analisis Mendalam & Katalis 3W
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-1">
              1. WHY (Mengapa Menarik?)
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {tech.why_interesting ||
                (triggerText ? triggerText : `Valuasi ${c.pe_signal || 'kompetitif'} di industri ${c.sector || 'terkait'} didukung katalis pergerakan harga terkini.`)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
              2. WHAT (Katalis Apa?)
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {tech.catalyst_summary ||
                c.news_title ||
                'Sentimen pemulihan laba bersih serta perbaikan struktur permodalan perseroan.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 block mb-1">
              3. WHAT NEXT (Ekspektasi Ke Depan?)
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {tech.what_next ||
                (supportLevel
                  ? `Menguji area resistance ${resistanceLevel || 'terdekat'} dengan batas support di ${supportLevel}.`
                  : 'Uji level resistance terdekat dengan konfirmasi volume beli yang stabil.')}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Indikator Teknikal, Moving Averages & Volume Command Center */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>Analisis Indikator Teknikal, MA & Volume</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Moving Average (MA), momentum pergerakan harga, dan likuiditas transaksi harian
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {tech.asOf && (
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                📅 Data per: {tech.asOf}
              </span>
            )}
            {crossSignal && (
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                crossSignal.toLowerCase().includes('bullish') || crossSignal.includes('🟢')
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : crossSignal.toLowerCase().includes('bearish') || crossSignal.includes('🔴') || crossSignal.toLowerCase().includes('death')
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {crossSignal}
              </span>
            )}
          </div>
        </div>

        {/* 8-Metric Grid: Moving Averages & Price Action */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            📊 Level Moving Average & Momentum Harga:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">Harga Terakhir</span>
              <span className="font-mono font-bold text-amber-700 text-sm block mt-1">
                Rp {fmtNum(displayPrice, 0)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Current</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">MA 20 (Support)</span>
              <span className="font-mono font-bold text-blue-700 text-sm block mt-1">
                {ma20 ? `Rp ${fmtNum(ma20, 0)}` : '-'}
              </span>
              <span className={`text-[10px] font-mono font-semibold block mt-0.5 ${
                pctVsMa20 != null && pctVsMa20 >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {fmtPct(pctVsMa20)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">MA 50 (Med-term)</span>
              <span className="font-mono font-bold text-cyan-700 text-sm block mt-1">
                {ma50 ? `Rp ${fmtNum(ma50, 0)}` : '-'}
              </span>
              <span className={`text-[10px] font-mono font-semibold block mt-0.5 ${
                pctVsMa50 != null && pctVsMa50 >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {fmtPct(pctVsMa50)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">MA 200 (Long-term)</span>
              <span className="font-mono font-bold text-indigo-700 text-sm block mt-1">
                {ma200 ? `Rp ${fmtNum(ma200, 0)}` : '-'}
              </span>
              <span className={`text-[10px] font-mono font-semibold block mt-0.5 ${
                pctVsMa200 != null && pctVsMa200 >= 0 ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {pctVsMa200 != null ? fmtPct(pctVsMa200) : '<200 hari'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">Chg 1 Hari</span>
              <span className={`font-mono font-bold text-sm block mt-1 ${
                chg1d != null && chg1d >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {fmtPct(chg1d)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">1D</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">Chg 5 Hari</span>
              <span className={`font-mono font-bold text-sm block mt-1 ${
                chg5d != null && chg5d >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {fmtPct(chg5d)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">1 Minggu</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">Chg 20 Hari</span>
              <span className={`font-mono font-bold text-sm block mt-1 ${
                chg20d != null && chg20d >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {fmtPct(chg20d)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">1 Bulan</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">52W High</span>
              <span className="font-mono font-bold text-amber-700 text-sm block mt-1">
                {high52w ? `Rp ${fmtNum(high52w, 0)}` : '-'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                {fmtPct(pctFromHigh52w)}
              </span>
            </div>
          </div>
        </div>

        {/* Volume & Likuiditas Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-purple-600" />
              <span>Analisis Volume Transaksi & Likuiditas:</span>
            </span>
            {volumeSignal && (
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize border ${
                volumeSignal === 'rame'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : volumeSignal === 'sepi'
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Volume: {volumeSignal === 'rame' ? '🔥 Rame (Breakout)' : volumeSignal === 'sepi' ? '💤 Sepi' : 'Normal'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">Volume Hari Ini:</span>
              <span className="font-mono font-bold text-slate-900 text-base block mt-0.5">
                {fmtVolume(lastVolume)}
              </span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">Rata-rata 20 Hari:</span>
              <span className="font-mono font-bold text-slate-700 text-base block mt-0.5">
                {fmtVolume(avgVol20)}
              </span>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">Aktivitas Likuiditas:</span>
              <span className="font-mono font-bold text-amber-700 text-base block mt-0.5">
                {volumeRatio ? `${volumeRatio.toFixed(1)}x` : '-'} dari rata-rata
              </span>
            </div>
          </div>
        </div>

        {/* Trigger, TLDR & Risk Warnings */}
        {(triggerText || tldrText || warningText) && (
          <div className="space-y-3 pt-2">
            {triggerText && (
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-1.5">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>Trading Trigger & Level Kunci:</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {triggerText}
                </p>
              </div>
            )}

            {tldrText && (
              <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-200">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5 mb-1.5">
                  <Zap className="w-4 h-4 text-sky-600" />
                  <span>TL;DR Ringkasan AI:</span>
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {tldrText}
                </p>
              </div>
            )}

            {warningText && (
              <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Awas / Catatan Risiko Teknikal:</span>
                </span>
                <p className="text-xs text-rose-800 leading-relaxed font-medium">
                  {warningText}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Kamus Saham Gen Z & Vibe Check */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>✨</span> Kamus Saham Gen-Z & Edukasi Ramah Pemula
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
              💡 Analogi Sederhana:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {tech.genz_analogy ||
                `Saham ${c.ticker} ibarat belanja barang branded saat lagi midnight sale — fundamentalnya kokoh, tapi harganya masih di bawah rata-rata teman-teman sekelasnya.`}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1">
              🎯 Vibe Check & Risk Note:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {vibeCheck ||
                'Volatilitas jangka pendek wajar mengikuti arah gerak IHSG. Disarankan money management bertahap (bukan all-in) dan pasang stop loss di bawah level support.'}
            </p>
          </div>
        </div>
      </div>

      {/* 8. Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer Finansial (DYOR):</strong> Analisis ini dihasilkan oleh AI Engine SahamFYP berdasarkan data
          faktual terverifikasi dari Bursa Efek Indonesia (BEI) dan Sectors.app REST API. Konten bersifat edukasi dan
          informasi riset semata, bukan ajakan mengikat untuk membeli atau menjual instrumen efek tertentu.
        </p>
      </div>
    </div>
  );
}

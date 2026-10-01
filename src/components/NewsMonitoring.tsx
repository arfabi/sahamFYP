import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Building2,
  Search,
  RotateCcw,
  ExternalLink,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  X,
  ChevronRight,
  Clock,
  Globe,
  Tag,
} from 'lucide-react';
import { supabase } from '../services/supabase';
import FeatureInfoCard from './FeatureInfoCard';

export interface NewsItem {
  id: string;
  title: string | null;
  body?: string | null;
  tags?: string[] | null;
  symbols?: string[] | null;
  sector?: string | null;
  sub_sectors?: string[] | null;
  source_url?: string | null;
  thumbnail_url?: string | null;
  score?: number | null;
  decision?: 'GENERATE' | 'PASS' | string | null;
  reason?: string | null;
  category?: string | null;
  published_at?: string | null;
  timestamp?: string | null;
  created_at?: string | null;
  is_selected?: boolean;
  dimensions?: Record<string, any> | null;
}

const PALETTE = ['#f43f5e', '#f97316', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', '#06b6d4'];

function fmtDate(iso: any) {
  if (!iso) return '-';
  try {
    let cleanIso = String(iso);
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/.test(cleanIso.trim())) {
      cleanIso = `${cleanIso.trim().replace(' ', 'T')}+07:00`;
    }
    const d = new Date(cleanIso);
    if (isNaN(d.getTime())) return '-';
    return (
      d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      }) +
      ' ' +
      d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }) +
      ' WIB'
    );
  } catch {
    return '-';
  }
}

const dateOf = (r: NewsItem) => r.published_at || r.timestamp || r.created_at || null;

const domainOf = (u?: string | null) => {
  if (!u) return '-';
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return '-';
  }
};

function getTodayStr() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getDaysAgoStr(days: number = 1) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export default function NewsMonitoring() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [detailItem, setDetailItem] = React.useState<NewsItem | null>(null);
  const [selectedTicker, setSelectedTicker] = React.useState<string | null>(null);

  // Filters
  const [decisionFilter, setDecisionFilter] = React.useState<'ALL' | 'GENERATE' | 'PASS'>('ALL');
  const [tagFilter, setTagFilter] = React.useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = React.useState<string | null>(null);
  const [symbolSearch, setSymbolSearch] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState<string>(getDaysAgoStr(1));
  const [endDate, setEndDate] = React.useState<string>(getTodayStr());
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<'cards' | 'table'>('cards');

  // Load Data
  const loadNews = React.useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('sector_trigger_news').select('*');
      if (sectorFilter) query = query.eq('sector', sectorFilter);
      if (tagFilter) query = query.contains('tags', [tagFilter]);
      if (startDate && endDate) {
        const start = `${startDate}T00:00:00+07:00`;
        const end = `${endDate}T23:59:59+07:00`;
        query = query.or(
          `and(published_at.gte.${start},published_at.lte.${end}),and(created_at.gte.${start},created_at.lte.${end})`
        );
      } else if (startDate) {
        const start = `${startDate}T00:00:00+07:00`;
        const end = `${startDate}T23:59:59+07:00`;
        query = query.or(
          `and(published_at.gte.${start},published_at.lte.${end}),and(created_at.gte.${start},created_at.lte.${end})`
        );
      } else if (endDate) {
        const end = `${endDate}T23:59:59+07:00`;
        query = query.or(`published_at.lte.${end},created_at.lte.${end}`);
      }

      query = query.order('published_at', { ascending: false }).limit(200);
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching news:', error);
        setRows([]);
      } else {
        setRows((data as NewsItem[]) || []);
      }
    } finally {
      setLoading(false);
    }
  }, [sectorFilter, tagFilter, startDate, endDate]);

  React.useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Load tag & sector options
  React.useEffect(() => {
    async function loadOpts() {
      const [tg, sc] = await Promise.all([
        supabase.from('sector_trigger_news').select('tags').limit(1000),
        supabase.from('sector_trigger_news').select('sector').limit(1000),
      ]);
      const at = new Set<string>();
      const as = new Set<string>();
      (tg.data || []).forEach((r: any) => {
        (r.tags || []).forEach((t: string) => {
          if (t) at.add(t);
        });
      });
      (sc.data || []).forEach((r: any) => {
        if (r.sector) as.add(r.sector);
      });
      setAvailableTags(Array.from(at).sort());
      setAvailableSectors(Array.from(as).sort());
    }
    loadOpts();
  }, []);

  // Filtered rows
  const filteredRows = React.useMemo(() => {
    let list = rows;

    // Filter decision
    if (decisionFilter === 'GENERATE') {
      list = list.filter((r) => r.decision === 'GENERATE' || (r.score ?? 0) >= 9);
    } else if (decisionFilter === 'PASS') {
      list = list.filter((r) => r.decision === 'PASS' || (r.score ?? 0) < 9);
    }

    // Filter ticker search
    if (symbolSearch.trim()) {
      const term = symbolSearch.trim().toLowerCase();
      list = list.filter((r) =>
        (r.symbols || []).some((s) => (s || '').toLowerCase().includes(term))
      );
    }

    return list;
  }, [rows, decisionFilter, symbolSearch]);

  // Metrics
  const totalInView = filteredRows.length;
  const countGenerate = rows.filter((r) => r.decision === 'GENERATE' || (r.score ?? 0) >= 9).length;
  const countPass = rows.filter((r) => r.decision === 'PASS' || (r.score ?? 0) < 9).length;

  // Emiten breakdown
  const tickerCounts: Record<string, number> = {};
  for (const r of rows) {
    for (const s of r.symbols || []) {
      const t = (s || '').replace(/\.JK$/i, '');
      if (t) tickerCounts[t] = (tickerCounts[t] || 0) + 1;
    }
  }
  const topTickersData = Object.entries(tickerCounts)
    .map(([ticker, count]) => ({ ticker, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const totalTickersCount = Object.keys(tickerCounts).length;

  const tickerNews = selectedTicker
    ? rows.filter((r) =>
        (r.symbols || []).some((s) => (s || '').replace(/\.JK$/i, '') === selectedTicker)
      )
    : [];

  // Top Tags Chart
  const tagCounts: Record<string, number> = {};
  for (const r of filteredRows) {
    for (const t of r.tags || []) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
  }
  const topTagsData = Object.entries(tagCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Top Sectors Chart
  const sectorCounts: Record<string, number> = {};
  for (const r of filteredRows) {
    const k = r.sector || 'Uncategorized';
    sectorCounts[k] = (sectorCounts[k] || 0) + 1;
  }
  const topSectorsData = Object.entries(sectorCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const resetAllFilters = () => {
    setDecisionFilter('ALL');
    setTagFilter(null);
    setSectorFilter(null);
    setSymbolSearch('');
    setStartDate(getDaysAgoStr(1));
    setEndDate(getTodayStr());
  };

  const isFiltered =
    decisionFilter !== 'ALL' ||
    tagFilter !== null ||
    sectorFilter !== null ||
    symbolSearch !== '' ||
    startDate !== getDaysAgoStr(1) ||
    endDate !== getTodayStr();

  return (
    <div className="space-y-7 text-slate-800 font-sans pb-16">
      {/* ─── 1. Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>News Monitoring & AI Decision Feed</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring agregasi berita emiten, evaluasi scoring otomatis AI, dan sentimen pasar modal real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadNews()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-900 transition flex items-center gap-2 active:scale-95 shadow-xs cursor-pointer"
            title="Muat ulang berita terbaru"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-rose-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Feature Info Card (Collapsible) ───────────────────── */}
      <FeatureInfoCard
        id="news-monitoring"
        title="Arsitektur AI News Monitoring & Scoring Engine"
        badge="SOURCES & SCORING"
        description="Pusat agregasi berita & keterbukaan informasi emiten BEI. Otomasi n8n secara berkala meng-crawling berita, lalu LLM mengevaluasi kelayakan publikasi ke Instagram carousel @sahamfyp."
        functionality="Menyajikan feed berita terfilter dengan ekstraksi otomatis ticker saham, klasifikasi sektor, sentimen pasar, dan skor objektif (0-10) penentu GENERATE vs PASS."
        dataSource="Hasil crawling otomatis portal berita terpercaya (IDX Channel, CNBC Indonesia, Bisnis.com, Kontan) & Sectors.app News API."
        pipeline="n8n Trigger -> Scrape -> Classify (/api/classify) -> Score AI (/api/score) -> Simpan ke Supabase (sector_trigger_news) -> Auto Broadcast."
        links={[
          { label: 'Sectors.app News API', url: 'https://sectors.app/api' },
          { label: 'IDX Keterbukaan Informasi', url: 'https://www.idx.co.id' },
        ]}
      />

      {/* ─── 3. KPI Metrics Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Berita */}
        <div className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-4 transition-all duration-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Berita Terpantau</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{rows.length}</span>
            <span className="text-xs text-sky-600 font-semibold">artikel</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Periode filter aktif</div>
        </div>

        {/* Card 2: Lolos Konten (GENERATE) */}
        <div
          onClick={() => setDecisionFilter('GENERATE')}
          className={`bg-white border rounded-2xl p-4 transition-all duration-200 shadow-xs cursor-pointer relative overflow-hidden group ${
            decisionFilter === 'GENERATE'
              ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Lolos (GENERATE)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{countGenerate}</span>
            <span className="text-xs text-emerald-800 font-bold px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-200">
              Score ≥ 9
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Siap di-generate post</span>
            <span className="text-[10px] text-emerald-600 font-bold group-hover:underline">Filter ini →</span>
          </div>
        </div>

        {/* Card 3: Ditolak (PASS) */}
        <div
          onClick={() => setDecisionFilter('PASS')}
          className={`bg-white border rounded-2xl p-4 transition-all duration-200 shadow-xs cursor-pointer relative overflow-hidden group ${
            decisionFilter === 'PASS'
              ? 'border-rose-500 bg-rose-50/60 ring-1 ring-rose-500/30'
              : 'border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Ditolak (PASS)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{countPass}</span>
            <span className="text-xs text-rose-800 font-bold px-1.5 py-0.5 rounded bg-rose-100 border border-rose-200">
              Score &lt; 9
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Katalis kurang / fluff</span>
            <span className="text-[10px] text-rose-600 font-bold group-hover:underline">Filter ini →</span>
          </div>
        </div>

        {/* Card 4: Tickers */}
        <div className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-4 transition-all duration-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emiten Terdeteksi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalTickersCount}</span>
            <span className="text-xs text-amber-700 font-semibold">saham BEI</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Total ticker unik</div>
        </div>
      </div>

      {/* ─── 4. Interactive Filter & Control Center ───────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Quick Filter: Segmented Decision Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs">
            <button
              onClick={() => setDecisionFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                decisionFilter === 'ALL'
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Berita ({rows.length})
            </button>
            <button
              onClick={() => setDecisionFilter('GENERATE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                decisionFilter === 'GENERATE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hanya Lolos ({countGenerate})</span>
            </button>
            <button
              onClick={() => setDecisionFilter('PASS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                decisionFilter === 'PASS'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Hanya Ditolak ({countPass})</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kartu Modern"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel Rinci"
            >
              <TableIcon className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>
        </div>

        {/* Detailed Filters (Date, Tag, Sector, Symbol) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-rose-600" /> Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500/50"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-rose-600" /> Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500/50"
            />
          </div>

          {/* Sektor Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-sky-600" /> Sektor
            </label>
            <select
              value={sectorFilter || ''}
              onChange={(e) => setSectorFilter(e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500/50"
            >
              <option value="">Semua Sektor ({availableSectors.length})</option>
              {availableSectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-amber-600" /> Topik Tag
            </label>
            <select
              value={tagFilter || ''}
              onChange={(e) => setTagFilter(e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500/50"
            >
              <option value="">Semua Tag ({availableTags.length})</option>
              {availableTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Ticker Search */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
              <Search className="w-3 h-3 text-rose-600" /> Cari Ticker
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari Ticker (cth: HRTA)..."
                value={symbolSearch}
                onChange={(e) => setSymbolSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500/50 uppercase placeholder:normal-case placeholder:text-slate-400 font-mono font-bold"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {symbolSearch && (
                <button
                  onClick={() => setSymbolSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Reset & Active Tag Bar */}
        {isFiltered && (
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 text-[11px]">Filter Aktif:</span>
              {decisionFilter !== 'ALL' && (
                <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-[10px] font-bold">
                  Status: {decisionFilter}
                </span>
              )}
              {sectorFilter && (
                <span className="px-2 py-0.5 bg-sky-50 border border-sky-200 text-sky-700 rounded-md text-[10px] font-bold">
                  Sektor: {sectorFilter}
                </span>
              )}
              {tagFilter && (
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-[10px] font-bold">
                  Tag: {tagFilter}
                </span>
              )}
              {symbolSearch && (
                <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-md text-[10px] font-bold">
                  Ticker: {symbolSearch.toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={resetAllFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline shrink-0 cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* ─── 5. Visual Charts (Clean Light Minimalist) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Top Sektor */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Top Sektor Terbanyak</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">Total {topSectorsData.length}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Distribusi berita berdasarkan sektor industri BEI</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topSectorsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {topSectorsData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
            {topSectorsData.slice(0, 4).map((s, i) => (
              <span
                key={s.name}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center gap-1.5 text-slate-700"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                <span>{s.name} ({s.value})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Chart 2: Top Tag Katalis */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Kategori & Katalis Tag</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">Top 6</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Kategori aksi korporasi & sentimen emiten</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topTagsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {topTagsData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[(i + 3) % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
            {topTagsData.slice(0, 4).map((t, i) => (
              <button
                key={t.name}
                onClick={() => setTagFilter(t.name)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center gap-1.5 text-slate-700 hover:text-rose-600 transition cursor-pointer"
                title={`Filter tag ${t.name}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PALETTE[(i + 3) % PALETTE.length] }} />
                <span>{t.name} ({t.value})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chart 3: Emiten Paling Sering Muncul (Bar Chart) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Emiten Trending di Berita</span>
              </h3>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">(Klik bar untuk filter)</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Ticker saham BEI dengan frekuensi berita tertinggi</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topTickersData}
                layout="vertical"
                onClick={(e: any) => {
                  if (e && e.activeLabel) {
                    setSelectedTicker(e.activeLabel);
                  }
                }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="ticker"
                  width={55}
                  tick={{ fill: '#d97706', fontSize: 11, fontWeight: 'bold' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} style={{ cursor: 'pointer' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-center text-slate-500 mt-2">
            Klik nama emiten untuk melihat berita spesifik
          </p>
        </div>
      </div>

      {/* ─── 6. Feed Berita Utama (Cards / Table View) ─────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Feed Berita Terpantau ({totalInView})
            </h2>
            {totalInView > 0 && (
              <span className="text-xs text-slate-500 font-mono">
                Menampilkan {Math.min(totalInView, 60)} artikel terbaru
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-24 flex flex-col items-center justify-center text-slate-500 gap-3 shadow-xs">
            <div className="animate-spin w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full shadow-xs" />
            <p className="text-xs font-semibold tracking-wide">Memuat agregasi berita...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-20 text-center text-slate-500 space-y-3 shadow-xs">
            <span className="text-4xl block">📭</span>
            <p className="text-base font-bold text-slate-900">Tidak ada berita yang cocok dengan filter</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Coba sesuaikan tanggal, cari ticker lain, atau klik reset filter di atas.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* ─── CARD VIEW (Modern Grid) ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredRows.slice(0, 60).map((r) => {
              const isGenerate = r.decision === 'GENERATE' || (r.score ?? 0) >= 9;
              const symbols = r.symbols || [];
              const tags = r.tags || [];

              return (
                <div
                  key={r.id}
                  className="bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-md transition-all duration-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs relative group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Media, Time, and Ticker */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-rose-600" />
                          {domainOf(r.source_url)}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {fmtDate(dateOf(r)).split(' ')[0]}
                        </span>
                      </div>

                      {/* Ticker Badges */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {symbols.slice(0, 2).map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setSymbolSearch(s)}
                            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-mono font-bold text-[11px] rounded-lg tracking-wider transition cursor-pointer"
                            title={`Filter emiten ${s}`}
                          >
                            ${s.replace(/\.JK$/i, '')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Thumbnail & Title */}
                    <div className="space-y-2">
                      {r.thumbnail_url && (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={r.thumbnail_url}
                            alt={r.title || 'Thumbnail'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
                        </div>
                      )}

                      <h3
                        onClick={() => navigate(`/news/${r.id}`)}
                        className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-rose-600 transition cursor-pointer"
                        title={r.title || ''}
                      >
                        {r.title || '-'}
                      </h3>
                    </div>

                    {/* ─── AI DECISION & SCORE BOX (Intuitif & Jelas) ─── */}
                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        isGenerate
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                            isGenerate
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {isGenerate ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GENERATE (LOLOS)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" /> PASS (DITOLAK)
                            </>
                          )}
                        </span>

                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                            isGenerate
                              ? 'bg-white text-emerald-800 border-emerald-200 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 shadow-xs'
                          }`}
                        >
                          Skor {r.score ?? (isGenerate ? 9 : 0)}/10
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed italic line-clamp-3 mt-1">
                        "{r.reason || 'Dievaluasi berdasarkan katalis pasar modal, data kuantitatif, dan keterkaitan emiten BEI.'}"
                      </p>
                    </div>

                    {/* Tags row */}
                    {tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {tags.slice(0, 3).map((tag, idx) => {
                          const isBull = tag.toLowerCase() === 'bullish';
                          const isBear = tag.toLowerCase() === 'bearish';
                          return (
                            <span
                              key={idx}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                isBull
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isBear
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                        {r.sector && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 ml-auto">
                            {r.sector}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => navigate(`/news/${r.id}`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {r.source_url && (
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-slate-500 hover:text-slate-900 transition flex items-center gap-1 hover:underline"
                        title="Buka portal berita asli"
                      >
                        <span>Sumber</span>
                        <ExternalLink className="w-3 h-3 text-rose-600" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── TABLE VIEW (Compact Details) ─── */
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold tracking-wider uppercase text-[10px]">
                    <th className="py-3 px-4">Waktu (WIB)</th>
                    <th className="py-3 px-4">Emiten</th>
                    <th className="py-3 px-4">Judul Berita</th>
                    <th className="py-3 px-4">Keputusan AI</th>
                    <th className="py-3 px-4">Skor</th>
                    <th className="py-3 px-4">Sektor / Tag</th>
                    <th className="py-3 px-4">Media</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.slice(0, 60).map((r) => {
                    const isGenerate = r.decision === 'GENERATE' || (r.score ?? 0) >= 9;
                    const symbols = r.symbols || [];

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {fmtDate(dateOf(r))}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {symbols.slice(0, 2).map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-[11px]"
                              >
                                {s.replace(/\.JK$/i, '')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <span
                            onClick={() => setDetailItem(r)}
                            className="font-bold text-slate-900 hover:text-rose-600 transition cursor-pointer line-clamp-2"
                            title={r.title || ''}
                          >
                            {r.title || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              isGenerate
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isGenerate ? 'GENERATE ✅' : 'PASS ❌'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                          <span className={isGenerate ? 'text-emerald-700' : 'text-slate-500'}>
                            {r.score ?? (isGenerate ? 9 : 0)}/10
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {r.sector && (
                              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold">
                                {r.sector}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {domainOf(r.source_url)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/news/${r.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-semibold transition cursor-pointer"
                          >
                            Detail
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
      </div>

      {/* ─── 7. Modals: Ticker Modal & Deep Detail Modal ──────────── */}
      {selectedTicker && tickerNews.length > 0 && (
        <TickerModal
          ticker={selectedTicker}
          news={tickerNews}
          onClose={() => setSelectedTicker(null)}
          onDetail={(item) => {
            setSelectedTicker(null);
            setDetailItem(item);
          }}
        />
      )}

      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />}
    </div>
  );
}

// ─── Modal 1: Berita Per Ticker (Clean Light Minimalist) ─────────────
function TickerModal({
  ticker,
  news,
  onClose,
  onDetail,
}: {
  ticker: string;
  news: NewsItem[];
  onClose: () => void;
  onDetail: (item: NewsItem) => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold flex items-center justify-center text-sm shadow-xs">
              ${ticker}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Arsip Berita Emiten: ${ticker}</h3>
              <p className="text-xs text-slate-500">Total {news.length} artikel terpantau</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2.5">
          {news.map((r) => {
            const isGen = r.decision === 'GENERATE' || (r.score ?? 0) >= 9;
            return (
              <div
                key={r.id}
                onClick={() => onDetail(r)}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-rose-300 cursor-pointer transition flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isGen
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isGen ? 'GENERATE' : 'PASS'} (Skor {r.score ?? 0})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {fmtDate(dateOf(r))}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{r.title || '-'}</h4>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Modal 2: Deep Detail Berita (Clean Light Minimalist) ──────
function DetailModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const tags = item.tags || [];
  const syms = item.symbols || [];
  const subSectors = item.sub_sectors || [];
  const dims = item.dimensions || null;
  const isGenerate = item.decision === 'GENERATE' || (item.score ?? 0) >= 9;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  isGenerate
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {isGenerate ? 'GENERATE ✅' : 'PASS ❌'}
              </span>
              <span className="text-xs font-mono font-bold text-amber-700">
                Skor AI: {item.score ?? (isGenerate ? 9 : 0)}/10
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {item.title || 'Detail Berita'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Thumbnail */}
          {item.thumbnail_url && (
            <div className="rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-slate-100">
              <img
                src={item.thumbnail_url}
                alt={item.title || ''}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* AI Decision Box */}
          <div
            className={`p-4 rounded-xl border ${
              isGenerate
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-900">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Evaluasi AI & Justifikasi Keputusan:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              "{item.reason || 'Tidak ada catatan alasan khusus.'}"
            </p>
          </div>

          {/* Metadata Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            {syms.map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold"
              >
                ${s.replace(/\.JK$/i, '')}
              </span>
            ))}
            {item.sector && (
              <span className="px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-lg text-xs font-semibold text-sky-700">
                Sektor: {item.sector}
              </span>
            )}
            {subSectors.length > 0 && (
              <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs font-semibold text-purple-700">
                Sub: {subSectors.join(', ')}
              </span>
            )}
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Date & Portal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block mb-0.5">Waktu Terbit:</span>
              <span className="font-semibold text-slate-900 font-mono">{fmtDate(dateOf(item))}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Portal Berita Asli:</span>
              <a
                href={item.source_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline truncate"
              >
                <span className="truncate">{item.source_url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          {/* Article Body */}
          {item.body && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Ringkasan / Isi Berita:
              </h4>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line max-h-60 overflow-y-auto">
                {item.body}
              </div>
            </div>
          )}

          {/* Dimensions */}
          {dims && typeof dims === 'object' && Object.keys(dims).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Dimensi Fundamental Tambahan:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(dims).map(([k, v]) => (
                  <span
                    key={k}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
                  >
                    <span className="text-slate-500">{k}:</span> <b className="text-slate-900">{String(v)}</b>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
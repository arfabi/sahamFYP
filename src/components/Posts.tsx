// Posts - daftar semua postingan dalam SATU list (scheduled | published | failed | generated).
// Header menyediakan shortcut ke Content Generator & Manual Editor, filter tanggal, dan pagination.
import React, { useState, useEffect, useMemo } from 'react';
import { generatedPostsApi, automationPostsApi, type GeneratedPost, type AutomationPost } from '../services/supabase';
import PostListRow from './PostListRow';
import AutomationPostRow from './AutomationPostRow';
import AutomationPostCard from './AutomationPostCard';
import ManualPostCard from './ManualPostCard';
import PostDetailView from './PostDetailView';
import FeatureInfoCard from './FeatureInfoCard';

function toLocalDateString(isoStr?: string): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayStr(): string {
  return toLocalDateString(new Date().toISOString());
}

function getDaysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toLocalDateString(d.toISOString());
}

function getFirstDayOfMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function Posts({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [manualPosts, setManualPosts] = useState<GeneratedPost[]>([]);
  const [autoPosts, setAutoPosts] = useState<AutomationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'automation' | 'manual'>('automation');
  const [selectedPost, setSelectedPost] = useState<{
    post: AutomationPost | GeneratedPost;
    type: 'automation' | 'manual';
  } | null>(null);

  // Filter states
  const [workflowFilter, setWorkflowFilter] = useState<'all' | 'news_monitoring' | 'daily_market_brief'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  useEffect(() => {
    void fetchPosts();
  }, []);

  // Reset pagination on filter or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, workflowFilter, startDate, endDate, searchQuery, pageSize]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const [manualData, autoData] = await Promise.all([
        generatedPostsApi.getAll(250),
        automationPostsApi.getAll(250)
      ]);
      setManualPosts((manualData as GeneratedPost[]) || []);
      setAutoPosts((autoData as AutomationPost[]) || []);
    } catch (e) {
      console.error('fetchPosts error', e);
    } finally {
      setLoading(false);
    }
  }

  // Preset handlers
  const applyPreset = (preset: 'all' | 'today' | '7days' | '30days' | 'month') => {
    const today = getTodayStr();
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === '7days') {
      setStartDate(getDaysAgoStr(7));
      setEndDate(today);
    } else if (preset === '30days') {
      setStartDate(getDaysAgoStr(30));
      setEndDate(today);
    } else if (preset === 'month') {
      setStartDate(getFirstDayOfMonthStr());
      setEndDate(today);
    }
  };

  const isFilterActive = Boolean(startDate || endDate || searchQuery || workflowFilter !== 'all');

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setWorkflowFilter('all');
  };

  // Counts by workflow type for quick badges
  const newsMonitoringCount = useMemo(
    () => autoPosts.filter((p) => p.workflow_type === 'news_monitoring').length,
    [autoPosts]
  );
  const dailyBriefCount = useMemo(
    () => autoPosts.filter((p) => p.workflow_type === 'daily_market_brief').length,
    [autoPosts]
  );

  // Filtered & sorted data
  const filteredAuto = useMemo(() => {
    return autoPosts
      .filter((post) => {
        // Filter by workflow type
        if (workflowFilter !== 'all' && post.workflow_type !== workflowFilter) {
          return false;
        }

        const postDate = toLocalDateString(post.created_at);
        if (startDate && postDate < startDate) return false;
        if (endDate && postDate > endDate) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCaption = (post.caption || '').toLowerCase().includes(q);
          const matchWorkflow = (post.workflow_type || '').toLowerCase().includes(q);
          const matchAccount = (post.account_id || '').toLowerCase().includes(q);
          if (!matchCaption && !matchWorkflow && !matchAccount) return false;
        }
        return true;
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [autoPosts, workflowFilter, startDate, endDate, searchQuery]);

  const filteredManual = useMemo(() => {
    return manualPosts
      .filter((post) => {
        const postDate = toLocalDateString(post.created_at || post.updated_at);
        if (startDate && postDate < startDate) return false;
        if (endDate && postDate > endDate) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchBadge = (post.badge_text || '').toLowerCase().includes(q);
          const matchHandle = (post.handle || '').toLowerCase().includes(q);
          if (!matchBadge && !matchHandle) return false;
        }
        return true;
      })
      .sort((a, b) => (b.updated_at || b.created_at).localeCompare(a.updated_at || a.created_at));
  }, [manualPosts, startDate, endDate, searchQuery]);

  // Current active list and pagination calculations
  const currentList = activeTab === 'automation' ? filteredAuto : filteredManual;
  const totalItems = currentList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const paginatedList = currentList.slice(startIndex, startIndex + pageSize);

  // Pagination page numbers generator
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('...');
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (selectedPost) {
    return (
      <PostDetailView
        post={selectedPost.post}
        type={selectedPost.type}
        onBack={() => {
          setSelectedPost(null);
          void fetchPosts();
        }}
        onPostUpdated={() => {
          void fetchPosts();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#130a17]/70 backdrop-blur-md p-5 rounded-2xl border border-[#251323]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <span>🗂️</span> Posts
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1">Riwayat publikasi konten (Otomatis & Manual).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void fetchPosts()}
            disabled={loading}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white bg-[#1a0e21] border border-[#341a3e] rounded-xl hover:border-rose-500/40 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Refresh Data"
          >
            <span>🔄</span> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => onNavigate?.('generator')}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-rose-950/40 cursor-pointer"
          >
            <span>📝</span> Content Generator
          </button>
          <button
            onClick={() => onNavigate?.('manual')}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-rose-950/40 cursor-pointer"
          >
            <span>✏️</span> Manual Editor
          </button>
        </div>
      </div>

      <FeatureInfoCard
        id="posts"
        title="Tentang Manajemen Posts & Distribusi"
        badge="PUBLISHING"
        description="Pusat pemantauan seluruh konten publikasi SahamFYP baik hasil otomatisasi maupun pembuatan manual."
        functionality="Melihat pratinjau carousel slide, status jadwal antrean, hingga sinkronisasi tautan live post di media sosial secara real-time."
        dataSource="Data tersimpan di database Supabase (tabel automation_posts untuk alur n8n dan generated_posts untuk generator manual)."
        pipeline="Setiap postingan terhubung dengan Repliz API untuk distribusi otomatis ke platform Instagram, TikTok, Threads, FB, & Telegram, termasuk auto-check dan sinkronisasi status penerbitan."
        links={[
          { label: 'Repliz', url: 'https://repliz.com/' },
          { label: 'Supabase Database', url: 'https://supabase.com' }
        ]}
      />

      {/* Tabs & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#251323] pb-1">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('automation')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'automation'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🤖 Auto Posts ({filteredAuto.length}{autoPosts.length !== filteredAuto.length ? ` / ${autoPosts.length}` : ''})
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'manual'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ✍️ Manual Generator ({filteredManual.length}{manualPosts.length !== filteredManual.length ? ` / ${manualPosts.length}` : ''})
          </button>
        </div>

        {/* View Mode Toggle (Grid Card 3 Kolom vs List) */}
        <div className="flex items-center gap-1 bg-[#180b1d] p-1 rounded-xl border border-[#2d142d] mb-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-950/40'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Tampilan Card 3 Kolom"
          >
            <span>⊞</span>
            <span>Card (3 Kolom)</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-950/40'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Tampilan List Baris"
          >
            <span>☰</span>
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Sub-Filter: News Monitoring vs Daily Brief (Khusus Auto Posts) */}
      {activeTab === 'automation' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Workflow:</span>
          <button
            onClick={() => setWorkflowFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              workflowFilter === 'all'
                ? 'bg-[#281132] text-white border-rose-500/50 shadow-sm'
                : 'bg-[#1a0e21] text-zinc-400 border-[#281329] hover:text-white hover:border-rose-500/30'
            }`}
          >
            Semua ({autoPosts.length})
          </button>
          <button
            onClick={() => setWorkflowFilter('news_monitoring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
              workflowFilter === 'news_monitoring'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#1a0e21] text-zinc-400 border-[#281329] hover:text-white hover:border-amber-500/30'
            }`}
          >
            <span>📡</span>
            <span>News Monitoring ({newsMonitoringCount})</span>
          </button>
          <button
            onClick={() => setWorkflowFilter('daily_market_brief')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
              workflowFilter === 'daily_market_brief'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                : 'bg-[#1a0e21] text-zinc-400 border-[#281329] hover:text-white hover:border-blue-500/30'
            }`}
          >
            <span>📈</span>
            <span>Daily Market Brief ({dailyBriefCount})</span>
          </button>
        </div>
      )}

      {/* Date & Search Filter Card */}
      <div className="bg-[#130a17]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#251323] shadow-lg space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">📅 Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3.5 py-2 border border-[#341a3e] rounded-xl bg-[#1a0e21] text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">📅 Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3.5 py-2 border border-[#341a3e] rounded-xl bg-[#1a0e21] text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">🔍 Cari Post</label>
            <input
              type="text"
              placeholder={activeTab === 'automation' ? 'Cari caption, workflow, akun...' : 'Cari badge, handle...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#341a3e] rounded-xl bg-[#1a0e21] text-white placeholder-zinc-500 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-[#250f2e] border border-[#3c1748] rounded-xl transition self-end cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-2 flex-wrap pt-2 text-xs text-zinc-400 border-t border-[#251323]">
          <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[11px]">Preset Tanggal:</span>
          <button
            onClick={() => applyPreset('all')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer text-xs font-medium ${
              !startDate && !endDate ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-xs' : 'bg-[#1a0e21] border border-[#281329] hover:text-white text-zinc-400'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => applyPreset('today')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer text-xs font-medium ${
              startDate === getTodayStr() && endDate === getTodayStr()
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-xs'
                : 'bg-[#1a0e21] border border-[#281329] hover:text-white text-zinc-400'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => applyPreset('7days')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer text-xs font-medium ${
              startDate === getDaysAgoStr(7) && endDate === getTodayStr()
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-xs'
                : 'bg-[#1a0e21] border border-[#281329] hover:text-white text-zinc-400'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => applyPreset('30days')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer text-xs font-medium ${
              startDate === getDaysAgoStr(30) && endDate === getTodayStr()
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-xs'
                : 'bg-[#1a0e21] border border-[#281329] hover:text-white text-zinc-400'
            }`}
          >
            30 Hari Terakhir
          </button>
          <button
            onClick={() => applyPreset('month')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer text-xs font-medium ${
              startDate === getFirstDayOfMonthStr() && endDate === getTodayStr()
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-xs'
                : 'bg-[#1a0e21] border border-[#281329] hover:text-white text-zinc-400'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="text-zinc-400 py-16 text-center animate-pulse bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323]">
          <span className="text-3xl block mb-2">⏳</span>
          <p className="font-medium">Memuat postingan...</p>
        </div>
      ) : activeTab === 'automation' ? (
        autoPosts.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323]">
            <span className="text-4xl block mb-2">🤖</span>
            <p className="text-base font-semibold text-zinc-200">Belum ada postingan otomatis dari n8n.</p>
          </div>
        ) : filteredAuto.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323]">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="font-semibold text-zinc-200">Tidak ada postingan otomatis yang sesuai filter tanggal.</p>
            <p className="text-xs text-zinc-500 mt-1">Coba ubah rentang tanggal atau klik reset filter.</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold rounded-xl hover:opacity-95 transition cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(paginatedList as AutomationPost[]).map((p) => (
              <AutomationPostCard
                key={p.id}
                post={p}
                onSelect={() => setSelectedPost({ post: p, type: 'automation' })}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {(paginatedList as AutomationPost[]).map((p) => (
                <AutomationPostRow
                  key={p.id}
                  post={p}
                  onSelect={() => setSelectedPost({ post: p, type: 'automation' })}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        manualPosts.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323]">
            <span className="text-4xl block mb-2">🗂️</span>
            <p className="text-base font-semibold text-zinc-200">Belum ada postingan manual. Generate yang pertama dulu.</p>
            <button
              onClick={() => onNavigate?.('generator')}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-bold text-xs sm:text-sm hover:opacity-95 transition cursor-pointer"
            >
              📝 Generate Konten
            </button>
          </div>
        ) : filteredManual.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 bg-[#130a17]/80 backdrop-blur-md rounded-2xl border border-[#251323]">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="font-semibold text-zinc-200">Tidak ada postingan manual yang sesuai filter tanggal.</p>
            <p className="text-xs text-zinc-500 mt-1">Coba ubah rentang tanggal atau klik reset filter.</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold rounded-xl hover:opacity-95 transition cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(paginatedList as GeneratedPost[]).map((p) => (
              <ManualPostCard
                key={p.id}
                post={p}
                onSelect={() => setSelectedPost({ post: p, type: 'manual' })}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {(paginatedList as GeneratedPost[]).map((p) => (
                <PostListRow
                  key={p.id}
                  post={p}
                  onSelect={() => setSelectedPost({ post: p, type: 'manual' })}
                />
              ))}
            </div>
          </div>
        )
      )}

      {/* Pagination Controls */}
      {!loading && totalItems > 0 && (
        <div className="bg-[#130a17]/80 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-[#251323] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>
              Menampilkan <span className="font-bold text-white">{startIndex + 1}</span> -{' '}
              <span className="font-bold text-white">{Math.min(startIndex + pageSize, totalItems)}</span> dari{' '}
              <span className="font-bold text-white">{totalItems}</span> post
            </span>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1.5">
              <span>Per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-[#341a3e] rounded-lg bg-[#1a0e21] text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
              >
                <option value={6} className="bg-[#1a0e21]">6</option>
                <option value={9} className="bg-[#1a0e21]">9</option>
                <option value={12} className="bg-[#1a0e21]">12</option>
                <option value={18} className="bg-[#1a0e21]">18</option>
                <option value={30} className="bg-[#1a0e21]">30</option>
                <option value={60} className="bg-[#1a0e21]">60</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#341a3e] text-zinc-300 hover:text-white hover:bg-[#1a0e21] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              ‹ Sebelumnya
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((num, idx) =>
                num === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-zinc-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${num}`}
                    onClick={() => setCurrentPage(Number(num))}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition cursor-pointer ${
                      safePage === num
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-[#1a0e21]'
                    }`}
                  >
                    {num}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#341a3e] text-zinc-300 hover:text-white hover:bg-[#1a0e21] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Selanjutnya ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

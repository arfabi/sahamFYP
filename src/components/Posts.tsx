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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🗂️ Posts</h1>
          <p className="text-sm text-slate-500 mt-1">Riwayat publikasi konten (Otomatis & Manual).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void fetchPosts()}
            disabled={loading}
            className="px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
            title="Refresh Data"
          >
            🔄 <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => onNavigate?.('generator')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            📝 Content Generator
          </button>
          <button
            onClick={() => onNavigate?.('manual')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            ✏️ Manual Editor
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
          { label: 'Repliz Dashboard', url: 'https://app.repliz.com' },
          { label: 'Supabase Database', url: 'https://supabase.com' }
        ]}
      />

      {/* Tabs & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-1">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('automation')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition ${
              activeTab === 'automation'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🤖 Auto Posts ({filteredAuto.length}{autoPosts.length !== filteredAuto.length ? ` / ${autoPosts.length}` : ''})
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition ${
              activeTab === 'manual'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ✍️ Manual Generator ({filteredManual.length}{manualPosts.length !== filteredManual.length ? ` / ${manualPosts.length}` : ''})
          </button>
        </div>

        {/* View Mode Toggle (Grid Card 3 Kolom vs List) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tampilan Card 3 Kolom"
          >
            <span>⊞</span>
            <span>Card (3 Kolom)</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
          <span className="text-xs font-bold text-slate-600">Workflow:</span>
          <button
            onClick={() => setWorkflowFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              workflowFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({autoPosts.length})
          </button>
          <button
            onClick={() => setWorkflowFilter('news_monitoring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              workflowFilter === 'news_monitoring'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50 hover:border-amber-300'
            }`}
          >
            <span>📡</span>
            <span>News Monitoring ({newsMonitoringCount})</span>
          </button>
          <button
            onClick={() => setWorkflowFilter('daily_market_brief')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              workflowFilter === 'daily_market_brief'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50/50 hover:border-blue-300'
            }`}
          >
            <span>📈</span>
            <span>Daily Market Brief ({dailyBriefCount})</span>
          </button>
        </div>
      )}

      {/* Date & Search Filter Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">📅 Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">📅 Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">🔍 Cari Post</label>
            <input
              type="text"
              placeholder={activeTab === 'automation' ? 'Cari caption, workflow, akun...' : 'Cari badge, handle...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition self-end"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Preset Tanggal:</span>
          <button
            onClick={() => applyPreset('all')}
            className={`px-2.5 py-1 rounded-md transition ${
              !startDate && !endDate ? 'bg-amber-500 text-white font-semibold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => applyPreset('today')}
            className={`px-2.5 py-1 rounded-md transition ${
              startDate === getTodayStr() && endDate === getTodayStr()
                ? 'bg-amber-500 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => applyPreset('7days')}
            className={`px-2.5 py-1 rounded-md transition ${
              startDate === getDaysAgoStr(7) && endDate === getTodayStr()
                ? 'bg-amber-500 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => applyPreset('30days')}
            className={`px-2.5 py-1 rounded-md transition ${
              startDate === getDaysAgoStr(30) && endDate === getTodayStr()
                ? 'bg-amber-500 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            30 Hari Terakhir
          </button>
          <button
            onClick={() => applyPreset('month')}
            className={`px-2.5 py-1 rounded-md transition ${
              startDate === getFirstDayOfMonthStr() && endDate === getTodayStr()
                ? 'bg-amber-500 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="text-slate-500 py-12 text-center animate-pulse bg-white rounded-xl border border-slate-200">
          <span className="text-3xl block mb-2">⏳</span>
          <p>Memuat postingan...</p>
        </div>
      ) : activeTab === 'automation' ? (
        autoPosts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
            <span className="text-3xl block mb-2">🤖</span>
            <p>Belum ada postingan otomatis dari n8n.</p>
          </div>
        ) : filteredAuto.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-200">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="font-medium text-slate-700">Tidak ada postingan otomatis yang sesuai filter tanggal.</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah rentang tanggal atau klik reset filter.</p>
            <button
              onClick={resetFilters}
              className="mt-3 px-3.5 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition"
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
          <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
            <span className="text-3xl block mb-2">🗂️</span>
            <p>Belum ada postingan manual. Generate yang pertama dulu.</p>
            <button
              onClick={() => onNavigate?.('generator')}
              className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition"
            >
              📝 Generate Konten
            </button>
          </div>
        ) : filteredManual.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-200">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="font-medium text-slate-700">Tidak ada postingan manual yang sesuai filter tanggal.</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah rentang tanggal atau klik reset filter.</p>
            <button
              onClick={resetFilters}
              className="mt-3 px-3.5 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition"
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
        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>
              Menampilkan <span className="font-semibold text-slate-800">{startIndex + 1}</span> -{' '}
              <span className="font-semibold text-slate-800">{Math.min(startIndex + pageSize, totalItems)}</span> dari{' '}
              <span className="font-semibold text-slate-800">{totalItems}</span> post
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>Per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-slate-200 rounded-md bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ‹ Sebelumnya
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((num, idx) =>
                num === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${num}`}
                    onClick={() => setCurrentPage(Number(num))}
                    className={`w-7 h-7 text-xs font-medium rounded-lg transition ${
                      safePage === num
                        ? 'bg-amber-500 text-white font-bold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
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
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Selanjutnya ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

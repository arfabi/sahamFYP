// Analytics Page - Real data dari Supabase published posts
import React, { useState, useEffect } from 'react';
import { generatedPostsApi, type GeneratedPost } from '../services/supabase';

interface PostStats {
  id: string;
  title: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

export default function Analytics() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [posts, setPosts] = useState<PostStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await generatedPostsApi.getAll(50);
      const published = (data as GeneratedPost[]).filter(p => p.instagram_status === 'published');
      const stats: PostStats[] = published.map(p => {
        const slidesJson = p.slides_json;
        const title = (slidesJson && Array.isArray(slidesJson) && slidesJson.length > 0 && slidesJson[0].title)
          ? slidesJson[0].title
          : p.badge_text || 'Untitled';
        return {
          id: p.id,
          title,
          publishedAt: p.updated_at || p.created_at,
          likes: p.likes || 0,
          comments: p.comments || 0,
          shares: p.shares || 0,
          reach: p.reach || 0,
        };
      });
      setPosts(stats);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter by period
  const filterByPeriod = (list: PostStats[]) => {
    const now = Date.now();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const threshold = now - days * 24 * 60 * 60 * 1000;
    return list.filter(p => new Date(p.publishedAt).getTime() >= threshold);
  };

  const filteredPosts = filterByPeriod(posts);

  const total = filteredPosts.reduce((a, p) => ({
    likes: a.likes + p.likes,
    comments: a.comments + p.comments,
    shares: a.shares + p.shares,
    reach: a.reach + p.reach,
  }), { likes: 0, comments: 0, shares: 0, reach: 0 });

  // Engagement rate: (likes + comments + shares) / reach
  const engagementRate = total.reach > 0 ? ((total.likes + total.comments + total.shares) / total.reach * 100) : 0;

  // Top performing posts (sort by likes + comments + shares)
  const topPosts = [...filteredPosts].sort((a, b) =>
    (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
  ).slice(0, 5);

  // Per-post engagement trend (by date)
  const trendData = [...filteredPosts]
    .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
    .map(p => ({
      date: new Date(p.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      total: p.likes + p.comments + p.shares,
      likes: p.likes,
      comments: p.comments,
      reach: p.reach,
    }));

  const maxTrend = Math.max(...trendData.map(d => d.total), 1);

  const fmt = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📈 Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Performa konten SahamFYP</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">🔄 Refresh</button>
          {(['7d', '30d', '90d'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                period === p ? 'bg-amber-500 text-white' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : '90 Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-xl">❤️</div>
            <div>
              <p className="text-xs text-slate-500">Total Likes</p>
              <p className="text-xl font-bold text-slate-800">{fmt(total.likes)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl">💬</div>
            <div>
              <p className="text-xs text-slate-500">Total Comments</p>
              <p className="text-xl font-bold text-slate-800">{fmt(total.comments)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-xl">🔄</div>
            <div>
              <p className="text-xs text-slate-500">Total Shares</p>
              <p className="text-xl font-bold text-slate-800">{fmt(total.shares)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-xl">📊</div>
            <div>
              <p className="text-xs text-slate-500">Engagement Rate</p>
              <p className="text-xl font-bold text-slate-800">{engagementRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Trend Bar Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">📊 Engagement Trend</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">⏳ Loading...</div>
        ) : trendData.length === 0 ? (
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg text-center">
            <span className="text-4xl block mb-2">📈</span>
            <p className="text-sm">Belum ada data untuk periode ini</p>
          </div>
        ) : (
          <div className="flex items-end gap-2 h-56">
            {trendData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-amber-500 hover:bg-amber-600 rounded-t transition-all"
                  style={{ height: `${Math.max((d.total / maxTrend) * 100, 4)}%` }}
                  title={`${d.total} engagement`}
                />
                <span className="text-[9px] text-slate-400">{d.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Posts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">🏆 Top Performing Posts</h2>
        {topPosts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <span className="text-4xl block mb-2">📭</span>
            <p className="text-sm">Belum ada data performa</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topPosts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">{new Date(p.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span>❤️ {fmt(p.likes)}</span>
                  <span>💬 {fmt(p.comments)}</span>
                  <span>🔄 {fmt(p.shares)}</span>
                  <span>👁️ {fmt(p.reach)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
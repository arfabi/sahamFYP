// Scheduled Posts Page - Supabase + Repliz Integration
import React, { useState, useEffect } from 'react';
import { generatedPostsApi, type GeneratedPost } from '../services/supabase';
import { getScheduleStatus, cancelSchedule } from '../services/repliz';

interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  type: string;
  status: 'generated' | 'scheduled' | 'published' | 'failed' | 'cancelled';
  scheduledAt: string;
  mediaCount: number;
  scheduleId?: string;
}

export default function ScheduledPosts() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'published' | 'failed' | 'cancelled'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { fetchScheduledPosts(); }, []);

  const fetchScheduledPosts = async () => {
    setLoading(true);
    try {
      const data = await generatedPostsApi.getAll(50);
      const formattedPosts: ScheduledPost[] = (data as GeneratedPost[]).map(post => ({
        id: post.id,
        title: post.badge_text || 'Untitled',
        caption: post.handle || '',
        type: 'album',
        status: post.instagram_status || 'scheduled',
        scheduledAt: post.created_at,
        mediaCount: post.total_slides || 8,
        scheduleId: post.schedule_id,
      }));
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.status === filter);

  // Refresh status dari Repliz
  const handleRefreshStatus = async (post: ScheduledPost) => {
    if (!post.scheduleId) return;
    setBusyId(post.id);
    try {
      const result = await getScheduleStatus(post.scheduleId);
      if (result.success && result.status) {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: result.status as ScheduledPost['status'] } : p));
        await generatedPostsApi.update(post.id, { instagram_status: result.status });
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
    } finally {
      setBusyId(null);
    }
  };

  // Cancel schedule
  const handleCancel = async (post: ScheduledPost) => {
    if (!post.scheduleId) return;
    if (!window.confirm('Cancel jadwal post ini?')) return;
    setBusyId(post.id);
    try {
      const result = await cancelSchedule(post.scheduleId);
      if (result.success) {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'cancelled' as const } : p));
        await generatedPostsApi.update(post.id, { instagram_status: 'cancelled' });
      } else {
        window.alert(result.error || 'Gagal cancel jadwal');
      }
    } catch (error) {
      console.error('Error cancelling schedule:', error);
    } finally {
      setBusyId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-amber-100 text-amber-700',
      published: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-slate-200 text-slate-600',
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📅 Scheduled Posts</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola post yang dijadwalkan via Repliz</p>
        </div>
        <button onClick={fetchScheduledPosts}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50">
          🔄 Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
        {(['all', 'scheduled', 'published', 'failed', 'cancelled'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
          <span className="text-4xl block mb-4">⏳</span>
          <p className="text-slate-500">Memuat data...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
          <span className="text-4xl block mb-4">📭</span>
          <p className="text-slate-500">Belum ada post yang dijadwalkan</p>
          <p className="text-xs text-slate-400 mt-2">Generate konten baru untuk membuat jadwal post</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-800">{post.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{post.caption}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>📅 {formatDate(post.scheduledAt)}</span>
                    {post.scheduleId && <span>🆔 {post.scheduleId.slice(0, 12)}...</span>}
                    <span>🖼️ {post.mediaCount} media</span>
                    <span>📱 {post.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {post.scheduleId && (
                    <button onClick={() => handleRefreshStatus(post)} disabled={busyId === post.id}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 disabled:opacity-50">
                      {busyId === post.id ? '⏳' : '🔄'} Status
                    </button>
                  )}
                  {post.status === 'scheduled' && post.scheduleId && (
                    <button onClick={() => handleCancel(post)} disabled={busyId === post.id}
                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50">
                      {busyId === post.id ? '⏳' : '✕'} Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
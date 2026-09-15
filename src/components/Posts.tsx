// Posts - daftar semua postingan dalam SATU list (scheduled | published | failed | generated).
// Header menyediakan shortcut ke Content Generator & Manual Editor.
import React, { useState, useEffect } from 'react';
import { generatedPostsApi, type GeneratedPost } from '../services/supabase';
import PostListRow from './PostListRow';

export default function Posts({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const data = await generatedPostsApi.getAll(100);
      setPosts((data as GeneratedPost[]) || []);
    } catch (e) {
      console.error('fetchPosts error', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  const sorted = [...posts].sort((a, b) =>
    (b.updated_at || b.created_at).localeCompare(a.updated_at || a.created_at)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🗂️ Posts</h1>
          <p className="text-sm text-slate-500 mt-1">{posts.length} postingan — semua status dalam satu list.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate?.('generator')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition flex items-center gap-2"
          >
            📝 Content Generator
          </button>
          <button
            onClick={() => onNavigate?.('manual')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition flex items-center gap-2"
          >
            ✏️ Manual Editor
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500 py-8">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
          <span className="text-3xl block mb-2">🗂️</span>
          <p>Belum ada postingan. Generate yang pertama dulu.</p>
          <button
            onClick={() => onNavigate?.('generator')}
            className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold"
          >
            📝 Generate Konten
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sorted.map((p) => (
            <PostListRow key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

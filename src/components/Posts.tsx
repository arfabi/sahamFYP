// Posts - daftar semua postingan dalam SATU list (scheduled | published | failed | generated).
// Header menyediakan shortcut ke Content Generator & Manual Editor.
import React, { useState, useEffect } from 'react';
import { generatedPostsApi, automationPostsApi, type GeneratedPost, type AutomationPost } from '../services/supabase';
import PostListRow from './PostListRow';
import AutomationPostRow from './AutomationPostRow';

export default function Posts({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [manualPosts, setManualPosts] = useState<GeneratedPost[]>([]);
  const [autoPosts, setAutoPosts] = useState<AutomationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'automation' | 'manual'>('automation');

  useEffect(() => {
    void fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const [manualData, autoData] = await Promise.all([
        generatedPostsApi.getAll(100),
        automationPostsApi.getAll(100)
      ]);
      setManualPosts((manualData as GeneratedPost[]) || []);
      setAutoPosts((autoData as AutomationPost[]) || []);
    } catch (e) {
      console.error('fetchPosts error', e);
    } finally {
      setLoading(false);
    }
  }

  const sortedManual = [...manualPosts].sort((a, b) =>
    (b.updated_at || b.created_at).localeCompare(a.updated_at || a.created_at)
  );
  
  const sortedAuto = [...autoPosts].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🗂️ Posts</h1>
          <p className="text-sm text-slate-500 mt-1">Riwayat publikasi konten (Otomatis & Manual).</p>
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

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('automation')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition ${
            activeTab === 'automation' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          🤖 Auto Posts ({autoPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition ${
            activeTab === 'manual' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          ✍️ Manual Generator ({manualPosts.length})
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500 py-8 text-center animate-pulse">Loading…</div>
      ) : activeTab === 'automation' ? (
        autoPosts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
            <span className="text-3xl block mb-2">🤖</span>
            <p>Belum ada postingan otomatis dari n8n.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedAuto.map((p) => (
              <AutomationPostRow key={p.id} post={p} />
            ))}
          </div>
        )
      ) : (
        manualPosts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-slate-200">
            <span className="text-3xl block mb-2">🗂️</span>
            <p>Belum ada postingan manual. Generate yang pertama dulu.</p>
            <button
              onClick={() => onNavigate?.('generator')}
              className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold"
            >
              📝 Generate Konten
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedManual.map((p) => (
              <PostListRow key={p.id} post={p} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

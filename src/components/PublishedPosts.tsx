// Published Posts Page - Real data dari Supabase
import React, { useState, useEffect } from 'react';
import { generatedPostsApi, postImagesApi, type GeneratedPost, type PostImage } from '../services/supabase';

interface PublishedPost {
  id: string;
  title: string;
  caption: string;
  publishedAt: string;
  mediaUrl: string;
  permalink: string;
  engagement: { likes: number; comments: number; shares: number; reach: number };
}

export default function PublishedPosts() {
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPublishedPosts(); }, []);

  const fetchPublishedPosts = async () => {
    setLoading(true);
    try {
      const data = await generatedPostsApi.getAll(50);
      const published = (data as GeneratedPost[]).filter(p => p.instagram_status === 'published');

      const formatted: PublishedPost[] = [];
      for (const post of published) {
        let mediaUrl = '';
        try {
          const images = await postImagesApi.getByPostId(post.id);
          if (images && images.length > 0) mediaUrl = (images[0] as PostImage).cloudinary_url;
        } catch { /* no images */ }

        const slidesJson = post.slides_json;
        const title = (slidesJson && Array.isArray(slidesJson) && slidesJson.length > 0 && slidesJson[0].title)
          ? slidesJson[0].title
          : post.badge_text || 'Untitled';

        formatted.push({
          id: post.id,
          title,
          caption: post.handle || '',
          publishedAt: post.updated_at || post.created_at,
          mediaUrl,
          permalink: post.permalink || '',
          engagement: {
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            reach: post.reach || 0,
          },
        });
      }
      setPosts(formatted);
    } catch (error) {
      console.error('Error fetching published posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const sortPosts = (list: PublishedPost[]) =>
    [...list].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const sortedPosts = sortPosts(posts);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmt = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toString();

  const total = sortedPosts.reduce((a, p) => ({
    likes: a.likes + p.engagement.likes,
    comments: a.comments + p.engagement.comments,
    shares: a.shares + p.engagement.shares,
    reach: a.reach + p.engagement.reach,
  }), { likes: 0, comments: 0, shares: 0, reach: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">✅ Published Posts</h1>
          <p className="text-sm text-slate-500 mt-1">Riwayat post yang sudah terpublish di Instagram</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPublishedPosts} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500">Total Posts</p>
          <p className="text-xl font-bold text-slate-800">{sortedPosts.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500">Total Likes</p>
          <p className="text-xl font-bold text-slate-800">{fmt(total.likes)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500">Total Comments</p>
          <p className="text-xl font-bold text-slate-800">{fmt(total.comments)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500">Total Reach</p>
          <p className="text-xl font-bold text-slate-800">{fmt(total.reach)}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
          <span className="text-4xl block mb-4">⏳</span>
          <p className="text-slate-500">Memuat data...</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
          <span className="text-4xl block mb-4">📭</span>
          <p className="text-slate-500">Belum ada post yang terpublish</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map(post => (
            <div key={post.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  {post.mediaUrl ? (
                    <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl">🖼️</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{post.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{formatDate(post.publishedAt)}</p>
                    </div>
                    {post.permalink && (
                      <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-700">
                        View on IG →
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{post.caption}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>❤️ {fmt(post.engagement.likes)}</span>
                    <span>💬 {fmt(post.engagement.comments)}</span>
                    <span>🔄 {fmt(post.engagement.shares)}</span>
                    <span>👁️ {fmt(post.engagement.reach)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// Single row in the Posts list.
import React from 'react';
import type { GeneratedPost } from '../services/supabase';

const STATUS_COLOR: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  scheduled: 'bg-amber-100 text-amber-700',
  generated: 'bg-slate-200 text-slate-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-300 text-slate-600',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const fmt = (n: number) =>
  n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();

export default function PostListRow({
  post,
  onSelect,
}: {
  post: GeneratedPost;
  onSelect?: () => void;
}) {
  const st = post.instagram_status || 'generated';
  return (
    <div 
      onClick={onSelect}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md hover:border-amber-400 transition cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl group-hover:scale-110 transition">📝</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 truncate group-hover:text-amber-600 transition">{post.badge_text || 'Untitled'}</span>
            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-semibold">
              Lihat Detail
            </span>
          </div>
          <div className="text-xs text-slate-500 truncate mt-0.5">
            @{post.handle || '-'} · {post.total_slides || 0} slides · {fmtDate(post.created_at)}
          </div>
          {post.tiktok_status && post.tiktok_status !== st && (
            <div className="text-xs text-slate-500">TikTok: {post.tiktok_status}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="font-medium">{fmt(post.likes || 0)}</div>
          <div className="text-xs text-slate-500">likes</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{fmt(post.comments || 0)}</div>
          <div className="text-xs text-slate-500">comments</div>
        </div>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLOR[st] || 'bg-slate-100 text-slate-600'}`}
        >
          {st}
        </span>
        {(post.permalink_ig || post.permalink) && (
          <a
            href={post.permalink_ig || post.permalink}
            target="_blank"
            rel="noreferrer"
            className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
            title="Buka di Instagram"
          >
            Live ↗
          </a>
        )}

        <button
          onClick={onSelect}
          className="p-1.5 text-slate-400 hover:text-slate-700 transition text-sm"
          title="Buka Detail Postingan"
        >
          →
        </button>
      </div>
    </div>
  );
}


import React from 'react';
import type { AutomationPost } from '../services/supabase';

interface AutomationPostCardProps {
  post: AutomationPost;
  onSelect?: () => void;
}

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AutomationPostCard({ post, onSelect }: AutomationPostCardProps) {
  const isDailyBrief = post.workflow_type === 'daily_market_brief';
  const st = (post.status || 'success').toLowerCase();

  // Extract hashtags for quick emiten pill previews
  const hashtags = Array.from((post.caption || '').matchAll(/#([A-Za-z0-9_]+)/g))
    .map((m) => m[1])
    .filter(
      (tag) =>
        ![
          'sahamfyp',
          'investasisaham',
          'belajarsaham',
          'infosaham',
          'edukasisaham',
          'dyor',
        ].includes(tag.toLowerCase())
    )
    .slice(0, 3);

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer transform hover:-translate-y-1"
    >
      {/* 1. Thumbnail Header with Badges */}
      <div className="relative aspect-[16/10] bg-slate-900/5 overflow-hidden">
        {post.thumbnail_url ? (
          <img
            src={post.thumbnail_url}
            alt="Thumbnail"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <span className="text-4xl mb-1">{isDailyBrief ? '📈' : '📡'}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {post.workflow_type.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top-Left: Workflow Type Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isDailyBrief ? (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600/95 text-white shadow-md backdrop-blur-sm flex items-center gap-1">
              <span>📈</span>
              <span>Daily Brief</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/95 text-white shadow-md backdrop-blur-sm flex items-center gap-1">
              <span>📡</span>
              <span>News Monitoring</span>
            </span>
          )}
        </div>

        {/* Top-Right: Status Badge */}
        <div className="absolute top-3 right-3">
          {st === 'success' || st === 'published' ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/95 text-white shadow-md backdrop-blur-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              SUCCESS
            </span>
          ) : st === 'error' || st === 'failed' ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/95 text-white shadow-md backdrop-blur-sm">
              FAILED
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/95 text-white shadow-md backdrop-blur-sm">
              PENDING
            </span>
          )}
        </div>

        {/* Bottom Banner: Account Tag */}
        <div className="absolute bottom-2.5 left-3 text-white text-xs font-medium drop-shadow flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{post.account_id || '@sahamfyp.id'}</span>
        </div>
      </div>

      {/* 2. Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Emiten Hashtag Pills */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Caption Text */}
          <p
            className="text-sm font-semibold text-slate-800 leading-snug line-clamp-3 group-hover:text-amber-600 transition-colors"
            title={post.caption || ''}
          >
            {post.caption || 'Tidak ada teks caption.'}
          </p>
        </div>

        {/* 3. Card Footer Meta & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
          <div className="text-slate-400 font-medium truncate">
            📅 {fmtDate(post.created_at)}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {post.post_link && (
              <a
                href={post.post_link}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition text-[11px] flex items-center gap-1"
                title="Buka postingan live di medsos"
              >
                Live ↗
              </a>
            )}

            <button
              onClick={onSelect}
              className="px-2.5 py-1 bg-slate-100 group-hover:bg-amber-500 group-hover:text-white text-slate-700 font-semibold rounded-lg transition text-[11px] flex items-center gap-1"
            >
              Detail →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

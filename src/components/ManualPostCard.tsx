import React from 'react';
import type { GeneratedPost } from '../services/supabase';

interface ManualPostCardProps {
  post: GeneratedPost;
  onSelect?: () => void;
}

const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const fmt = (n: number) =>
  n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();

export default function ManualPostCard({ post, onSelect }: ManualPostCardProps) {
  const st = (post.instagram_status || 'generated').toLowerCase();

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer transform hover:-translate-y-1"
    >
      {/* 1. Header Banner / Cover */}
      <div className="relative h-32 bg-gradient-to-br from-amber-500/10 via-slate-100 to-amber-100/30 p-4 flex flex-col justify-between border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
            <span>📝</span>
            <span>Manual Post</span>
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 shadow-sm">
            {st}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-200/60">
            📊 {post.total_slides || 0} Slides
          </span>
          <span className="text-xs text-slate-500">
            @{post.handle || 'sahamfyp'}
          </span>
        </div>
      </div>

      {/* 2. Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
            {post.badge_text || 'SahamFYP Post'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            Naskah dibuat melalui Form Wizard / Manual Editor
          </p>
        </div>

        {/* Engagement Stats if available */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-center text-xs">
          <div>
            <div className="font-bold text-slate-800">{fmt(post.likes || 0)}</div>
            <div className="text-[10px] text-slate-400">Likes</div>
          </div>
          <div>
            <div className="font-bold text-slate-800">{fmt(post.comments || 0)}</div>
            <div className="text-[10px] text-slate-400">Comments</div>
          </div>
        </div>

        {/* 3. Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
          <div className="text-slate-400 font-medium">
            📅 {fmtDate(post.created_at)}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {(post.permalink_ig || post.permalink) && (
              <a
                href={post.permalink_ig || post.permalink}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition text-[11px] flex items-center gap-1"
                title="Buka postingan live"
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

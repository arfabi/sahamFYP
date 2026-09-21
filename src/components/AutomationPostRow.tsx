import React from 'react';
import type { AutomationPost } from '../services/supabase';

const STATUS_COLOR: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AutomationPostRow({
  post,
  onSelect,
}: {
  post: AutomationPost;
  onSelect?: () => void;
}) {
  const st = post.status || 'success';
  
  return (
    <div 
      onClick={onSelect}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md hover:border-amber-400 transition cursor-pointer group"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 group-hover:ring-2 group-hover:ring-amber-400/50 transition">
          {post.thumbnail_url ? (
            <img src={post.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🤖</div>
          )}
        </div>
        
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-800 uppercase text-xs tracking-wider">
              {post.workflow_type.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-semibold">
              Lihat Detail
            </span>
          </div>
          <div className="text-sm text-slate-700 line-clamp-1 mb-1 font-medium group-hover:text-amber-600 transition" title={post.caption || ''}>
            {post.caption || 'No caption'}
          </div>
          <div className="text-xs text-slate-500">
            {fmtDate(post.created_at)} · {post.account_id || 'Unknown Account'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_COLOR[st] || 'bg-slate-100 text-slate-600'}`}
        >
          {st.toUpperCase()}
        </span>
        
        {post.post_link ? (
          <a
            href={post.post_link} 
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition flex items-center gap-1"
            title="Buka Post Live"
          >
            <span>Live</span> ↗
          </a>
        ) : post.post_id ? (
          <button
            onClick={onSelect}
            className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 text-xs font-semibold rounded-lg transition"
            title="Cek status publikasi di halaman detail"
          >
            Cek Status ↗
          </button>
        ) : (
          <button
            onClick={onSelect}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs rounded-lg transition"
          >
            Detail ↗
          </button>
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

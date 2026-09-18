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
}: {
  post: AutomationPost;
}) {
  const st = post.status || 'success';
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition">
      <div className="flex items-center gap-4 min-w-0">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
          {post.thumbnail_url ? (
            <img src={post.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🤖</div>
          )}
        </div>
        
        <div className="min-w-0">
          <div className="font-bold text-slate-800 uppercase text-xs tracking-wider mb-1">
            {post.workflow_type.replace(/_/g, ' ')}
          </div>
          <div className="text-sm text-slate-700 line-clamp-1 mb-1" title={post.caption || ''}>
            {post.caption || 'No caption'}
          </div>
          <div className="text-xs text-slate-500">
            {fmtDate(post.created_at)} · {post.account_id || 'Unknown Account'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_COLOR[st] || 'bg-slate-100 text-slate-600'}`}
        >
          {st.toUpperCase()}
        </span>
        
        {post.post_id ? (
          <a
            href={post.post_link || `https://instagram.com/`} 
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            title={`Post ID: ${post.post_id}`}
          >
            Live Post ↗
          </a>
        ) : (
          <span className="text-xs text-slate-400">No Link</span>
        )}
      </div>
    </div>
  );
}

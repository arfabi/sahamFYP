// Posts hub — gabungan Draft | Scheduled | Published | Failed.
// Membungkus komponen existing ScheduledPosts.tsx & PublishedPosts.tsx
// (masasing-masing tetap melakukan query & interaksinya sendiri).
// Halaman ini merender tab switcher + masing-masing komponen secara lazy.
import React, { useState, Suspense } from 'react';

export type PostTab = 'scheduled' | 'published';

const ScheduledPosts = React.lazy(() => import('./ScheduledPosts'));
const PublishedPosts = React.lazy(() => import('./PublishedPosts'));

const TABS: { id: PostTab; label: string; icon: string }[] = [
  { id: 'scheduled', label: 'Scheduled', icon: '📅' },
  { id: 'published', label: 'Published', icon: '✅' },
];

export default function Posts({ defaultTab = 'scheduled' }: { defaultTab?: PostTab }) {
  const [tab, setTab] = useState<PostTab>(defaultTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🗂️ Posts</h1>
          <p className="text-sm text-slate-500 mt-1">Semua post dalam satu tempat: yang dijadwalkan &amp; yang sudah terpublikasi.</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <Suspense fallback={<div className="text-slate-500 py-8">Memuat…</div>}>
        {tab === 'scheduled' && <ScheduledPosts />}
        {tab === 'published' && <PublishedPosts />}
      </Suspense>
    </div>
  );
}

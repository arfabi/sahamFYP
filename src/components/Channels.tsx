// ============================================================
// Channels & Connections — single page, card-based, data-driven.
// Credentials remain in env (server-side). This page only REFLECTS
// status derived from env. A DB-backed `channels` registry is a
// future phase (replaces static statuses once per-channel editing
// is needed). See note in the UI footer.
// ============================================================

import React from 'react';
import { isReplizConfigured } from '../services/repliz';

type ChannelStatus = 'active' | 'beta' | 'notif' | 'soon';

interface ChannelDef {
  key: string;
  label: string;
  icon: string;
  platform: string;
  status: ChannelStatus;
  accountRef?: string;
  note: string;
  actionLabel: string;
  /** Where the Configure button points. Defaults to Settings page. */
  actionTarget?: 'settings' | 'repliz';
}

// IG active = Repliz fully configured + account id present.
const IG_ACTIVE = isReplizConfigured() && !!import.meta.env.VITE_REPLIZ_ACCOUNT_ID;
// TikTok "beta" = ada account id. (publish.ts sudah support platform 'tiktok'.)
const TIKTOK_ACCOUNT = !!import.meta.env.VITE_REPLIZ_TIKTOK_ACCOUNT_ID;

const CHANNELS: ChannelDef[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    icon: '📱',
    platform: 'instagram',
    status: IG_ACTIVE ? 'active' : 'soon',
    accountRef: import.meta.env.VITE_REPLIZ_ACCOUNT_ID || undefined,
    note: 'Publish carousel & stories via Repliz (IG). 8-slide carousel.',
    actionLabel: IG_ACTIVE ? 'Configure' : 'Set up',
    actionTarget: 'settings',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: '🎵',
    platform: 'tiktok',
    status: TIKTOK_ACCOUNT ? 'beta' : 'soon',
    accountRef: import.meta.env.VITE_REPLIZ_TIKTOK_ACCOUNT_ID || undefined,
    note: 'Vertical carousel publishing via /api/publish (beta — belum full rollout).',
    actionLabel: 'Configure',
    actionTarget: 'settings',
  },
  {
    key: 'telegram',
    label: 'Telegram',
    icon: '✈️',
    platform: 'telegram',
    status: 'notif',
    note: 'Planned: channel bot publishing. Saat ini: notifikasi admin saja (token di server, tidak diekspos ke frontend).',
    actionLabel: 'Settings',
    actionTarget: 'settings',
  },
  {
    key: 'threads',
    label: 'Threads',
    icon: '🧵',
    platform: 'threads',
    status: 'soon',
    note: 'Planned: text-thread posting.',
    actionLabel: 'Set up',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: '📘',
    platform: 'facebook',
    status: 'soon',
    note: 'Planned: single image / carousel posting.',
    actionLabel: 'Set up',
  },
  {
    key: 'twitter',
    label: 'Twitter / X',
    icon: '𝕏',
    platform: 'twitter',
    status: 'soon',
    note: 'Planned: single image + text tweet posting.',
    actionLabel: 'Set up',
  },
];

const STATUS_META: Record<ChannelStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  beta: { label: 'Beta', color: 'bg-amber-100 text-amber-700' },
  notif: { label: 'Notifications', color: 'bg-blue-100 text-blue-700' },
  soon: { label: 'Soon', color: 'bg-slate-200 text-slate-600' },
};

export default function Channels({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const openRepliz = () => window.open('https://repliz.com', '_blank');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">🔗 Channels &amp; Connections</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola semua akun publishing: IG / TikTok / Telegram / Threads / Facebook / Twitter. Klik kartu untuk mengonfigurasi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CHANNELS.map((c) => {
          const meta = STATUS_META[c.status];
          return (
            <div
              key={c.key}
              className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3 ${
                c.status === 'soon' ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{c.icon}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${meta.color}`}>{meta.label}</span>
              </div>

              <h3 className="font-semibold text-slate-800">{c.label}</h3>
              <p className="text-xs text-slate-500 flex-1">{c.note}</p>

              {c.accountRef && (
                <span className="text-xs font-mono text-slate-600">ID: {c.accountRef}</span>
              )}

              <div className="flex gap-2">
                {c.status === 'soon' ? (
                  <button
                    disabled
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
                  >
                    Coming soon
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      c.actionTarget === 'repliz'
                        ? openRepliz()
                        : onNavigate?.('settings')
                    }
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                  >
                    {c.actionLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        🔐 <strong>Keamanan:</strong> credential / API key disimpan di environment variables server-side (Vercel /{' '}
        <code className="font-mono">.env.local</code>), <em>bukan</em> di database. Jika butuh status per-akun yang
        dapat di-edit oleh user, nanti kami pindahkan ke tabel Supabase <code className="font-mono">channels</code>{' '}
        — dengan kredensial tetap berada di provider (Repliz / Telegram), bukan di DB.
      </div>
    </div>
  );
}

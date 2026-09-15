// ============================================================
// Overview Page - Phase 1
// Dashboard home with stats and quick actions
// ============================================================

import React, { useState, useEffect } from 'react';
import { isReplizConfigured } from '../services/repliz';

interface OverviewProps {
  onNavigate: (page: string) => void;
}

interface ServiceInfo {
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  details: string;
  color: string;
}

export default function Overview({ onNavigate }: OverviewProps) {
  const [replizConnected, setReplizConnected] = useState(false);

  useEffect(() => {
    setReplizConnected(isReplizConfigured());
  }, []);

  const stats = [
    { label: 'Total Posts', value: 0, icon: '📝', color: 'bg-blue-50 text-blue-600' },
    { label: 'Scheduled', value: 0, icon: '📅', color: 'bg-amber-50 text-amber-600' },
    { label: 'Published', value: 0, icon: '✅', color: 'bg-green-50 text-green-600' },
    { label: 'Engagement', value: 0, icon: '❤️', color: 'bg-pink-50 text-pink-600' },
  ];

  const services: ServiceInfo[] = [
    { name: 'Instagram (Repliz)', icon: '📱', description: 'Publish & schedule posts', connected: replizConnected, details: replizConnected ? 'Account connected' : 'Not configured', color: 'bg-pink-50 text-pink-600' },
    {
      name: 'Cloudinary',
      icon: '☁️',
      description: 'Image hosting & CDN',
      connected: !!(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET),
      details: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'Not configured',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      name: 'Sumopod LLM',
      icon: '🤖',
      description: 'Content generation (OpenAI compatible)',
      connected: !!import.meta.env.VITE_LLM_MODEL,
      details: import.meta.env.VITE_LLM_MODEL ? `Model: ${import.meta.env.VITE_LLM_MODEL}` : 'Not configured',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      name: 'Sectors.app',
      icon: '📊',
      description: 'Stock market data',
      connected: !!import.meta.env.VITE_SECTORS_API_KEY,
      details: import.meta.env.VITE_SECTORS_API_KEY ? 'API key configured' : 'Not configured',
      color: 'bg-green-50 text-green-600',
    },
    {
      name: 'Supabase',
      icon: '🗄️',
      description: 'Database & storage',
      connected: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
      details: import.meta.env.VITE_SUPABASE_URL ? 'Project connected' : 'Not configured',
      color: 'bg-slate-100 text-slate-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📊 Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan aktivitas konten SahamFYP</p>
        </div>
        <button
          onClick={() => onNavigate('generator')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition flex items-center gap-2"
        >
          ✍️ Generate Konten Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status - Detailed */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">🔗 Connection Status</h2>
        <div className="space-y-3">
          {services.map((service, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${service.color}`}>
                  {service.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">{service.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${service.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {service.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{service.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{service.details}</p>
                </div>
              </div>
              {!service.connected && (
                <button
                  onClick={() => onNavigate('settings')}
                  className="px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50 transition"
                >
                  Setup
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ActionCard icon="📝" title="Generate Konten" desc="Buat carousel dari berita" onClick={() => onNavigate('generator')} />
          <ActionCard icon="📅" title="Lihat Scheduled" desc="Cek post yang dijadwalkan" onClick={() => {}} disabled />
          <ActionCard icon="⚙️" title="Settings" desc="Konfigurasi API keys" onClick={() => onNavigate('settings')} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">🕐 Recent Activity</h2>
        <div className="text-center py-8 text-slate-400">
          <span className="text-4xl block mb-2">📭</span>
          <p className="text-sm">Belum ada aktivitas terbaru</p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, disabled = false }: { icon: string; title: string; desc: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-xl text-left transition ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-200'}`}
    >
      <span className="text-2xl block mb-2">{icon}</span>
      <p className="font-medium text-slate-800">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </button>
  );
}
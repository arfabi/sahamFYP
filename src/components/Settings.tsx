// ============================================================
// Settings Page - Phase 1
// ============================================================

import React, { useState } from 'react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'api' | 'account' | 'template'>('api');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'api' as const, label: '🔑 API Keys' },
    { id: 'account' as const, label: '👤 Account' },
    { id: 'template' as const, label: '🎨 Template' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Konfigurasi API keys dan preferensi</p>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'api' && <ApiKeysTab showKeys={showKeys} toggleShowKey={toggleShowKey} />}
      {activeTab === 'account' && <AccountTab />}
      {activeTab === 'template' && <TemplateTab />}
    </div>
  );
}

function ApiKeysTab({ showKeys, toggleShowKey }: { showKeys: Record<string, boolean>; toggleShowKey: (key: string) => void }) {
  const configs = [
    { key: 'VITE_LLM_MODEL', label: 'LLM (Sumopod — OpenAI compatible)', desc: 'https://ai.sumopod.com (diisi via SUMOPOD_MODEL)' },
    { key: 'VITE_SECTORS_API_KEY', label: 'Sectors.app', desc: 'https://sectors.app' },
    { key: 'VITE_REPLIZ_ACCESS_KEY', label: 'Repliz Access Key', desc: 'https://repliz.com → API' },
    { key: 'VITE_REPLIZ_SECRET_KEY', label: 'Repliz Secret Key', desc: 'https://repliz.com → API' },
    { key: 'VITE_REPLIZ_ACCOUNT_ID', label: 'Repliz Account ID', desc: 'Instagram Account ID' },
    { key: 'VITE_CLOUDINARY_CLOUD_NAME', label: 'Cloudinary Cloud Name', desc: 'https://cloudinary.com' },
    { key: 'VITE_CLOUDINARY_UPLOAD_PRESET', label: 'Cloudinary Upload Preset', desc: 'Cloudinary Settings' },
  ];

  return (
    <div className="space-y-4">
      {configs.map(c => {
        const val = import.meta.env[c.key] || '';
        return (
          <div key={c.key} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-800">{c.label}</label>
                <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type={showKeys[c.key] ? 'text' : 'password'}
                    value={val}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-600"
                  />
                  <button onClick={() => toggleShowKey(c.key)} className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg">
                    {showKeys[c.key] ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className={`ml-4 w-3 h-3 rounded-full mt-1 ${val ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
        );
      })}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">⚠️ API keys di .env.local. Edit file & restart dev server untuk mengubah.</p>
      </div>
    </div>
  );
}

function AccountTab() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">👤 Instagram Account</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Account ID</label>
          <input type="text" value={import.meta.env.VITE_REPLIZ_ACCOUNT_ID || ''} readOnly className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Status</label>
          <div className="mt-1 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${import.meta.env.VITE_REPLIZ_ACCESS_KEY ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-slate-600">{import.meta.env.VITE_REPLIZ_ACCESS_KEY ? 'Connected' : 'Not Connected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateTab() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">🎨 Default Template</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Default Handle</label>
          <input type="text" defaultValue="@sahamfyp" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Default Badge</label>
          <input type="text" defaultValue="IHSG" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">BG Color</label>
            <input type="color" defaultValue="#14182B" className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Text Color</label>
            <input type="color" defaultValue="#F5F1E7" className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Accent Color</label>
            <input type="color" defaultValue="#F2A93B" className="w-full mt-1 h-10 rounded-lg cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}
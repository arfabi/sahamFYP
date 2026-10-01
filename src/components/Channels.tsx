import React, { useState, useEffect } from 'react';
import { Instagram, Send, Music, Twitter, Facebook, AtSign, Linkedin, Link2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import FeatureInfoCard from './FeatureInfoCard';

interface SocialAccount {
  id: string;
  platform: string;
  provider: string;
  account_id: string;
  account_name: string;
  is_active: boolean;
}

function getProfileUrl(platform: string, name: string) {
  const cleanName = name.replace('@', '');
  if (!cleanName) return '#';
  switch (platform) {
    case 'instagram': return `https://instagram.com/${cleanName}`;
    case 'twitter': return `https://x.com/${cleanName}`;
    case 'tiktok': return `https://tiktok.com/@${cleanName}`;
    case 'facebook': return `https://facebook.com/${cleanName}`;
    case 'threads': return `https://threads.net/@${cleanName}`;
    case 'telegram': return `https://t.me/${cleanName}`;
    case 'linkedin': return `https://linkedin.com/company/${cleanName}`;
    default: return '#';
  }
}

export default function Channels({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'instagram',
    provider: 'repliz',
    account_id: '',
    account_name: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching accounts:', error);
    } else {
      setAccounts(data || []);
    }
    setLoading(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('social_accounts')
      .update({ is_active: !currentStatus })
      .eq('id', id);
      
    if (!error) {
      setAccounts(accounts.map(acc => acc.id === id ? { ...acc, is_active: !currentStatus } : acc));
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', id);
      
    if (!error) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('social_accounts')
      .insert([formData]);
      
    if (!error) {
      setShowModal(false);
      setFormData({ platform: 'instagram', provider: 'repliz', account_id: '', account_name: '' });
      fetchAccounts();
    } else {
      alert('Failed to add account: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <span>🔗</span> Social Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola channel penerbitan konten otomatis & manual (Repliz & Telegram).
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-rose-500/20 transition cursor-pointer flex items-center gap-1.5"
        >
          <span>+</span> Add Account
        </button>
      </div>

      <FeatureInfoCard
        id="channels"
        title="Tentang Akun & Channel Publikasi"
        badge="PUBLISHING"
        description="Kelola akun media sosial tujuan pengiriman konten otomatis dan manual (Instagram, TikTok, Telegram, dll)."
        functionality="Menyimpan identitas channel tujuan (Account ID), platform penerbitan, dan status keaktifan akun dalam pipeline publikasi."
        dataSource="Disimpan secara aman di database Supabase pada tabel social_accounts."
        pipeline="Digunakan oleh alur Repliz API & bot Telegram untuk menentukan tujuan ke mana postingan berita dan market brief diterbitkan secara simultan."
        links={[
          { label: 'Repliz', url: 'https://repliz.com/' }
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
          <span className="ml-3 text-slate-600 font-medium">Memuat accounts...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-500 shadow-xs">
          <span className="text-4xl block mb-2">📭</span>
          Belum ada akun media sosial yang dikonfigurasi. Klik "+ Add Account" untuk memulai.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={`bg-white hover:bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:border-slate-300 shadow-xs flex flex-col gap-3 transition ${
                !acc.is_active ? 'opacity-60 grayscale-[30%]' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center p-2.5 bg-slate-100 border border-slate-200 rounded-xl">
                    {acc.platform === 'instagram' ? <Instagram size={24} className="text-pink-600" /> :
                     acc.platform === 'telegram' ? <Send size={24} className="text-sky-600" /> :
                     acc.platform === 'tiktok' ? <Music size={24} className="text-slate-800" /> :
                     acc.platform === 'twitter' ? <Twitter size={24} className="text-cyan-600" /> :
                     acc.platform === 'facebook' ? <Facebook size={24} className="text-blue-600" /> :
                     acc.platform === 'threads' ? <AtSign size={24} className="text-slate-800" /> :
                     acc.platform === 'linkedin' ? <Linkedin size={24} className="text-blue-700" /> : 
                     <Link2 size={24} className="text-slate-500" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 capitalize text-base">{acc.platform}</h3>
                    <p className="text-xs text-slate-500 font-medium">Provider: <span className="uppercase text-rose-600 font-bold">{acc.provider}</span></p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <button 
                  onClick={() => toggleActive(acc.id, acc.is_active)}
                  className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors cursor-pointer ${acc.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${acc.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="mt-2 space-y-1.5">
                {getProfileUrl(acc.platform, acc.account_name) !== '#' ? (
                  <a 
                    href={getProfileUrl(acc.platform, acc.account_name)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
                  >
                    {acc.account_name} <Link2 size={12} />
                  </a>
                ) : (
                  <div className="text-sm font-semibold text-slate-800">{acc.account_name}</div>
                )}
                <div className="text-xs text-slate-600 font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-200">
                  {acc.account_id}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  acc.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {acc.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
                
                <button 
                  onClick={() => deleteAccount(acc.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 text-slate-900">
            <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Add Social Account</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Platform</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer shadow-2xs"
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  required
                >
                  <option value="instagram">Instagram</option>
                  <option value="telegram">Telegram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="facebook">Facebook</option>
                  <option value="threads">Threads</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Provider</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer shadow-2xs"
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  required
                >
                  <option value="repliz">Repliz API</option>
                  <option value="telegram">Telegram Bot API</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Account Display Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. @sahamfyp"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-2xs"
                  value={formData.account_name}
                  onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Account ID / Chat ID</label>
                <input 
                  type="text" 
                  placeholder="Repliz Account ID or TG Chat ID"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono shadow-2xs"
                  value={formData.account_id}
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

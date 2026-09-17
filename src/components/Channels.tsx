import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface SocialAccount {
  id: string;
  platform: string;
  provider: string;
  account_id: string;
  account_name: string;
  is_active: boolean;
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🔗 Social Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your publishing destinations (Repliz & Telegram).
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
        >
          + Add Account
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
          No accounts configured yet. Click "Add Account" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col gap-3 transition ${
                !acc.is_active ? 'opacity-60 grayscale-[50%]' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {acc.platform === 'instagram' ? '📱' :
                     acc.platform === 'telegram' ? '✈️' :
                     acc.platform === 'tiktok' ? '🎵' :
                     acc.platform === 'twitter' ? '𝕏' :
                     acc.platform === 'facebook' ? '📘' :
                     acc.platform === 'threads' ? '🧵' :
                     acc.platform === 'linkedin' ? '💼' : '🔗'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 capitalize">{acc.platform}</h3>
                    <p className="text-xs text-slate-500 font-medium">Provider: <span className="uppercase text-blue-600">{acc.provider}</span></p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <button 
                  onClick={() => toggleActive(acc.id, acc.is_active)}
                  className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${acc.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${acc.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="mt-2 space-y-1">
                <div className="text-sm font-medium text-slate-700">{acc.account_name}</div>
                <div className="text-xs text-slate-400 font-mono break-all bg-slate-50 p-1.5 rounded border border-slate-100">
                  {acc.account_id}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  acc.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {acc.is_active ? 'Active' : 'Inactive'}
                </span>
                
                <button 
                  onClick={() => deleteAccount(acc.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
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
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Add Social Account</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  required
                >
                  <option value="repliz">Repliz API</option>
                  <option value="telegram">Telegram Bot API</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Display Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. @sahamfyp"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.account_name}
                  onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account ID / Chat ID</label>
                <input 
                  type="text" 
                  placeholder="Repliz Account ID or TG Chat ID"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.account_id}
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm"
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

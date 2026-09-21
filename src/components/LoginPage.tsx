// Login Page Component
import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { signIn, storeMasterSession, DEMO_CREDENTIALS, type AuthUser } from '../services/auth';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onBackToLanding?: () => void;
}

export default function LoginPage({ onLoginSuccess, onBackToLanding }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  const handleCopy = async (text: string, field: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback if clipboard API is blocked
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleUseDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result.user) {
        const authUser: AuthUser = {
          id: result.user.id,
          email: result.user.email || email,
          role: result.user.role || 'admin',
        };
        
        // Store master/demo session
        storeMasterSession(authUser);
        
        // Call success callback
        onLoginSuccess(authUser);
      } else {
        setError('Login gagal. Cek email dan password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📰 SahamFYP</h1>
          <p className="text-slate-400">Generator Konten Saham untuk Instagram</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Login</h2>

          {/* Demo Account Info Box */}
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Akun Demo Pengujian</span>
              </div>
              <button
                type="button"
                onClick={handleUseDemo}
                className="text-xs bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-medium px-2.5 py-1 rounded-md transition shadow-sm"
              >
                Gunakan Demo
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Email Row */}
              <div className="flex items-center justify-between bg-white/90 px-3 py-2 rounded-lg border border-amber-100 shadow-2xs">
                <span className="text-slate-500 font-medium">Email:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-slate-800 font-semibold select-all">
                    {DEMO_CREDENTIALS.email}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(DEMO_CREDENTIALS.email, 'email')}
                    title="Salin Email"
                    className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-100/50 rounded transition flex items-center gap-1 text-[11px]"
                  >
                    {copiedField === 'email' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Row */}
              <div className="flex items-center justify-between bg-white/90 px-3 py-2 rounded-lg border border-amber-100 shadow-2xs">
                <span className="text-slate-500 font-medium">Password:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-slate-800 font-semibold select-all">
                    {DEMO_CREDENTIALS.password}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(DEMO_CREDENTIALS.password, 'password')}
                    title="Salin Password"
                    className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-100/50 rounded transition flex items-center gap-1 text-[11px]"
                  >
                    {copiedField === 'password' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Loading...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {onBackToLanding && (
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onBackToLanding}
                className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition inline-flex items-center gap-1"
              >
                <span>← Kembali ke Halaman Utama (Tentang SahamFYP)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          v1.0.0 — SahamFYP Dashboard
        </p>
      </div>
    </div>
  );
}
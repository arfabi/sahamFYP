import React from 'react';
import {
  TrendingUp,
  ShieldAlert,
  Newspaper,
  Database,
  Workflow,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Share2,
  Eye,
  LogIn,
  Zap,
  Send,
  Instagram,
  Facebook,
  Music,
  AtSign,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin?: () => void;
  onEnterDemo?: () => void;
  inDashboard?: boolean;
  onBackToOverview?: () => void;
}

export default function LandingPage({
  onGoToLogin,
  onEnterDemo,
  inDashboard = false,
  onBackToOverview,
}: LandingPageProps) {
  const handleLoginClick = () => {
    if (onGoToLogin) {
      onGoToLogin();
    } else if (onEnterDemo) {
      onEnterDemo();
    }
  };

  const scrollToSocialAccounts = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('social-accounts');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a060c] text-slate-100 selection:bg-rose-500 selection:text-white font-sans">
      {/* ─── Top Navigation Bar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a060c]/85 border-b border-[#251323]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-sahamfyp.png"
              alt="SahamFYP Logo"
              className="w-10 h-10 rounded-full object-cover shadow-lg shadow-rose-500/25 border border-rose-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">SahamFYP</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 hidden sm:inline-block">
                  Sectors Hackathon
                </span>
              </div>
              <p className="text-[11px] text-rose-200/60 -mt-0.5 hidden sm:block">
                Gen Z Stock Education & Anti-FOMO Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {inDashboard ? (
              <button
                onClick={onBackToOverview}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md shadow-rose-500/20"
              >
                <span>← Kembali ke Dashboard</span>
              </button>
            ) : (
              <button
                onClick={handleLoginClick}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:via-orange-400 hover:to-amber-400 text-white font-extrabold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-rose-500/30 flex items-center gap-1.5 active:scale-95"
              >
                <LogIn className="w-4 h-4 text-white" />
                <span>Login Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-28 border-b border-[#251323]">
        {/* Ambient background glow — Rose/Crimson & Warm Amber Copper from slides/1.png */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-rose-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#170c18] border border-[#33182f] text-rose-300 text-xs font-semibold mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>AI Market Brief & Anti-FOMO Watchlist</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            "Make Data Make Sense <br />
            <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              For Gen-Z"
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Mentransformasi riset sekuritas 25+ lembar dan laporan keuangan tebal menjadi visual watchlist harian berbasis <strong>Sectors REST API</strong>, lengkap dengan bedah katalis 3W dan sistem peringatan risiko (warning) objektif untuk <strong>54,4% investor Gen Z</strong> di Indonesia.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {!inDashboard && (
              <button
                onClick={handleLoginClick}
                className="px-7 py-3.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white font-extrabold rounded-xl text-sm sm:text-base transition shadow-xl shadow-rose-500/30 flex items-center gap-2 active:scale-95"
              >
                <span>Login Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <a
              href="#social-accounts"
              onClick={scrollToSocialAccounts}
              className="px-5 py-3.5 bg-[#170c18] hover:bg-[#231224] border border-[#381934] text-rose-200 font-semibold rounded-xl text-sm transition flex items-center gap-2"
            >
              <span>📱 Lihat Akun Publik Media Sosial</span>
              <span className="text-orange-400">↓</span>
            </a>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 text-left">
            <div className="bg-[#140b17]/80 border border-[#2b1528] p-4 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">54,4%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Investor BEI adalah Gen Z (&lt;30 thn)</p>
            </div>
            <div className="bg-[#140b17]/80 border border-[#2b1528] p-4 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Otonom & Unattended Pipeline (n8n)</p>
            </div>
            <div className="bg-[#140b17]/80 border border-[#2b1528] p-4 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-black text-amber-400">7+ Endpoint</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Sectors REST API Resmi (Data Tulang Punggung)</p>
            </div>
            <div className="bg-[#140b17]/80 border border-[#2b1528] p-4 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-black text-rose-400">5 Kanal</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Multi-Publishing Medsos via Repliz API</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Concept & Architecture Diagram Section ─────────── */}
      <section className="py-16 md:py-24 border-b border-[#251323] bg-[#0e0711]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Konsep & Arsitektur
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Data + Otomasi + Kontrol = Konten Finansial Berkualitas
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              Diagram alur kerja otonom SahamFYP: menghubungkan LLM AI, Sectors.app REST API, dan n8n orchestrator langsung ke multi-kanal media sosial publik.
            </p>
          </div>

          {/* Architecture Diagram Card */}
          <div className="bg-[#140c17] border border-[#31172f] rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-orange-500/5 to-amber-500/5 pointer-events-none" />
            
            <div className="relative rounded-2xl overflow-hidden border border-[#3b1c38] shadow-xl bg-white">
              <img
                src="/slides/sahamfyp-concept.png"
                alt="Konsep & Arsitektur Sistem SahamFYP"
                className="w-full h-auto object-contain mx-auto transition-transform duration-300 hover:scale-[1.01]"
              />
            </div>

            {/* 4 Pillars Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="bg-[#1a0e1e]/90 p-4 rounded-2xl border border-[#361a33]">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <Cpu className="w-4 h-4" />
                  <span>1. AI & Reasoning</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Sumopod / Gemini LLM untuk riset berita, klasifikasi emiten, dan generator naskah edukatif.
                </p>
              </div>

              <div className="bg-[#1a0e1e]/90 p-4 rounded-2xl border border-[#361a33]">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
                  <Database className="w-4 h-4" />
                  <span>2. Sectors.app API</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Pasokan data resmi sektor, valuasi fundamental (PER, PBV, ROE, DER), serta top changes pasar.
                </p>
              </div>

              <div className="bg-[#1a0e1e]/90 p-4 rounded-2xl border border-[#361a33]">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Workflow className="w-4 h-4" />
                  <span>3. n8n Orchestration</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Automasi alur kerja harian tanpa operator: trigger sesi open/close, render gambar, dan logging.
                </p>
              </div>

              <div className="bg-[#1a0e1e]/90 p-4 rounded-2xl border border-[#361a33]">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                  <Share2 className="w-4 h-4" />
                  <span>4. Multi-Publishing</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Distribusi otomatis via Repliz API ke Instagram, TikTok, Threads, Facebook, dan Telegram.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 2: Latar Belakang & Masalah Gen Z ────────── */}
      <section className="py-16 md:py-24 border-b border-[#251323]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Latar Belakang & Masalah
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Dilema Gen Z: Beli Saham Modal FOMO vs Riset Sekuritas Kaku
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              Berdasarkan data Kustodian Sentral Efek Indonesia (KSEI), generasi muda mendominasi pasar modal namun terperangkap dalam asimetri informasi yang merugikan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="bg-[#140b17]/90 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-red-400">Realita: Pom-Pom & FOMO Medsos</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  <strong>70% Gen Z</strong> menelan info investasi mentah-mentah dari video TikTok, Reels, dan grup Telegram pom-pom bandar yang menjanjikan cuan instan <em>"To The Moon"</em>.
                </p>
                <div className="mt-4 p-3 bg-red-950/40 rounded-xl border border-red-900/50 text-[11px] text-red-300">
                  ⚠️ <strong>Dampak:</strong> Rata-rata hold saham hanya 1–3 bulan. Sering beli di pucuk harga dan berakhir jadi <em>exit liquidity</em> bagi spekulan pasar.
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#291426] flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Status: Cepat tapi Boncos</span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-[#140b17]/90 border border-[#31192e] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-4">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">Dilema: Riset Sekuritas Kaku</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Riset sekuritas dan keterbukaan informasi BEI sebetulnya akurat dan resmi. Namun disajikan dalam dokumen PDF 20–30+ lembar dengan tabel abu-abu dan istilah rumit (DER, EBITDA, WACC).
                </p>
                <div className="mt-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-[11px] text-slate-300">
                  ℹ️ <strong>Dampak:</strong> <strong>60%+ investor pemula</strong> tidak melakukan analisis fundamental karena pusing dan tidak ramah bagi generasi <em>mobile-first</em>.
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#291426] flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Status: Akurat tapi Kaku</span>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-gradient-to-b from-rose-950/40 via-[#180d1b] to-[#120815] border border-rose-500/40 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-rose-500/10">
              <div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center mb-4 shadow-md shadow-rose-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-rose-300">Solusi: Jembatan SahamFYP</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Mengambil <strong>kedalaman data riset Sectors API</strong> dan memformatnya menjadi <strong>daya cerna visual media sosial</strong> dengan analogi sehari-hari tanpa mengorbankan akurasi.
                </p>
                <div className="mt-4 p-3 bg-rose-950/60 rounded-xl border border-rose-500/30 text-[11px] text-rose-200">
                  ✨ <strong>Anti-FOMO Reality Check:</strong> Jika saham ramai tapi utang menumpuk atau rugi, SahamFYP memberikan <strong>Red Flag / Warning</strong> lugas!
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-rose-500/20 flex items-center gap-2 text-xs text-rose-300 font-mono font-bold">
                <span>Status: Valid, Edukatif, Siap Tayang</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 3: Framework 3W & Anti-FOMO Warning ─────── */}
      <section className="py-16 md:py-24 border-b border-[#251323] bg-[#0e0711]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Core Logic & AI Reasoning
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 leading-snug">
                Framework Ekstraksi 3W & Sistem Deteksi Red Flag
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
                Bukan sekadar menulis ulang berita (*rewrite*), AI SahamFYP mengekstrak intisari peristiwa menjadi 3 komponen esensial, lalu mencocokkannya dengan metrik keuangan resmi dari Sectors API:
              </p>

              <div className="space-y-3.5 mt-6">
                <div className="flex items-start gap-3 bg-[#150d18] p-3.5 rounded-xl border border-[#2d162a]">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">WHAT — Peristiwa Nyata</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fakta konkret aksi korporasi, kontrak baru, atau perubahan kinerja yang diumumkan emiten.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#150d18] p-3.5 rounded-xl border border-[#2d162a]">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">WHY — Konteks & Pendorong</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Mengapa katalis tersebut terjadi (tren komoditas, ekspansi pabrik, restrukturisasi utang).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#150d18] p-3.5 rounded-xl border border-[#2d162a]">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">IMPACT — Verifikasi Data Fundamental</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Apakah katalis benar-benar berdampak pada laba bersih, valuasi PER/PBV, atau hanya sensasi sesaat?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Risk Badge Showcase */}
            <div className="bg-gradient-to-br from-[#160c18] to-[#100713] border border-[#351932] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#2d162a]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                </div>
                <span className="text-xs text-rose-300 font-mono">Anti-FOMO Guard • Active</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>CONTOH PERINGATAN RED FLAG (WARNING)</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    <em>"Emiten XYZ sedang viral di medsos karena isu merger. Namun data Sectors API mencatat Debt-to-Equity (DER) mencapai 4.8x dan Net Income masih merugi -Rp120 Miliar. Waspada jebakan FOMO!"</em>
                  </p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md font-mono">DER: 4.8x (High)</span>
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md font-mono">Valuasi: Bubble</span>
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md font-mono">Status: Warning</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONTOH VALIDASI SEHAT (GREEN LIGHT)</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    <em>"Katalis kontrak baru emiten ABC didukung oleh PER 7.2x (di bawah rata-rata sektor 14.1x) dan ROE konsisten di atas 18%. Fundamental solid dan terverifikasi."</em>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4: Fitur Utama Platform ─────────────────── */}
      <section className="py-16 md:py-24 border-b border-[#251323]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Fitur Lengkap Platform
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Sistem Operasional End-to-End
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Dari deteksi berita, analisis rasio emiten, hingga publikasi terjadwal multi-kanal media sosial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#140b17]/80 border border-[#2c162a] p-6 rounded-2xl hover:border-rose-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Newspaper className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">📡 News Monitoring Real-Time</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Memantau feed RSS dari 8 media ekonomi terkemuka (Kontan, Bisnis.com, CNBC, Detik, dll) dan keterbukaan informasi BEI, diklasifikasikan dengan tagging sentimen Bullish/Bearish.
              </p>
            </div>

            <div className="bg-[#140b17]/80 border border-[#2c162a] p-6 rounded-2xl hover:border-rose-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">📈 Daily Market Brief</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Ringkasan pasar sebelum jam bursa buka (08:00 WIB) dan pasca tutup (16:00 WIB), menganalisis kondisi IHSG harian, pergerakan sektor, dan foreign flow secara otomatis.
              </p>
            </div>

            <div className="bg-[#140b17]/80 border border-[#2c162a] p-6 rounded-2xl hover:border-rose-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">👁️ Stock Watchlist & Evaluasi</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Menyaring kandidat saham unggulan dengan perbandingan valuasi terhadap sektornya (PE vs Avg PE Sektor, PBV vs Avg PBV, ROE, DER, dan sinyal teknikal Moving Average).
              </p>
            </div>

            <div className="bg-[#140b17]/80 border border-[#2c162a] p-6 rounded-2xl hover:border-rose-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">🗂️ Posts & Live Sync Repliz</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Manajemen seluruh konten terbit (otomatis n8n & manual generator) dengan sinkronisasi status antrean jadwal publikasi dan live link media sosial dari Repliz API.
              </p>
            </div>

            <div className="bg-[#140b17]/80 border border-[#2c162a] p-6 rounded-2xl hover:border-rose-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">✍️ Content Generator AI & Manual</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Wizard pembuatan konten visual instan: LLM menyusun naskah carousel slide edukatif, kemudian dirender ke grafis beresolusi tinggi (1080x1350) siap publish.
              </p>
            </div>

            <div className="bg-[#140b17]/80 border border-[#2c162a] p-6 rounded-2xl hover:border-rose-500/40 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">🤖 100% Otonom via n8n</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Dua workflow mandiri (Daily Market Brief & News Monitoring) yang berjalan terjadwal tanpa operator manusia, lengkap dengan bot alert status di Telegram.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 5: Sectors.app REST API — The Core Backbone ─ */}
      <section className="py-16 md:py-24 border-b border-[#251323] bg-[#0e0711]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#1b0d1e] via-[#150a18] to-[#1c0e18] border border-[#3c1b37] rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-xs uppercase tracking-wider mb-3">
              <Database className="w-4 h-4" />
              <span>Core Data Source • Wajib & Tak Tergantikan</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Mengapa Sectors.app REST API Merupakan Jantung SahamFYP?
            </h2>

            <blockquote className="mt-4 p-4 rounded-xl bg-[#0c060e]/80 border-l-4 border-rose-500 text-slate-300 text-xs sm:text-sm leading-relaxed italic">
              "SahamFYP menggunakan Sectors REST API di setiap tahap alur — deteksi ticker, enrichment laporan keuangan & valuasi, ranking top movers berkapitalisasi wajar, hingga foreign flow dan kalkulasi teknikal Moving Average. <strong>Kalau data Sectors.app dicabut, produk ini kehilangan fungsi intinya</strong>: slide 4–6 di semua template konten bergantung penuh pada data tersebut untuk verifikasi faktual. Tanpa Sectors API, sistem hanya jadi rewrite berita tanpa nilai tambah — persis kebalikan dari misi produk ini."
            </blockquote>

            <div className="mt-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Daftar Endpoint Resmi Sectors.app REST API yang Diintegrasikan:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#100713] p-3 rounded-xl border border-[#2b1429]">
                  <span className="text-rose-400 font-bold">/v2/company/report/{'{ticker}'}/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Laporan keuangan, PER, PBV, ROE, DER, Market Cap</p>
                </div>
                <div className="bg-[#100713] p-3 rounded-xl border border-[#2b1429]">
                  <span className="text-orange-400 font-bold">/v2/daily/{'{ticker}'}/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Harga harian, volume transaksi, pergerakan MA harian</p>
                </div>
                <div className="bg-[#100713] p-3 rounded-xl border border-[#2b1429]">
                  <span className="text-amber-400 font-bold">/v2/brokers/top/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Aktivitas akumulasi dan distribusi broker sekuritas</p>
                </div>
                <div className="bg-[#100713] p-3 rounded-xl border border-[#2b1429]">
                  <span className="text-rose-400 font-bold">/v2/companies/top-changes/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Daftar top gainers & losers saham teraktif harian</p>
                </div>
                <div className="bg-[#100713] p-3 rounded-xl border border-[#2b1429]">
                  <span className="text-orange-400 font-bold">/v2/news/ & /v2/filings/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Keterbukaan informasi resmi BEI dan kurasi berita pasar</p>
                </div>
                <div className="bg-[#100713] p-3 rounded-xl border border-[#2b1429]">
                  <span className="text-amber-400 font-bold">/v2/index-daily/ihsg/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Data historis performa indeks gabungan IHSG</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <a
                  href="https://sectors.app/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
                >
                  <span>Lihat Dokumentasi Sectors.app API</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 6: Bukti Eksekusi Nyata (Akun Media Sosial) ─── */}
      <section id="social-accounts" className="py-16 md:py-24 border-b border-[#251323] scroll-mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Bukti Eksekusi Nyata
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Akun Publik yang Berjalan 100% Otonom
            </h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Seluruh kanal media sosial berikut aktif menerima konten hasil automasi pipeline SahamFYP secara berkala tanpa intervensi manual. Silakan kunjungi profil langsung untuk melihat hasil postingan live:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Instagram */}
            <div className="bg-gradient-to-b from-[#160d19] to-[#0f0712] border border-pink-500/30 hover:border-pink-500/60 p-6 rounded-3xl transition shadow-xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                    Feed Carousel
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition">
                  Instagram
                </h3>
                <p className="text-sm font-mono text-pink-400 mt-0.5">@sahamfyp.id</p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Pusat rilis carousel visual resolusi tinggi (1080×1350) untuk ringkasan <strong>Market Open</strong>, bedah katalis 3W, dan peringatan anti-FOMO harian.
                </p>

                <div className="mt-4 p-3 bg-[#110813] rounded-xl border border-[#2b1328] text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-slate-200 font-semibold">08:00 WIB & Breaking</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-slate-200 font-semibold">Browserless + Repliz</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2a1327]">
                <a
                  href="https://instagram.com/sahamfyp.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-pink-600/25"
                >
                  <span>Buka Profil Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: Threads */}
            <div className="bg-gradient-to-b from-[#160d19] to-[#0f0712] border border-slate-700/80 hover:border-slate-500 p-6 rounded-3xl transition shadow-xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-lg shadow-white/10">
                    <AtSign className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Microblogging
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-slate-200 transition">
                  Threads
                </h3>
                <p className="text-sm font-mono text-slate-400 mt-0.5">@sahamfyp.id</p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Rilis utas (thread) poin-poin penting katalis bursa saham, ringkasan pergerakan IHSG harian, dan forum diskusi santai bagi investor muda.
                </p>

                <div className="mt-4 p-3 bg-[#110813] rounded-xl border border-[#2b1328] text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-slate-200 font-semibold">Simultan dg Instagram</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-slate-200 font-semibold">Repliz Threads API</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2a1327]">
                <a
                  href="https://www.threads.com/@sahamfyp.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Buka Profil Threads</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 3: TikTok */}
            <div className="bg-gradient-to-b from-[#160d19] to-[#0f0712] border border-cyan-500/30 hover:border-cyan-500/60 p-6 rounded-3xl transition shadow-xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-slate-900 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                    <Music className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Slide Mode
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                  TikTok
                </h3>
                <p className="text-sm font-mono text-cyan-400 mt-0.5">@sahamfyp.id</p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Format carousel slide interaktif vertikal yang cepat dinavigasi (*swipe*), menyasar langsung demografi Gen Z pada platform video pendek.
                </p>

                <div className="mt-4 p-3 bg-[#110813] rounded-xl border border-[#2b1328] text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-slate-200 font-semibold">Pagi & Sore Bursa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-slate-200 font-semibold">Repliz TikTok Dispatch</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2a1327]">
                <a
                  href="https://tiktok.com/@sahamfyp.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-cyan-600/25"
                >
                  <span>Buka Profil TikTok</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 4: Facebook */}
            <div className="bg-gradient-to-b from-[#160d19] to-[#0f0712] border border-blue-500/30 hover:border-blue-500/60 p-6 rounded-3xl transition shadow-xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    Halaman Publik
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition">
                  Facebook Page
                </h3>
                <p className="text-sm font-mono text-blue-400 mt-0.5">sahamfyp.id</p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Postingan multi-gambar album lengkap dengan caption panjang berisi analisis fundamental, analogi Gen Z, dan disclaimer edukasi resmi.
                </p>

                <div className="mt-4 p-3 bg-[#110813] rounded-xl border border-[#2b1328] text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-slate-200 font-semibold">Otomatis Terjadwal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-slate-200 font-semibold">Meta Graph via Repliz</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2a1327]">
                <a
                  href="https://facebook.com/sahamfyp.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/25"
                >
                  <span>Buka Halaman Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 5: Telegram Channel */}
            <div className="bg-gradient-to-b from-[#160d19] to-[#0f0712] border border-sky-500/30 hover:border-sky-500/60 p-6 rounded-3xl transition shadow-xl flex flex-col justify-between group md:col-span-2 lg:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                    <Send className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Instant Channel
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition">
                  Telegram Channel & Broadcast
                </h3>
                <p className="text-sm font-mono text-sky-400 mt-0.5">@sahamfyp (t.me/sahamfyp)</p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Saluran siaran tercepat: mengirimkan gambar carousel resolusi asli tanpa kompresi, sinyal katalis berita mendadak, serta laporan log eksekusi otomatis pipeline sebagai bukti <em>unattended execution</em> tanpa operator.
                </p>

                <div className="mt-4 p-3 bg-[#110813] rounded-xl border border-[#2b1328] text-[11px] text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-slate-200 font-semibold">Real-time & Harian</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kualitas Aset:</span>
                    <span className="text-slate-200 font-semibold">Full HD Original</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2a1327]">
                <a
                  href="https://t.me/sahamfyp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-sky-600/25"
                >
                  <span>Gabung ke Telegram Channel @sahamfyp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Banner ────────────────────────────────── */}
      {!inDashboard && (
        <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-[#0a060c] via-[#120715] to-[#0a060c]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Siap Menguji Langsung Live Dashboard?
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
              Tidak perlu setup environment atau mengisi API key. Masuk dan jelajahi seluruh fitur monitoring dan automasi.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <button
                onClick={handleLoginClick}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white font-extrabold rounded-2xl text-base transition shadow-2xl shadow-rose-500/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Login Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="py-8 border-t border-[#251323] text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo-sahamfyp.png" alt="SahamFYP Logo" className="w-5 h-5 rounded-full object-cover" />
          <span className="font-bold text-slate-300">SahamFYP</span>
        </div>
        <p>© 2026 SahamFYP. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Disclaimer: Konten bersifat edukasi & verifikasi data publik pasar modal (DYOR). Bukan nasihat keuangan atau ajakan transaksi efek.
        </p>
      </footer>
    </div>
  );
}

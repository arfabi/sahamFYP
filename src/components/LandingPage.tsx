import React from 'react';
import {
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Newspaper,
  Database,
  Workflow,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart3,
  Building2,
  Lock,
  Cpu,
  Share2,
  Eye,
  LogIn,
  Check,
  Zap,
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
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-900 font-sans">
      {/* ─── Top Navigation Bar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              📰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">SahamFYP</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline-block">
                  Sectors Hackathon 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Autonomous Financial Content & Anti-FOMO Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {inDashboard ? (
              <button
                onClick={onBackToOverview}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <span>← Kembali ke Dashboard</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onGoToLogin}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition hidden sm:inline-flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login Manual</span>
                </button>
                <button
                  onClick={onEnterDemo}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/25 flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>🚀 Buka Demo Dashboard</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-amber-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Track 01: Automation & Workflows • AI Agents & Assistants</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            "Make Market Data <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500 bg-clip-text text-transparent">
              Make Sense."
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            AI Market Brief & Anti-FOMO Watchlist untuk <strong>54,4% investor Gen Z</strong> di Indonesia. Mentransformasi riset sekuritas 25+ lembar dan laporan keuangan tebal menjadi visual watchlist harian berbasis <strong>Sectors REST API</strong>, lengkap dengan bedah katalis 3W dan sistem peringatan risiko (warning) objektif.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {!inDashboard && (
              <button
                onClick={onEnterDemo}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-extrabold rounded-xl text-sm sm:text-base transition shadow-xl shadow-amber-500/25 flex items-center gap-2 active:scale-95"
              >
                <span>🚀 Eksplorasi Live Dashboard (1-Klik Tanpa Setup)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <a
              href="https://instagram.com/sahamfyp.id"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition flex items-center gap-2"
            >
              <span>📱 Akun Live Instagram (@sahamfyp.id)</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 text-left">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-black text-amber-400">54,4%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Investor BEI adalah Gen Z (&lt;30 thn)</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Otonom & Unattended Pipeline (n8n)</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-black text-blue-400">7+ Endpoint</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Sectors REST API Resmi (Data Tulang Punggung)</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-black text-purple-400">5 Kanal</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Multi-Publishing Medsos via Repliz API</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 1: Latar Belakang & Masalah Gen Z ────────── */}
      <section className="py-16 md:py-24 border-b border-slate-800/80 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
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
            <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
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
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Status: Cepat tapi Boncos</span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
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
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Status: Akurat tapi Kaku</span>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-amber-500/5">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-amber-400">Solusi: Jembatan SahamFYP</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Mengambil <strong>kedalaman data riset Sectors API</strong> dan memformatnya menjadi <strong>daya cerna visual media sosial</strong> dengan analogi sehari-hari tanpa mengorbankan akurasi.
                </p>
                <div className="mt-4 p-3 bg-amber-950/60 rounded-xl border border-amber-500/30 text-[11px] text-amber-200">
                  ✨ <strong>Anti-FOMO Reality Check:</strong> Jika saham ramai tapi utang menumpuk atau rugi, SahamFYP memberikan <strong>Red Flag / Warning</strong> lugas!
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-amber-500/20 flex items-center gap-2 text-xs text-amber-400 font-mono font-bold">
                <span>Status: Valid, Edukatif, Siap Tayang</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 2: Framework 3W & Anti-FOMO Warning ─────── */}
      <section className="py-16 md:py-24 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Core Logic & AI Reasoning
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 leading-snug">
                Framework Ekstraksi 3W & Sistem Deteksi Red Flag
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
                Bukan sekadar menulis ulang berita (*rewrite*), AI SahamFYP mengekstrak intisari peristiwa menjadi 3 komponen esensial, lalu mencocokkannya dengan metrik keuangan resmi dari Sectors API:
              </p>

              <div className="space-y-3.5 mt-6">
                <div className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">WHAT — Peristiwa Nyata</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fakta konkret aksi korporasi, kontrak baru, atau perubahan kinerja yang diumumkan emiten.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">WHY — Konteks & Pendorong</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Mengapa katalis tersebut terjadi (tren komoditas, ekspansi pabrik, restrukturisasi utang).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
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
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="text-xs text-slate-400 font-mono">Anti-FOMO Guard • Active</span>
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

      {/* ─── Section 3: Fitur Utama Platform ─────────────────── */}
      <section className="py-16 md:py-24 border-b border-slate-800/80 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
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
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Newspaper className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">📡 News Monitoring Real-Time</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Memantau feed RSS dari 8 media ekonomi terkemuka (Kontan, Bisnis.com, CNBC, Detik, dll) dan keterbukaan informasi BEI, diklasifikasikan dengan tagging sentimen Bullish/Bearish.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">📈 Daily Market Brief</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Ringkasan pasar sebelum jam bursa buka (08:00 WIB) dan pasca tutup (16:00 WIB), menganalisis kondisi IHSG harian, pergerakan sektor, dan foreign flow secara otomatis.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">👁️ Stock Watchlist & Evaluasi</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Menyaring kandidat saham unggulan dengan perbandingan valuasi terhadap sektornya (PE vs Avg PE Sektor, PBV vs Avg PBV, ROE, DER, dan sinyal teknikal Moving Average).
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">🗂️ Posts & Live Sync Repliz</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Manajemen seluruh konten terbit (otomatis n8n & manual generator) dengan sinkronisasi status antrean jadwal publikasi dan live link media sosial dari Repliz API.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">✍️ Content Generator AI & Manual</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Wizard pembuatan konten visual instan: LLM menyusun naskah carousel slide edukatif, kemudian dirender ke grafis beresolusi tinggi (1080x1350) siap publish.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition">
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

      {/* ─── Section 4: Sectors.app REST API — The Core Backbone ─ */}
      <section className="py-16 md:py-24 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-2.5 text-blue-400 font-bold text-xs uppercase tracking-wider mb-3">
              <Database className="w-4 h-4" />
              <span>Core Data Source • Wajib & Tak Tergantikan</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Mengapa Sectors.app REST API Merupakan Jantung SahamFYP?
            </h2>

            <blockquote className="mt-4 p-4 rounded-xl bg-slate-900/80 border-l-4 border-amber-400 text-slate-300 text-xs sm:text-sm leading-relaxed italic">
              "SahamFYP menggunakan Sectors REST API di setiap tahap alur — deteksi ticker, enrichment laporan keuangan & valuasi, ranking top movers berkapitalisasi wajar, hingga foreign flow dan kalkulasi teknikal Moving Average. <strong>Kalau data Sectors.app dicabut, produk ini kehilangan fungsi intinya</strong>: slide 4–6 di semua template konten bergantung penuh pada data tersebut untuk verifikasi faktual. Tanpa Sectors API, sistem hanya jadi rewrite berita tanpa nilai tambah — persis kebalikan dari misi produk ini."
            </blockquote>

            <div className="mt-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Daftar Endpoint Resmi Sectors.app REST API yang Diintegrasikan:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold">/v2/company/report/{'{ticker}'}/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Laporan keuangan, PER, PBV, ROE, DER, Market Cap</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold">/v2/daily/{'{ticker}'}/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Harga harian, volume transaksi, pergerakan MA harian</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold">/v2/brokers/top/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Aktivitas akumulasi dan distribusi broker sekuritas</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold">/v2/companies/top-changes/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Daftar top gainers & losers saham teraktif harian</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold">/v2/news/ & /v2/filings/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Keterbukaan informasi resmi BEI dan kurasi berita pasar</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold">/v2/index-daily/ihsg/</span>
                  <p className="text-[11px] font-sans text-slate-400 mt-1">Data historis performa indeks gabungan IHSG</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <a
                  href="https://sectors.app/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                >
                  <span>Lihat Dokumentasi Sectors.app API</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 5: Kriteria Penilaian Hackathon Track 01 ─── */}
      <section className="py-16 md:py-24 border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Evaluasi Teknis & Standar Eksekusi
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Kesesuaian Standar Penilaian Hackathon (Track 01)
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Merujuk pada arahan dewan juri terkait bobot penilaian <strong>Usability Komunitas (70%)</strong> dan <strong>Technical Depth (30%)</strong>:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 70% Card */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Bobot 70%
                  </span>
                  <span className="text-xs font-mono text-slate-400">Real-World Usability</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Siap Digunakan Publik Tanpa Setup (.env / API Key)
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Sebagaimana ditegaskan juri, aplikasi web yang dikirimkan harus bisa langsung diuji oleh publik dan dewan juri tanpa perlu memasukkan API key sendiri atau memodifikasi file konfigurasi:
                </p>

                <ul className="space-y-2.5 mt-5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>1-Click Live Access:</strong> Cukup klik tombol demo, akun pengujian langsung aktif tanpa registrasi rumit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Live Production Proof:</strong> Akun publik <strong>@sahamfyp.id</strong> sudah berjalan di dunia nyata melayani audiens investor Gen Z di Instagram, Threads, TikTok, FB, dan Telegram.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Antarmuka Responsif:</strong> Membantu investor pemula, kreator konten, dan analis melihat status eksekusi secara transparan.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Kriteria Usability 100% Terpenuhi
                </span>
              </div>
            </div>

            {/* 30% Card */}
            <div className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Bobot 30%
                  </span>
                  <span className="text-xs font-mono text-slate-400">Technical Depth & Execution</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Arsitektur Otonom, Aman, & Modular
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Solusi dibangun dengan arsitektur produksi modern yang tangguh (*zero-trust security*):
                </p>

                <ul className="space-y-2.5 mt-5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Multi-Service Orchestration:</strong> n8n menyatukan Sectors REST API, Sumopod LLM, Browserless HTML-to-Image, Supabase Database & Storage, dan Repliz Dispatch.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>Keamanan Kredensial:</strong> Zero API keys terekspos di repo publik atau bundle frontend; seluruh panggilan sensitif diamankan oleh serverless proxy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong>LLM-Agnostic Engine:</strong> Standar interface OpenAI-compatible (Sumopod) memudahkan pertukaran model kapan saja tanpa refactor kode inti.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Kriteria Teknis 100% Terpenuhi
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 6: Live Social Proof ────────────────────── */}
      <section className="py-16 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Bukti Eksekusi Nyata
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Akun Publik yang Berjalan 100% Otonom
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Lihat hasil produksi dan jadwal posting harian langsung di platform media sosial:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a
              href="https://instagram.com/sahamfyp.id"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <span>📸 Instagram (@sahamfyp.id)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
            <a
              href="https://www.threads.com/@sahamfyp.id"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <span>🧵 Threads (@sahamfyp.id)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
            <a
              href="https://tiktok.com/@sahamfyp.id"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <span>🎵 TikTok (@sahamfyp.id)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
            <a
              href="https://facebook.com/sahamfyp.id"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <span>📘 Facebook (@sahamfyp.id)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
            <a
              href="https://t.me/sahamfyp"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <span>✈️ Telegram Channel (@sahamfyp)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Final CTA Banner ────────────────────────────────── */}
      {!inDashboard && (
        <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Siap Menguji Langsung Live Dashboard?
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
              Tidak perlu setup environment atau mengisi API key. Akun demo pengujian sudah siap pakai.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onEnterDemo}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:opacity-95 text-slate-950 font-extrabold rounded-2xl text-base transition shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>🚀 Masuk Demo Dashboard (1-Klik)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onGoToLogin}
                className="w-full sm:w-auto px-6 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-2xl text-sm transition"
              >
                <span>Login dengan Email & Password</span>
              </button>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 font-mono">
              Akun Demo: <code>demo@sahamfyp.id</code> / <code>d3m0cu4n</code>
            </p>
          </div>
        </section>
      )}

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 SahamFYP • Sectors Hackathon Track 01. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Disclaimer: Konten bersifat edukasi & verifikasi data publik pasar modal (DYOR). Bukan nasihat keuangan atau ajakan transaksi efek.
        </p>
      </footer>
    </div>
  );
}

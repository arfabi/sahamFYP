import React, { useState } from 'react';
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
  Sparkles,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin?: () => void;
  onEnterDemo?: () => void;
  inDashboard?: boolean;
  onBackToOverview?: () => void;
}

interface CaseStudy {
  id: string;
  ticker: string;
  name: string;
  category: 'brief' | 'green' | 'red' | 'catalyst';
  badge: string;
  badgeBg: string;
  title: string;
  summary: string;
  slidesPrefix: string;
  totalSlides: number;
  slideLabels: { title: string; desc: string }[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'market-brief',
    ticker: 'OPEN',
    name: 'Daily Market Brief (23 September 2026)',
    category: 'brief',
    badge: 'Sesi Open • Daily Market Brief',
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    title: 'Market Open: IHSG Terkoreksi, 4 Emiten Masuk Radar',
    summary:
      'Hasil kurasi otomatis pipeline n8n & Sectors API: update IHSG 6.277, top movers, serta membedah 4 emiten watchlist (SILO, BSSR, CDIA, WIKA) lengkap dengan matriks 4 kuadran & kamus Gen Z.',
    slidesPrefix:
      'https://xgqsrttpdxiiqknuulwl.supabase.co/storage/v1/object/public/sfyp-storage/slide-4651-',
    totalSlides: 10,
    slideLabels: [
      { title: 'Cover Market Open', desc: 'Sesi pembukaan pasar, tanggal trading, & ringkasan kurasi berita' },
      { title: 'TL;DR Ringkasan Hari Ini', desc: 'Status IHSG, top gainer, top loser, arus asing, & katalis utama' },
      { title: 'Kondisi Market Kemarin', desc: 'Pergerakan IHSG 6.277 (-1.68%), data top movers, & foreign flow net sell' },
      { title: 'Watchlist #1: $SILO', desc: 'Katalis ekspansi akuisisi 14 RS, evaluasi efisiensi operasional & valuasi' },
      { title: 'Watchlist #2: $BSSR', desc: 'Dividen jumbo yield tinggi, analisis cash flow & laba sektor batu bara' },
      { title: 'Watchlist #3: $CDIA', desc: 'Dividen interim US$10 Juta dari Prajogo Pangestu & jadwal cum date' },
      { title: 'Watchlist #4: $WIKA', desc: 'Studi kasus risiko restrukturisasi obligasi BUMN & manajemen risiko' },
      { title: 'Matriks 4 Kuadran', desc: 'Pemetaan Fundamental vs Teknikal: Q1 Investasi, Q2 Value, Q3 Momentum, Q4 Hindari' },
      { title: 'Kamus Saham Gen Z', desc: 'Penjelasan istilah awam: PER, PBV, ROE, MA20/MA50, & Foreign Flow' },
      { title: 'Kesimpulan & Disclaimer', desc: 'Aturan manajemen modal, panduan DYOR objektif, & call-to-action' },
    ],
  },
  {
    id: 'bbca',
    ticker: 'BBCA',
    name: 'PT Bank Central Asia Tbk',
    category: 'green',
    badge: 'Fundamental Solid • Green Light',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    title: 'Laba Tembus Rp 29,5T — Primadona Portofolio?',
    summary:
      'Laporan keuangan Semester I-2026 diverifikasi langsung ke Sectors API. ROE konsisten di atas 20% dengan NPL sehat, memvalidasi katalis laba secara objektif.',
    slidesPrefix:
      'https://xgqsrttpdxiiqknuulwl.supabase.co/storage/v1/object/public/sfyp-storage/slide-3938-',
    totalSlides: 8,
    slideLabels: [
      { title: 'Hook Gen Z', desc: 'Membuka atensi dengan pertanyaan kritis laba Rp 29,5T' },
      { title: 'What: Peristiwa Nyata', desc: 'Rincian pertumbuhan laba bersih Semester I' },
      { title: 'Why: Pendorong Kinerja', desc: 'Ekspansi kredit dan pendapatan bunga bersih' },
      { title: 'Sectors API Grounding', desc: 'Metrik resmi: PER vs Sektor, PBV, dan ROE' },
      { title: 'Asset Quality Check', desc: 'Verifikasi NPL rendah dan pencadangan modal' },
      { title: 'Market Sentiment', desc: 'Arus dana asing (foreign flow) & akumulasi broker' },
      { title: 'Kalkulasi Kewajaran', desc: 'Analisis premi valuasi vs risiko perlambatan' },
      { title: 'Takeaway & DYOR', desc: 'Kesimpulan objektif tanpa janji cuan instan' },
    ],
  },
  {
    id: 'smra',
    ticker: 'SMRA',
    name: 'PT Summarecon Agung Tbk',
    category: 'red',
    badge: 'Anti-FOMO Guard • Red Flag',
    badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
    title: 'Geger Penggeledahan KPK — Ambil atau Hindari?',
    summary:
      'Sistem mendeteksi sentimen hukum berisiko tinggi. Data Sectors API mengungkap leverage utang (DER) dan arus kas, mengaktifkan peringatan Anti-FOMO Red Flag.',
    slidesPrefix:
      'https://xgqsrttpdxiiqknuulwl.supabase.co/storage/v1/object/public/sfyp-storage/slide-3972-',
    totalSlides: 8,
    slideLabels: [
      { title: 'Hook Peristiwa Geger', desc: 'Isu hukum viral di medsos yang memicu kepanikan' },
      { title: 'Kronologi Kasus Nyata', desc: 'Fakta keterbukaan informasi kasus suap HGB' },
      { title: 'Dampak Sektor Properti', desc: 'Sentimen ke proyek berjalan dan kepercayaan pasar' },
      { title: 'Sectors API Debt Check', desc: 'Verifikasi Debt-to-Equity (DER) & beban bunga' },
      { title: 'Anti-FOMO Warning', desc: 'Peringatan keras agar tidak menangkap pisau jatuh' },
      { title: 'Sinyal Moving Average', desc: 'Indikator teknikal MA harian & level support' },
      { title: 'Strategi Proteksi Modal', desc: 'Panduan evaluasi risiko bagi investor pemula' },
      { title: 'Edukasi Kepatuhan', desc: 'Prinsip money management & disclaimer resmi' },
    ],
  },
  {
    id: 'ammn',
    ticker: 'AMMN',
    name: 'PT Amman Mineral Internasional Tbk',
    category: 'catalyst',
    badge: 'Katalis Turnaround • Special Event',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    title: 'Dari Rugi Jadi Laba Rp 8,6T — Efisiensi Gahar',
    summary:
      'Lonjakan laba spektakuler berkat operasional smelter tembaga. Sectors API membedah apakah lonjakan ini berkelanjutan atau sudah terdiskon di harga saat ini.',
    slidesPrefix:
      'https://xgqsrttpdxiiqknuulwl.supabase.co/storage/v1/object/public/sfyp-storage/slide-3994-',
    totalSlides: 8,
    slideLabels: [
      { title: 'Hook Pembalikan Arah', desc: 'Dulu rugi, sekarang mencetak laba Rp 8,6 Triliun' },
      { title: 'Fakta Laporan Keuangan', desc: 'Angka konkret perbaikan margin operasional' },
      { title: 'Progres Smelter Tembaga', desc: 'Katalis hilirisasi komoditas dan target ekspor' },
      { title: 'Sectors API Financials', desc: 'Rasio profitabilitas dan perbandingan industri tambang' },
      { title: 'Reality Check Valuasi', desc: 'Harga saham sudah reli tinggi: evaluasi risiko bubble' },
      { title: 'Volatilitas Komoditas', desc: 'Dampak pergerakan harga tembaga & emas global' },
      { title: 'Skenario Bullish vs Bearish', desc: 'Dua sudut pandang objektif untuk investor' },
      { title: 'Checklist Sebelum Beli', desc: 'Pentingnya analisis risiko sebelum transaksi' },
    ],
  },
];

export default function LandingPage({
  onGoToLogin,
  onEnterDemo,
  inDashboard = false,
  onBackToOverview,
}: LandingPageProps) {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const currentCase = CASE_STUDIES[activeCaseIndex];

  const handleLoginClick = () => {
    if (onEnterDemo) {
      onEnterDemo();
    } else if (onGoToLogin) {
      onGoToLogin();
    }
  };

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : currentCase.totalSlides - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev < currentCase.totalSlides - 1 ? prev + 1 : 0));
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

          <div className="flex items-center gap-2 sm:gap-3">
            {inDashboard ? (
              <button
                onClick={onBackToOverview}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 shadow-md shadow-rose-500/20"
              >
                <span>← Kembali ke Dashboard</span>
              </button>
            ) : (
              <>
                {/* Social media icons shortcut */}
                <div className="flex items-center gap-1 sm:gap-1.5 border-r border-[#2d162a] pr-2 sm:pr-3">
                  <a
                    href="https://instagram.com/sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram @sahamfyp.id"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 transition"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.threads.com/@sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Threads @sahamfyp.id"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                  >
                    <AtSign className="w-4 h-4" />
                  </a>
                  <a
                    href="https://tiktok.com/@sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="TikTok @sahamfyp.id"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                  >
                    <Music className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com/sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook Page sahamfyp.id"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition hidden md:inline-flex"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://t.me/sahamfyp"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Telegram Channel @sahamfyp"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition hidden md:inline-flex"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                </div>

                <button
                  onClick={handleLoginClick}
                  className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-rose-500/10 to-orange-500/10 hover:from-rose-500/20 hover:to-orange-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-200 hover:text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Pantau log eksekusi n8n, status publish, dan data Sectors API secara real-time"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Buka Dashboard Monitoring</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── 1. Hero Section (Hook & Janji Produk) ───────────── */}
      <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-28 border-b border-[#251323]">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-rose-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#170c18] border border-[#33182f] text-rose-300 text-xs font-semibold mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Autonomous Financial Media • Powered by Sectors REST API</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            "Make Data Make Sense <br />
            <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              For Gen-Z"
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            SahamFYP mengubah riset sekuritas 20+ lembar jadi Daily Market Brief visual — lengkap bedah katalis 3W (What, Why, What's Next) dan sistem warning risiko objektif, dirancang untuk <strong>54,4% investor Gen-Z Indonesia</strong> yang butuh data jelas dan mudah dimengerti. Paham dulu, baru FOMO.
          </p>

          {/* Call to Actions (Dual Proof: Hasil Postingan & Dashboard Monitoring) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <a
                href="#product-showcase"
                onClick={(e) => scrollToSection(e, 'product-showcase')}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white font-extrabold rounded-xl text-sm sm:text-base transition shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-95 group text-center"
              >
                <Smartphone className="w-4 h-4 text-amber-200" />
                <span>📱 Lihat Hasil Postingan</span>
                <span className="text-amber-200 group-hover:translate-y-0.5 transition-transform">↓</span>
              </a>
              <p className="mt-2 text-xs text-slate-400 text-center leading-snug">
                Lihat output final yang tayang di Instagram, TikTok &amp; lainnya
              </p>
            </div>

            {!inDashboard && (
              <div className="flex flex-col items-center">
                <button
                  onClick={handleLoginClick}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-purple-600 via-rose-600 to-orange-500 hover:opacity-95 text-white font-extrabold rounded-xl text-sm sm:text-base transition shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 group text-center"
                >
                  <BarChart3 className="w-4 h-4 text-rose-200" />
                  <span>Buka Dashboard Monitoring</span>
                  <ArrowRight className="w-4 h-4 text-rose-200 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="mt-2 text-xs text-slate-400 text-center leading-snug">
                  Pantau log eksekusi n8n, status publish, dan data Sectors API secara real-time
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 text-left">
            <div className="bg-[#140b17]/80 border border-[#2b1528] p-4 rounded-2xl">
              <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">54,4%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Investor BEI adalah Gen Z (&lt;30 thn)</p>
              <p className="text-[10px] text-slate-500 mt-1 italic">Riset Demografi KSEI & BEI</p>
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

      {/* ─── 2. Dilema Gen Z (Masalah Nyata) ──────────────────── */}
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
              Berdasarkan data resmi <strong>Kustodian Sentral Efek Indonesia (KSEI)</strong> dan <strong>Bursa Efek Indonesia (BEI)</strong>, <strong>54,4%</strong> investor pasar modal adalah generasi muda (usia &le;30 tahun). Namun mereka terperangkap di antara dua kutub yang sama-sama merugikan:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Box 1: Pom-Pom Sosmed with Screenshot */}
            <div className="bg-[#140b17]/90 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-red-400">1. Realita: Pom-Pom & FOMO Medsos</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  <strong>70% Gen Z</strong> menelan info investasi mentah-mentah dari konten TikTok, Reels, dan grup Telegram pom-pom yang menjanjikan cuan instan <em>"To The Moon"</em>.
                  <span className="block mt-1 text-[10px] text-red-300/80 font-medium">
                    *Referensi Jurnal: Rohman & Safiih (2025); Anastasya, Ridha, & Windarsari (2025)
                  </span>
                </p>

                {/* Screenshot Bukti FOMO Medsos */}
                <div className="mt-4 rounded-xl overflow-hidden border border-red-900/40 bg-black/40 shadow-inner group-hover:border-red-500/50 transition">
                  <img
                    src="/slides/fomo-sosmed.png"
                    alt="Bukti Fenomena Pom-Pom dan FOMO Medsos"
                    className="w-full h-44 object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4 p-3 bg-red-950/40 rounded-xl border border-red-900/50 text-[11px] text-red-300">
                  ⚠️ <strong>Dampak:</strong> Rata-rata hold saham hanya 1–3 bulan <em>(Sumber: Analisis Transaksi Ritel Pasar Modal BEI)</em>. Sering beli di pucuk harga dan berakhir jadi <em>exit liquidity</em> spekulan.
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#291426] flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Status: Cepat tapi Boncos</span>
              </div>
            </div>

            {/* Box 2: Riset Sekuritas Kaku with Screenshot */}
            <div className="bg-[#140b17]/90 border border-[#31192e] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-4">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">2. Dilema: Riset Sekuritas Kaku</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Riset sekuritas dan keterbukaan informasi BEI sebetulnya akurat dan resmi. Namun disajikan dalam dokumen PDF 20–30+ lembar dengan tabel abu-abu dan istilah rumit.
                </p>

                {/* Screenshot Bukti Riset Sekuritas */}
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 bg-black/40 shadow-inner group-hover:border-slate-600 transition">
                  <img
                    src="/slides/risetsekuritas.png"
                    alt="Bukti Dokumen Riset Sekuritas Kaku 25+ Halaman"
                    className="w-full h-44 object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-[11px] text-slate-300">
                  ℹ️ <strong>Dampak:</strong> <strong>60%+ investor pemula</strong> tidak membaca riset fundamental karena pusing dan tidak ramah bagi generasi <em>mobile-first</em>.
                  <span className="block mt-1 text-[10px] text-slate-400 font-medium">
                    *Referensi Jurnal: Adinda, Wahid, & Sitorus (2025); Katadata Opini (2025)
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#291426] flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>Status: Akurat tapi Kaku</span>
              </div>
            </div>

            {/* Box 3: Solusi Jembatan SahamFYP */}
            <div className="bg-gradient-to-b from-rose-950/40 via-[#180d1b] to-[#120815] border border-rose-500/40 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-rose-500/10">
              <div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center mb-4 shadow-md shadow-rose-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-rose-300">3. Solusi: Jembatan SahamFYP</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Mengambil <strong>kedalaman data riset Sectors API</strong> dan memformatnya menjadi <strong>daya cerna visual media sosial</strong> dengan analogi sehari-hari tanpa mengorbankan akurasi.
                </p>

                {/* Solusi Preview Box */}
                <div className="mt-4 p-4 rounded-xl bg-[#120814] border border-rose-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Visual Watchlist 8 Slide</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Format carousel 4:5 yang mudah di-swipe di Instagram, TikTok, Threads, dan Facebook.
                  </p>
                  <div className="flex items-center gap-2 text-rose-400 font-bold pt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Anti-FOMO Reality Check</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Jika emiten viral tapi rugi atau utang menumpuk, sistem langsung menyalakan <strong>Red Flag Warning</strong>!
                  </p>
                </div>

                <div className="mt-4 p-3 bg-rose-950/60 rounded-xl border border-rose-500/30 text-[11px] text-rose-200">
                  ✨ <strong>Hasil:</strong> Edukasi data-driven yang menyenangkan, objektif, dan melindungi portofolio Gen Z.
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-rose-500/20 flex items-center gap-2 text-xs text-rose-300 font-mono font-bold">
                <span>Status: Valid, Edukatif, Siap Tayang</span>
              </div>
            </div>
          </div>

          {/* Research & Data Reference Table Callout */}
          <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-[#140b17]/90 border border-[#2b1528] shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#2b1528]">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-rose-400" />
                <span>Referensi Jurnal Ilmiah & Data Publikasi Pasar Modal</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Terverifikasi Akademik & Publikasi Resmi</span>
            </div>

            {/* 1. Jurnal Ilmiah Section */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Publikasi Jurnal Ilmiah (Peer-Reviewed)</span>
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#1b0e1e] border border-[#351832] flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-1.5">
                      Jurnal Bisman (2025)
                    </span>
                    <p className="text-slate-200 text-xs font-semibold leading-snug">
                      Mind over media: Moderasi literasi keuangan dalam pengaruh finfluencer dan FOMO terhadap keputusan investasi pada investor pemula.
                    </p>
                    <p className="text-slate-400 text-[11px] mt-1.5 italic font-serif">
                      Anastasya, L., Ridha, A., & Windarsari, W. R. (2025). <em>Bisman (Bisnis dan Manajemen): The Journal of Business and Management</em>, 8(2), 508–523.
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-rose-950/60 text-[10px] text-slate-400">
                    💡 <strong>Fokus:</strong> Bukti empiris peran finfluencer dan FOMO terhadap keputusan investasi pemula serta pentingnya moderasi literasi keuangan.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1b0e1e] border border-[#351832] flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 mb-1.5">
                      Jurnal Innobiz (2025)
                    </span>
                    <p className="text-slate-200 text-xs font-semibold leading-snug">
                      Meningkatkan investor saham Gen Z di Indonesia.
                    </p>
                    <p className="text-slate-400 text-[11px] mt-1.5 italic font-serif">
                      Adinda, D. N., Wahid, A., & Sitorus, M. (2025). <em>Innovation and Business: Jurnal Ilmu Manajemen, Bisnis dan Keuangan (Innobiz)</em>, 2(2), 13–23.
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-orange-950/60 text-[10px] text-slate-400">
                    💡 <strong>Fokus:</strong> Strategi meningkatkan pemahaman pasar modal dan keterlibatan investor saham Gen Z di Indonesia secara berkelanjutan.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1b0e1e] border border-[#351832] flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1.5">
                      Prosiding Semnas Manajemen (2025)
                    </span>
                    <p className="text-slate-200 text-xs font-semibold leading-snug">
                      Pengaruh media sosial terhadap keputusan investasi saham di kalangan Generasi Z.
                    </p>
                    <p className="text-slate-400 text-[11px] mt-1.5 italic font-serif">
                      Rohman, A., & Safiih, A. R. (2025). <em>Prosiding Seminar Nasional Manajemen</em>, 4(1), 366–373.
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-amber-950/60 text-[10px] text-slate-400">
                    💡 <strong>Fokus:</strong> Validasi empiris dominasi paparan media sosial terhadap keputusan transaksi saham kalangan Generasi Z.
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Data Statistik & Publikasi Katadata */}
            <div className="mt-5 pt-4 border-t border-[#2b1528] space-y-3">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Publikasi Data Statistik & Analisis Pasar (Katadata)</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a
                  href="https://databoks.katadata.co.id/pasar/statistik/66bdf4a992e5b/gen-z-dan-milenial-mendominasi-investor-pasar-modal-di-indonesia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-[#170e1b] border border-[#30172e] hover:border-cyan-500/50 transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Katadata Databoks (Statistik KSEI / BEI)
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition" />
                    </div>
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition mt-1">
                      Gen Z dan Milenial Mendominasi Investor Pasar Modal di Indonesia
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Data demografi resmi bursa: Gen Z (&lt;30 tahun) mendominasi lebih dari 54%–55% jumlah investor pasar modal Indonesia.
                    </p>
                  </div>
                  <span className="mt-2.5 text-[10px] text-cyan-400 font-mono group-hover:underline flex items-center gap-1">
                    <span>databoks.katadata.co.id/pasar/statistik/...</span>
                    <span>↗</span>
                  </span>
                </a>

                <a
                  href="https://katadata.co.id/indepth/opini/6a505cc400c1e/membangun-fondasi-investasi-gen-z-sejak-dini"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-[#170e1b] border border-[#30172e] hover:border-rose-500/50 transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Katadata Opini (Indepth Analysis)
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition" />
                    </div>
                    <p className="text-xs font-bold text-white group-hover:text-rose-300 transition mt-1">
                      Membangun Fondasi Investasi Gen Z Sejak Dini
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Analisis urgensi membekali generasi muda dengan literasi fundamental, pengelolaan risiko, dan data pasar riil sebelum melakukan transaksi saham.
                    </p>
                  </div>
                  <span className="mt-2.5 text-[10px] text-rose-400 font-mono group-hover:underline flex items-center gap-1">
                    <span>katadata.co.id/indepth/opini/...</span>
                    <span>↗</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Konsep & Arsitektur (Solusi Ringkas) ─────────── */}
      <section className="py-16 md:py-24 border-b border-[#251323] bg-[#0e0711]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Konsep & Arsitektur
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-2 leading-tight">
              Katalis (Berita dan Filings) + Data (Sectors.app) + LLM AI + Otomasi = Konten Finansial Berkualitas dan Dipahami Gen Z
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

      {/* ─── 4. INTERACTIVE CAROUSEL SHOWCASE (PRODUK UTAMA) ──── */}
      <section
        id="product-showcase"
        className="py-16 md:py-24 border-b border-[#251323] bg-gradient-to-b from-[#120716] via-[#16091b] to-[#0d0610] scroll-mt-12"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Showcase Produk Utama • Live Rendered Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Wujud Nyata Postingan yang Dihasilkan Sistem
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              Ini adalah aset visual asli beresolusi tinggi (rasio 4:5 / 1080×1350) yang di-generate oleh engine SahamFYP dan diterbitkan secara otonom ke akun media sosial. Klik slide untuk melihat anatomi data:
            </p>

            {/* Case Study Switcher Tabs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {CASE_STUDIES.map((item, idx) => {
                const isActive = activeCaseIndex === idx;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveCaseIndex(idx);
                      setActiveSlideIndex(0);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${isActive
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25 scale-[1.02]'
                        : 'bg-[#180b1b] hover:bg-[#25112a] text-slate-300 border border-[#331730]'
                      }`}
                  >
                    <span>
                      {item.category === 'brief' && '📊'}
                      {item.category === 'green' && '🟢'}
                      {item.category === 'red' && '🔴'}
                      {item.category === 'catalyst' && '⚡'}
                    </span>
                    <span>{item.id === 'market-brief' ? 'Daily Market Brief' : `$${item.ticker}`}</span>
                    <span className="opacity-80 text-[11px] hidden sm:inline">
                      ({item.category === 'brief'
                        ? 'Market Open'
                        : item.category === 'green'
                        ? 'Fundamental Solid'
                        : item.category === 'red'
                        ? 'Red Flag Warning'
                        : 'Turnaround'})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Player Grid (Smartphone Mockup + Anatomy Breakdown) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
            {/* Left Column: Smartphone Mockup Frame */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-[340px] sm:max-w-[380px] bg-[#0c050e] border-[5px] border-[#361a34] rounded-[2.8rem] p-3 shadow-2xl shadow-rose-950/40 relative">
                {/* Smartphone Dynamic Island Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1e0d20] rounded-full z-20 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 mr-2" />
                  <span className="w-2 h-2 rounded-full bg-rose-500/50" />
                </div>

                {/* Phone Screen Container */}
                <div className="bg-[#120815] rounded-[2.3rem] overflow-hidden pt-6 pb-3 border border-[#2b1328]">
                  {/* Mockup Instagram Feed Header */}
                  <div className="px-4 py-2 flex items-center justify-between border-b border-[#241122]">
                    <div className="flex items-center gap-2">
                      <img
                        src="/logo-sahamfyp.png"
                        alt="SahamFYP"
                        className="w-7 h-7 rounded-full border border-rose-500/40"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white">sahamfyp.id</span>
                          <span className="w-3 h-3 rounded-full bg-rose-500 text-[8px] flex items-center justify-center font-bold text-white">✓</span>
                        </div>
                        <p className="text-[9px] text-slate-400 -mt-0.5">Sectors API Verified</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-rose-300 font-mono bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {activeSlideIndex + 1}/{currentCase.totalSlides}
                    </span>
                  </div>

                  {/* Main Slide Image Display */}
                  <div className="relative aspect-[4/5] bg-black overflow-hidden group">
                    <img
                      src={`${currentCase.slidesPrefix}${activeSlideIndex}.jpg`}
                      alt={`${currentCase.ticker} - Slide ${activeSlideIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-200"
                    />

                    {/* Left/Right Floating Navigation Arrows */}
                    <button
                      onClick={handlePrevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-sm transition border border-white/20 active:scale-95"
                      title="Slide Sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-sm transition border border-white/20 active:scale-95"
                      title="Slide Selanjutnya"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Bottom Slide Indicator overlay */}
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                      {Array.from({ length: currentCase.totalSlides }).map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setActiveSlideIndex(dotIdx)}
                          className={`h-1.5 rounded-full transition-all ${activeSlideIndex === dotIdx ? 'w-4 bg-rose-400' : 'w-1.5 bg-white/40'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mockup Instagram Feed Caption footer */}
                  <div className="px-4 pt-2.5 pb-1">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                      <div className="flex items-center gap-3">
                        <span className="hover:text-rose-400 cursor-pointer">❤️ Suka</span>
                        <span className="hover:text-rose-400 cursor-pointer">💬 Komentar</span>
                        <span className="hover:text-rose-400 cursor-pointer">↗️ Bagikan</span>
                      </div>
                      <span className="text-[10px] text-slate-400">100% Otonom</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                      <strong className="text-white">sahamfyp.id</strong> {currentCase.title} — {currentCase.summary}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Case Details & 8-Slide Interactive Anatomy */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-[#150a18] p-5 rounded-3xl border border-[#351833]">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className={`text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full border ${currentCase.badgeBg}`}>
                    {currentCase.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Format: 1080×1350 Carousel
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {currentCase.id === 'market-brief' ? currentCase.name : `$${currentCase.ticker} — ${currentCase.name}`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {currentCase.summary}
                </p>
              </div>

              {/* Anatomy Slide Selector (Click to navigate slide) */}
              <div className="bg-[#140b17] p-4 sm:p-5 rounded-3xl border border-[#2e152d]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Anatomi {currentCase.totalSlides} Slide (Klik untuk Pratinjau):</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Slide {activeSlideIndex + 1} aktif
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentCase.slideLabels.map((lbl, idx) => {
                    const isSelected = activeSlideIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition flex items-start gap-2.5 ${isSelected
                            ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-sm'
                            : 'bg-[#100713] hover:bg-[#1a0c1b] border-[#291327] text-slate-300'
                          }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${isSelected ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                            }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold leading-tight">{lbl.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-1">
                            {lbl.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-[#291427] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Terhubung otomatis ke Instagram, Threads, TikTok & Telegram
                  </span>
                  <a
                    href="https://instagram.com/sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    <span>Cek di Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Akun Publik 100% Otonom (Bukti Eksekusi) ─────── */}
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
                  Pusat rilis carousel visual resolusi tinggi (1080×1350) untuk ringkasan <strong>Market Open</strong>, bedah katalis 3W (What, Why, What's Next), dan peringatan anti-FOMO harian.
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
                  Format carousel slide interaktif vertikal yang cepat dinavigasi (<em>swipe</em>), menyasar langsung demografi Gen Z pada platform video pendek.
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

      {/* ─── 6. Core Logic & Anti-FOMO Red Flag (Deep Dive) ──── */}
      <section className="py-16 md:py-24 border-b border-[#251323] bg-[#0e0711]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Core Logic & AI Reasoning
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2 leading-snug">
                Framework Ekstraksi 3W (What, Why, What's Next) & Sistem Deteksi Red Flag
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
                Bukan sekadar menulis ulang berita (<em>rewrite</em>), AI SahamFYP mengekstrak intisari peristiwa menjadi 3 pilar utama: <strong>What – Why – What's Next</strong>, lalu memvalidasinya dengan metrik keuangan resmi dari Sectors API:
              </p>

              <div className="space-y-3.5 mt-6">
                <div className="flex items-start gap-3 bg-[#150d18] p-3.5 rounded-xl border border-[#2d162a]">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">WHAT — Peristiwa Nyata</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fakta konkret aksi korporasi, keterbukaan informasi (filings) BEI, kontrak baru, atau rilis laporan keuangan emiten.
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
                      Mengapa katalis tersebut terjadi: pemicu industri makro, lonjakan harga komoditas acuan, ekspansi kapasitas, atau restrukturisasi utang.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#150d18] p-3.5 rounded-xl border border-[#2d162a]">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">WHAT'S NEXT — Langkah Selanjutnya & Proyeksi Risiko</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bukan sekadar dampak sesaat (<em>impact</em>), melainkan apa langkah ke depan bagi investor: verifikasi data fundamental & teknikal Sectors API, level pantauan kunci, dan peringatan risiko jika emiten tidak sehat.
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

      {/* ─── 7. Data Source (Sectors.app REST API) ───────────── */}
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

      {/* ─── 8. Dashboard Internal Operator (Yang Jalan di Baliknya) */}
      <section className="py-16 md:py-24 border-b border-[#251323]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Tool Internal Operator & Otomasi Backend
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Sistem Operasional Operator End-to-End
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Cockpit kendali internal untuk kurasi berita pasar, validasi rasio Sectors API, generator konten visual, dan monitoring live status publikasi.
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

      {/* ─── 9. Final CTA Banner (Dual Call to Action) ───────── */}
      {!inDashboard && (
        <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-b from-[#0a060c] via-[#120715] to-[#0a060c]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#170c18] border border-[#33182f] text-rose-300 text-xs font-semibold mb-5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Verifikasi Karya SahamFYP</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Edukasi Publik di Medsos atau Buka Dashboard Monitoring
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Dua cara verifikasi karya ini: lihat hasil akhirnya di medsos, atau intip langsung dapur otomasinya di dashboard.
            </p>

            {/* Dual Actions CTA */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <a
                  href="#product-showcase"
                  onClick={(e) => scrollToSection(e, 'product-showcase')}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white font-extrabold rounded-xl text-sm sm:text-base transition shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-95 group text-center"
                >
                  <Smartphone className="w-4 h-4 text-amber-200" />
                  <span>📱 Lihat Hasil Postingan</span>
                  <span className="text-amber-200 group-hover:translate-y-0.5 transition-transform">↓</span>
                </a>
                <p className="mt-2 text-xs text-slate-400 text-center leading-snug">
                  Lihat output final yang tayang di Instagram, TikTok &amp; lainnya
                </p>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={handleLoginClick}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-purple-600 via-rose-600 to-orange-500 hover:opacity-95 text-white font-extrabold rounded-xl text-sm sm:text-base transition shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 group text-center"
                >
                  <BarChart3 className="w-4 h-4 text-rose-200" />
                  <span>Buka Dashboard Monitoring</span>
                  <ArrowRight className="w-4 h-4 text-rose-200 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="mt-2 text-xs text-slate-400 text-center leading-snug">
                  Pantau log eksekusi n8n, status publish, dan data Sectors API secara real-time
                </p>
              </div>
            </div>

            {onGoToLogin && (
              <div className="mt-6 text-center">
                <button
                  onClick={onGoToLogin}
                  className="text-slate-500 hover:text-rose-300 text-xs transition underline-offset-4 hover:underline"
                >
                  Akses login kredensial operator (opsional) →
                </button>
              </div>
            )}
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

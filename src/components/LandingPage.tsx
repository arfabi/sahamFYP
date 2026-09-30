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
    badgeBg: 'bg-card text-navy border-line',
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
    badgeBg: 'bg-[#EAF7EE] text-up border-[#BDE8CB]',
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
    badgeBg: 'bg-[#FDEDEC] text-down border-[#F5C2BE]',
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
    badgeBg: 'bg-[#FEF6E6] text-warn border-[#FADBA2]',
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
    <div className="min-h-screen bg-paper text-ink font-body selection:bg-gold selection:text-ink">
      {/* ─── Top Navigation Bar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-paper/90 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-sahamfyp.png"
              alt="SahamFYP Logo"
              className="w-9 h-9 rounded-full object-cover border border-line"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-head font-extrabold text-lg text-ink tracking-tight">SahamFYP</span>
                <span className="text-[12px] font-body font-semibold px-2.5 py-0.5 rounded-full bg-card text-muted border border-line hidden sm:inline-block">
                  Sectors Hackathon
                </span>
              </div>
              <p className="text-[12px] text-muted -mt-0.5 hidden sm:block">
                Gen Z Stock Education & Anti-FOMO Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {inDashboard ? (
              <button
                onClick={onBackToOverview}
                className="px-4 py-2 bg-navy hover:bg-[#1c3563] text-on-navy font-body font-semibold rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm"
              >
                <span>← Kembali ke Dashboard</span>
              </button>
            ) : (
              <>
                {/* Social media icons shortcut */}
                <div className="flex items-center gap-1 sm:gap-1.5 border-r border-line pr-2 sm:pr-3">
                  <a
                    href="https://instagram.com/sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram @sahamfyp.id"
                    className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-card border border-transparent hover:border-line transition"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.threads.com/@sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Threads @sahamfyp.id"
                    className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-card border border-transparent hover:border-line transition"
                  >
                    <AtSign className="w-4 h-4" />
                  </a>
                  <a
                    href="https://tiktok.com/@sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="TikTok @sahamfyp.id"
                    className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-card border border-transparent hover:border-line transition"
                  >
                    <Music className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com/sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook Page sahamfyp.id"
                    className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-card border border-transparent hover:border-line transition hidden md:inline-flex"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://t.me/sahamfyp"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Telegram Channel @sahamfyp"
                    className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-card border border-transparent hover:border-line transition hidden md:inline-flex"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                </div>

                <button
                  onClick={handleLoginClick}
                  className="px-3.5 sm:px-4 py-2 bg-navy hover:bg-[#1c3563] text-on-navy font-body font-semibold rounded-lg text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Pantau log eksekusi n8n, status publish, dan data Sectors API secara real-time"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Buka Dashboard</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── 1. Hero Section (Hook & Janji Produk) ───────────── */}
      <section className="pt-14 pb-20 md:pt-20 md:pb-24 border-b border-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-line text-muted text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-up animate-pulse" />
            <span>Autonomous Financial Media • Powered by Sectors REST API</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-head font-extrabold text-ink tracking-tight leading-[1.12]">
            Make Data Make Sense for Gen-Z
          </h1>

          <p className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed font-normal">
            SahamFYP mengubah riset sekuritas 20+ lembar jadi Daily Market Brief visual — lengkap bedah katalis 3W (What, Why, What's Next) dan sistem warning risiko objektif, dirancang untuk <strong>54,4% investor Gen-Z Indonesia</strong> yang butuh data jelas dan mudah dimengerti. Paham dulu, baru FOMO.
          </p>

          {/* Call to Actions (Aturan: 1 Tombol Emas Primer per Layar) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <a
              href="#product-showcase"
              onClick={(e) => scrollToSection(e, 'product-showcase')}
              className="w-full sm:w-auto py-3 px-6 bg-gold hover:bg-[#e09c00] text-ink font-body font-semibold rounded-lg text-sm sm:text-base transition shadow-sm flex items-center justify-center gap-2 active:scale-95 focus-visible:outline-3 focus-visible:outline-gold focus-visible:outline-offset-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Lihat Hasil Postingan</span>
              <span className="transition-transform">↓</span>
            </a>

            {!inDashboard && (
              <button
                onClick={handleLoginClick}
                className="w-full sm:w-auto py-3 px-6 bg-navy hover:bg-[#1c3563] text-on-navy font-body font-semibold rounded-lg text-sm sm:text-base transition shadow-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Stats Grid (Tipografi: Archivo / IBM Plex Mono tabular-nums) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 text-left">
            <div className="bg-card border border-line p-4 rounded-xl">
              <p className="font-head font-extrabold text-2xl sm:text-3xl text-ink font-mono tabular-nums">54,4%</p>
              <p className="text-xs text-muted mt-1 font-medium">Investor BEI adalah Gen Z (&lt;30 thn)</p>
              <p className="text-[12px] text-muted mt-1 italic">Riset Demografi KSEI & BEI</p>
            </div>
            <div className="bg-card border border-line p-4 rounded-xl">
              <p className="font-head font-extrabold text-2xl sm:text-3xl text-up font-mono tabular-nums">100%</p>
              <p className="text-xs text-muted mt-1 font-medium">Otonom & Unattended Pipeline (n8n)</p>
            </div>
            <div className="bg-card border border-line p-4 rounded-xl">
              <p className="font-head font-extrabold text-2xl sm:text-3xl text-ink font-mono tabular-nums">7+ Endpoint</p>
              <p className="text-xs text-muted mt-1 font-medium">Sectors REST API Resmi (Tulang Punggung)</p>
            </div>
            <div className="bg-card border border-line p-4 rounded-xl">
              <p className="font-head font-extrabold text-2xl sm:text-3xl text-navy font-mono tabular-nums">5 Kanal</p>
              <p className="text-xs text-muted mt-1 font-medium">Multi-Publishing Medsos via Repliz API</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Dilema Gen Z (Masalah Nyata) ──────────────────── */}
      <section className="py-16 md:py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-line bg-card text-muted">
              Latar Belakang & Masalah
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-head font-extrabold text-ink mt-3">
              Dilema Gen Z: Beli Saham Modal FOMO vs Riset Sekuritas Kaku
            </h2>
            <p className="text-sm sm:text-base text-muted mt-3">
              Berdasarkan data resmi <strong>Kustodian Sentral Efek Indonesia (KSEI)</strong> dan <strong>Bursa Efek Indonesia (BEI)</strong>, <strong>54,4%</strong> investor pasar modal adalah generasi muda (usia &le;30 tahun). Namun mereka terperangkap di antara dua kutub yang sama-sama merugikan:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Box 1: Pom-Pom Sosmed */}
            <div className="bg-card border border-line border-l-4 border-l-down rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-paper border border-line text-down flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-head font-bold text-down">1. Realita: Pom-Pom & FOMO Medsos</h3>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  <strong>70% Gen Z</strong> menelan info investasi mentah-mentah dari konten TikTok, Reels, dan grup Telegram pom-pom yang menjanjikan cuan instan <em>"To The Moon"</em>.
                  <span className="block mt-1 text-[12px] text-muted font-medium">
                    *Referensi Jurnal: Rohman & Safiih (2025); Anastasya, Ridha, & Windarsari (2025)
                  </span>
                </p>

                {/* Screenshot Bukti FOMO Medsos */}
                <div className="mt-4 rounded-lg overflow-hidden border border-line bg-paper">
                  <img
                    src="/slides/fomo-sosmed.png"
                    alt="Bukti Fenomena Pom-Pom dan FOMO Medsos"
                    className="w-full h-44 object-cover object-top"
                  />
                </div>

                <div className="mt-4 p-3 bg-paper rounded-lg border border-line text-[12px] text-down">
                  ⚠️ <strong>Dampak:</strong> Rata-rata hold saham hanya 1–3 bulan <em>(Sumber: Analisis Transaksi Ritel Pasar Modal BEI)</em>. Sering beli di pucuk harga dan berakhir jadi <em>exit liquidity</em> spekulan.
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center gap-2 text-[12px] text-muted font-mono">
                <span>Status: Cepat tapi Boncos</span>
              </div>
            </div>

            {/* Box 2: Riset Sekuritas Kaku */}
            <div className="bg-card border border-line rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-paper border border-line text-ink flex items-center justify-center mb-4">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-head font-bold text-ink">2. Dilema: Riset Sekuritas Kaku</h3>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Riset sekuritas dan keterbukaan informasi BEI sebetulnya akurat dan resmi. Namun disajikan dalam dokumen PDF 20–30+ lembar dengan tabel abu-abu dan istilah rumit.
                </p>

                {/* Screenshot Bukti Riset Sekuritas */}
                <div className="mt-4 rounded-lg overflow-hidden border border-line bg-paper">
                  <img
                    src="/slides/risetsekuritas.png"
                    alt="Bukti Dokumen Riset Sekuritas Kaku 25+ Halaman"
                    className="w-full h-44 object-cover object-top"
                  />
                </div>

                <div className="mt-4 p-3 bg-paper rounded-lg border border-line text-[12px] text-muted">
                  ℹ️ <strong>Dampak:</strong> <strong>60%+ investor pemula</strong> tidak membaca riset fundamental karena pusing dan tidak ramah bagi generasi <em>mobile-first</em>.
                  <span className="block mt-1 text-[12px] text-muted font-medium">
                    *Referensi Jurnal: Adinda, Wahid, & Sitorus (2025); Katadata Opini (2025)
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center gap-2 text-[12px] text-muted font-mono">
                <span>Status: Akurat tapi Kaku</span>
              </div>
            </div>

            {/* Box 3: Solusi Jembatan SahamFYP */}
            <div className="bg-card border border-line border-l-4 border-l-up rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-paper border border-line text-up flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-head font-bold text-ink">3. Solusi: Jembatan SahamFYP</h3>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Mengambil <strong>kedalaman data riset Sectors API</strong> dan memformatnya menjadi <strong>daya cerna visual media sosial</strong> dengan analogi sehari-hari tanpa mengorbankan akurasi.
                </p>

                {/* Solusi Preview Box */}
                <div className="mt-4 p-3.5 rounded-lg bg-paper border border-line text-xs space-y-2">
                  <div className="flex items-center gap-2 text-up font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Visual Watchlist 8 Slide</span>
                  </div>
                  <p className="text-[12px] text-muted">
                    Format carousel 4:5 yang mudah di-swipe di Instagram, TikTok, Threads, dan Facebook.
                  </p>
                  <div className="flex items-center gap-2 text-down font-semibold pt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Anti-FOMO Reality Check</span>
                  </div>
                  <p className="text-[12px] text-muted">
                    Jika emiten viral tapi rugi atau utang menumpuk, sistem langsung menyalakan <strong>Red Flag Warning</strong>!
                  </p>
                </div>

                <div className="mt-4 p-3 bg-[#EAF7EE] rounded-lg border border-[#BDE8CB] text-[12px] text-up">
                  ✨ <strong>Hasil:</strong> Edukasi data-driven yang menyenangkan, objektif, dan melindungi portofolio Gen Z.
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center gap-2 text-[12px] text-up font-mono font-bold">
                <span>Status: Valid, Edukatif, Siap Tayang</span>
              </div>
            </div>
          </div>

          {/* Research & Data Reference Table Callout */}
          <div className="mt-10 p-5 sm:p-6 rounded-xl bg-card border border-line">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-line">
              <div className="flex items-center gap-2 text-ink font-head font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-navy" />
                <span>Referensi Jurnal Ilmiah & Data Publikasi Pasar Modal</span>
              </div>
              <span className="text-[12px] font-mono text-muted">Terverifikasi Akademik & Publikasi Resmi</span>
            </div>

            {/* 1. Jurnal Ilmiah Section */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-navy" />
                <span>Publikasi Jurnal Ilmiah (Peer-Reviewed)</span>
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-paper border border-line flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[12px] font-semibold bg-card text-muted border border-line mb-1.5">
                      Jurnal Bisman (2025)
                    </span>
                    <p className="text-ink text-xs font-semibold leading-snug">
                      Mind over media: Moderasi literasi keuangan dalam pengaruh finfluencer dan FOMO terhadap keputusan investasi pada investor pemula.
                    </p>
                    <p className="text-muted text-[12px] mt-1.5 italic">
                      Anastasya, L., Ridha, A., & Windarsari, W. R. (2025). <em>Bisman: The Journal of Business and Management</em>, 8(2), 508–523.
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-line text-[12px] text-muted">
                    💡 <strong>Fokus:</strong> Bukti empiris peran finfluencer dan FOMO terhadap keputusan investasi pemula serta pentingnya moderasi literasi keuangan.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-paper border border-line flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[12px] font-semibold bg-card text-muted border border-line mb-1.5">
                      Jurnal Innobiz (2025)
                    </span>
                    <p className="text-ink text-xs font-semibold leading-snug">
                      Meningkatkan investor saham Gen Z di Indonesia.
                    </p>
                    <p className="text-muted text-[12px] mt-1.5 italic">
                      Adinda, D. N., Wahid, A., & Sitorus, M. (2025). <em>Innovation and Business: Jurnal Ilmu Manajemen, Bisnis dan Keuangan (Innobiz)</em>, 2(2), 13–23.
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-line text-[12px] text-muted">
                    💡 <strong>Fokus:</strong> Strategi meningkatkan pemahaman pasar modal dan keterlibatan investor saham Gen Z di Indonesia secara berkelanjutan.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-paper border border-line flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[12px] font-semibold bg-card text-muted border border-line mb-1.5">
                      Prosiding Semnas Manajemen (2025)
                    </span>
                    <p className="text-ink text-xs font-semibold leading-snug">
                      Pengaruh media sosial terhadap keputusan investasi saham di kalangan Generasi Z.
                    </p>
                    <p className="text-muted text-[12px] mt-1.5 italic">
                      Rohman, A., & Safiih, A. R. (2025). <em>Prosiding Seminar Nasional Manajemen</em>, 4(1), 366–373.
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-line text-[12px] text-muted">
                    💡 <strong>Fokus:</strong> Validasi empiris dominasi paparan media sosial terhadap keputusan transaksi saham kalangan Generasi Z.
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Data Statistik & Publikasi Katadata */}
            <div className="mt-5 pt-4 border-t border-line space-y-3">
              <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-navy" />
                <span>Publikasi Data Statistik & Analisis Pasar (Katadata)</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a
                  href="https://databoks.katadata.co.id/pasar/statistik/66bdf4a992e5b/gen-z-dan-milenial-mendominasi-investor-pasar-modal-di-indonesia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-lg bg-paper border border-line hover:border-navy transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded text-[12px] font-semibold bg-card text-muted border border-line">
                        Katadata Databoks (Statistik KSEI / BEI)
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-navy transition" />
                    </div>
                    <p className="text-xs font-bold text-ink group-hover:text-navy transition mt-1">
                      Gen Z dan Milenial Mendominasi Investor Pasar Modal di Indonesia
                    </p>
                    <p className="text-[12px] text-muted mt-1">
                      Data demografi resmi bursa: Gen Z (&lt;30 tahun) mendominasi lebih dari 54%–55% jumlah investor pasar modal Indonesia.
                    </p>
                  </div>
                  <span className="mt-2.5 text-[12px] text-navy font-mono group-hover:underline flex items-center gap-1">
                    <span>databoks.katadata.co.id/pasar/statistik/...</span>
                    <span>↗</span>
                  </span>
                </a>

                <a
                  href="https://katadata.co.id/indepth/opini/6a505cc400c1e/membangun-fondasi-investasi-gen-z-sejak-dini"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-lg bg-paper border border-line hover:border-navy transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded text-[12px] font-semibold bg-card text-muted border border-line">
                        Katadata Opini (Indepth Analysis)
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-navy transition" />
                    </div>
                    <p className="text-xs font-bold text-ink group-hover:text-navy transition mt-1">
                      Membangun Fondasi Investasi Gen Z Sejak Dini
                    </p>
                    <p className="text-[12px] text-muted mt-1">
                      Analisis urgensi membekali generasi muda dengan literasi fundamental, pengelolaan risiko, dan data pasar riil sebelum melakukan transaksi saham.
                    </p>
                  </div>
                  <span className="mt-2.5 text-[12px] text-navy font-mono group-hover:underline flex items-center gap-1">
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
      <section className="py-16 md:py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-line bg-card text-muted">
              Konsep & Arsitektur
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-head font-extrabold text-ink mt-3 leading-tight">
              Katalis + Data (Sectors.app) + LLM AI + Otomasi = Konten Finansial Berkualitas dan Dipahami Gen Z
            </h2>
            <p className="text-sm sm:text-base text-muted mt-3">
              Diagram alur kerja otonom SahamFYP: menghubungkan LLM AI, Sectors.app REST API, dan n8n orchestrator langsung ke multi-kanal media sosial publik.
            </p>
          </div>

          {/* Architecture Diagram Card */}
          <div className="bg-card border border-line rounded-xl p-4 sm:p-6">
            <div className="rounded-lg overflow-hidden border border-line bg-paper">
              <img
                src="/slides/sahamfyp-concept.png"
                alt="Konsep & Arsitektur Sistem SahamFYP"
                className="w-full h-auto object-contain mx-auto"
              />
            </div>

            {/* 4 Pillars Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-paper p-4 rounded-lg border border-line">
                <div className="flex items-center gap-2 text-ink font-head font-bold text-xs">
                  <Cpu className="w-4 h-4 text-navy" />
                  <span>1. AI & Reasoning</span>
                </div>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Sumopod / Gemini LLM untuk riset berita, klasifikasi emiten, dan generator naskah edukatif.
                </p>
              </div>

              <div className="bg-paper p-4 rounded-lg border border-line">
                <div className="flex items-center gap-2 text-ink font-head font-bold text-xs">
                  <Database className="w-4 h-4 text-navy" />
                  <span>2. Sectors.app API</span>
                </div>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Pasokan data resmi sektor, valuasi fundamental (PER, PBV, ROE, DER), serta top changes pasar.
                </p>
              </div>

              <div className="bg-paper p-4 rounded-lg border border-line">
                <div className="flex items-center gap-2 text-ink font-head font-bold text-xs">
                  <Workflow className="w-4 h-4 text-navy" />
                  <span>3. n8n Orchestration</span>
                </div>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
                  Automasi alur kerja harian tanpa operator: trigger sesi open/close, render gambar, dan logging.
                </p>
              </div>

              <div className="bg-paper p-4 rounded-lg border border-line">
                <div className="flex items-center gap-2 text-ink font-head font-bold text-xs">
                  <Share2 className="w-4 h-4 text-navy" />
                  <span>4. Multi-Publishing</span>
                </div>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">
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
        className="py-16 md:py-20 border-b border-line scroll-mt-12"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-line text-muted text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Showcase Produk Utama • Live Rendered Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-head font-extrabold text-ink">
              Wujud Nyata Postingan yang Dihasilkan Sistem
            </h2>
            <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
              Aset visual beresolusi tinggi (rasio 4:5 / 1080×1350) yang di-generate oleh engine SahamFYP dan diterbitkan secara otonom ke feed Instagram. Klik slide untuk melihat anatomi data:
            </p>

            {/* Case Study Switcher Tabs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {CASE_STUDIES.map((item, idx) => {
                const isActive = activeCaseIndex === idx;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveCaseIndex(idx);
                      setActiveSlideIndex(0);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-navy text-on-navy shadow-sm'
                        : 'bg-card hover:bg-paper text-ink border border-line'
                    }`}
                  >
                    <span>
                      {item.category === 'brief' && '📊'}
                      {item.category === 'green' && '🟢'}
                      {item.category === 'red' && '🔴'}
                      {item.category === 'catalyst' && '⚡'}
                    </span>
                    <span className="font-mono">{item.id === 'market-brief' ? 'Daily Market Brief' : `$${item.ticker}`}</span>
                    <span className="opacity-80 text-[12px] hidden sm:inline">
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
              <div className="w-full max-w-[340px] sm:max-w-[370px] bg-card border border-line rounded-[2.5rem] p-3 shadow-md relative">
                {/* Smartphone Dynamic Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-paper rounded-full border border-line z-20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-line" />
                </div>

                {/* Phone Screen Container */}
                <div className="bg-paper rounded-[2rem] overflow-hidden pt-5 pb-3 border border-line">
                  {/* Mockup Instagram Feed Header */}
                  <div className="px-4 py-2 flex items-center justify-between border-b border-line bg-card">
                    <div className="flex items-center gap-2">
                      <img
                        src="/logo-sahamfyp.png"
                        alt="SahamFYP"
                        className="w-7 h-7 rounded-full border border-line"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-ink">sahamfyp.id</span>
                          <span className="w-3.5 h-3.5 rounded-full bg-navy text-[9px] flex items-center justify-center font-bold text-on-navy">✓</span>
                        </div>
                        <p className="text-[12px] text-muted -mt-0.5">Sectors API Verified</p>
                      </div>
                    </div>
                    <span className="text-[12px] text-muted font-mono bg-paper px-2 py-0.5 rounded-full border border-line">
                      {activeSlideIndex + 1}/{currentCase.totalSlides}
                    </span>
                  </div>

                  {/* Main Slide Image Display */}
                  <div className="relative aspect-[4/5] bg-paper overflow-hidden">
                    <img
                      src={`${currentCase.slidesPrefix}${activeSlideIndex}.jpg`}
                      alt={`${currentCase.ticker} - Slide ${activeSlideIndex + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Left/Right Floating Navigation Arrows */}
                    <button
                      onClick={handlePrevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/90 hover:bg-card text-ink flex items-center justify-center backdrop-blur-sm transition border border-line shadow-sm active:scale-95"
                      title="Slide Sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/90 hover:bg-card text-ink flex items-center justify-center backdrop-blur-sm transition border border-line shadow-sm active:scale-95"
                      title="Slide Selanjutnya"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Bottom Slide Indicator overlay */}
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/85 backdrop-blur-md border border-line">
                      {Array.from({ length: currentCase.totalSlides }).map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setActiveSlideIndex(dotIdx)}
                          className={`h-1.5 rounded-full transition-all ${
                            activeSlideIndex === dotIdx ? 'w-4 bg-navy' : 'w-1.5 bg-line'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mockup Instagram Feed Caption footer */}
                  <div className="px-4 pt-2.5 pb-1 bg-card border-t border-line">
                    <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                      <div className="flex items-center gap-3">
                        <span className="hover:text-ink cursor-pointer">❤️ Suka</span>
                        <span className="hover:text-ink cursor-pointer">💬 Komentar</span>
                        <span className="hover:text-ink cursor-pointer">↗️ Bagikan</span>
                      </div>
                      <span className="text-[12px] text-muted">100% Otonom</span>
                    </div>
                    <p className="text-[12px] text-ink leading-snug line-clamp-2">
                      <strong className="text-ink">sahamfyp.id</strong> {currentCase.title} — {currentCase.summary}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Case Details & 8-Slide Interactive Anatomy */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-card p-5 rounded-xl border border-line">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className={`text-[12px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full border ${currentCase.badgeBg}`}>
                    {currentCase.badge}
                  </span>
                  <span className="text-[12px] font-mono text-muted">
                    Format: 1080×1350 Carousel
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-head font-bold text-ink mt-1">
                  {currentCase.id === 'market-brief' ? currentCase.name : `$${currentCase.ticker} — ${currentCase.name}`}
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
                  {currentCase.summary}
                </p>
              </div>

              {/* Anatomy Slide Selector (Click to navigate slide) */}
              <div className="bg-card p-4 sm:p-5 rounded-xl border border-line">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-navy" />
                    <span>Anatomi {currentCase.totalSlides} Slide (Pilih Slide):</span>
                  </h4>
                  <span className="text-[12px] font-mono text-muted">
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
                        className={`text-left p-2.5 rounded-lg border text-xs transition flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-navy text-on-navy border-navy shadow-sm'
                            : 'bg-paper hover:bg-card border-line text-ink'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-[12px] font-mono font-bold shrink-0 mt-0.5 ${
                            isSelected ? 'bg-paper text-navy' : 'bg-card text-muted border border-line'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold leading-tight">{lbl.title}</p>
                          <p className={`text-[12px] mt-0.5 leading-snug line-clamp-1 ${isSelected ? 'text-on-navy/80' : 'text-muted'}`}>
                            {lbl.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                  <span className="text-[12px] text-muted">
                    Terhubung otomatis ke Instagram, Threads, TikTok & Telegram
                  </span>
                  <a
                    href="https://instagram.com/sahamfyp.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-navy hover:underline font-semibold"
                  >
                    <span>Cek di Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Akun Publik 100% Otonom (Bukti Eksekusi) ─────── */}
      <section id="social-accounts" className="py-16 md:py-20 border-b border-line scroll-mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-line bg-card text-muted">
              Bukti Eksekusi Nyata
            </span>
            <h2 className="text-2xl sm:text-4xl font-head font-extrabold text-ink mt-3">
              Akun Publik yang Berjalan 100% Otonom
            </h2>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Seluruh kanal media sosial berikut aktif menerima konten hasil automasi pipeline SahamFYP secara berkala tanpa intervensi manual. Silakan kunjungi profil langsung untuk melihat hasil postingan live:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Instagram */}
            <div className="bg-card border border-line hover:border-navy p-5 rounded-xl transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-paper border border-line flex items-center justify-center text-navy">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-paper text-muted border border-line">
                    Feed Carousel
                  </span>
                </div>

                <h3 className="text-lg font-head font-bold text-ink">
                  Instagram
                </h3>
                <p className="text-xs font-mono text-muted mt-0.5">@sahamfyp.id</p>

                <p className="text-xs text-muted mt-2.5 leading-relaxed">
                  Pusat rilis carousel visual resolusi tinggi (1080×1350) untuk ringkasan <strong>Market Open</strong>, bedah katalis 3W (What, Why, What's Next), dan peringatan anti-FOMO harian.
                </p>

                <div className="mt-4 p-3 bg-paper rounded-lg border border-line text-[12px] text-muted space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-ink font-semibold">08:00 WIB & Breaking</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-ink font-semibold">Browserless + Repliz</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <a
                  href="https://instagram.com/sahamfyp.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-navy hover:bg-[#1c3563] text-on-navy font-body font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Buka Profil Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: Threads */}
            <div className="bg-card border border-line hover:border-navy p-5 rounded-xl transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-paper border border-line flex items-center justify-center text-navy">
                    <AtSign className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-paper text-muted border border-line">
                    Microblogging
                  </span>
                </div>

                <h3 className="text-lg font-head font-bold text-ink">
                  Threads
                </h3>
                <p className="text-xs font-mono text-muted mt-0.5">@sahamfyp.id</p>

                <p className="text-xs text-muted mt-2.5 leading-relaxed">
                  Rilis utas (thread) poin-poin penting katalis bursa saham, ringkasan pergerakan IHSG harian, dan forum diskusi santai bagi investor muda.
                </p>

                <div className="mt-4 p-3 bg-paper rounded-lg border border-line text-[12px] text-muted space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-ink font-semibold">Simultan dg Instagram</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-ink font-semibold">Repliz Threads API</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <a
                  href="https://www.threads.com/@sahamfyp.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-navy hover:bg-[#1c3563] text-on-navy font-body font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Buka Profil Threads</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 3: TikTok */}
            <div className="bg-card border border-line hover:border-navy p-5 rounded-xl transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-paper border border-line flex items-center justify-center text-navy">
                    <Music className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-paper text-muted border border-line">
                    Slide Mode
                  </span>
                </div>

                <h3 className="text-lg font-head font-bold text-ink">
                  TikTok
                </h3>
                <p className="text-xs font-mono text-muted mt-0.5">@sahamfyp.id</p>

                <p className="text-xs text-muted mt-2.5 leading-relaxed">
                  Format carousel slide interaktif vertikal yang cepat dinavigasi (<em>swipe</em>), menyasar langsung demografi Gen Z pada platform video pendek.
                </p>

                <div className="mt-4 p-3 bg-paper rounded-lg border border-line text-[12px] text-muted space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-ink font-semibold">Pagi & Sore Bursa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-ink font-semibold">Repliz TikTok Dispatch</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <a
                  href="https://tiktok.com/@sahamfyp.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-navy hover:bg-[#1c3563] text-on-navy font-body font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Buka Profil TikTok</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 4: Facebook */}
            <div className="bg-card border border-line hover:border-navy p-5 rounded-xl transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-paper border border-line flex items-center justify-center text-navy">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-paper text-muted border border-line">
                    Halaman Publik
                  </span>
                </div>

                <h3 className="text-lg font-head font-bold text-ink">
                  Facebook Page
                </h3>
                <p className="text-xs font-mono text-muted mt-0.5">sahamfyp.id</p>

                <p className="text-xs text-muted mt-2.5 leading-relaxed">
                  Postingan multi-gambar album lengkap dengan caption panjang berisi analisis fundamental, analogi Gen Z, dan disclaimer edukasi resmi.
                </p>

                <div className="mt-4 p-3 bg-paper rounded-lg border border-line text-[12px] text-muted space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-ink font-semibold">Otomatis Terjadwal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-ink font-semibold">Meta Graph via Repliz</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <a
                  href="https://facebook.com/sahamfyp.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-navy hover:bg-[#1c3563] text-on-navy font-body font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Buka Halaman Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 5: Telegram Channel */}
            <div className="bg-card border border-line hover:border-navy p-5 rounded-xl transition flex flex-col justify-between md:col-span-2 lg:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-paper border border-line flex items-center justify-center text-navy">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-paper text-muted border border-line">
                    Instant Channel
                  </span>
                </div>

                <h3 className="text-lg font-head font-bold text-ink">
                  Telegram Channel & Broadcast
                </h3>
                <p className="text-xs font-mono text-muted mt-0.5">@sahamfyp (t.me/sahamfyp)</p>

                <p className="text-xs text-muted mt-2.5 leading-relaxed">
                  Saluran siaran tercepat: mengirimkan gambar carousel resolusi asli tanpa kompresi, sinyal katalis berita mendadak, serta laporan log eksekusi otomatis pipeline sebagai bukti <em>unattended execution</em> tanpa operator.
                </p>

                <div className="mt-4 p-3 bg-paper rounded-lg border border-line text-[12px] text-muted grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span>Jadwal Terbit:</span>
                    <span className="text-ink font-semibold">Real-time & Harian</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kualitas Aset:</span>
                    <span className="text-ink font-semibold">Full HD Original</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <a
                  href="https://t.me/sahamfyp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-navy hover:bg-[#1c3563] text-on-navy font-body font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2"
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
      <section className="py-16 md:py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-line bg-card text-muted">
                Core Logic & AI Reasoning
              </span>
              <h2 className="text-2xl sm:text-3xl font-head font-extrabold text-ink mt-3 leading-snug">
                Framework Ekstraksi 3W (What, Why, What's Next) & Sistem Deteksi Red Flag
              </h2>
              <p className="text-sm sm:text-base text-muted mt-3 leading-relaxed">
                Bukan sekadar menulis ulang berita (<em>rewrite</em>), AI SahamFYP mengekstrak intisari peristiwa menjadi 3 pilar utama: <strong>What – Why – What's Next</strong>, lalu memvalidasinya dengan metrik keuangan resmi dari Sectors API:
              </p>

              <div className="space-y-3 mt-6">
                <div className="flex items-start gap-3 bg-card p-3.5 rounded-lg border border-line">
                  <div className="w-7 h-7 rounded bg-paper border border-line text-navy font-head font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-head font-bold text-ink">WHAT — Peristiwa Nyata</h4>
                    <p className="text-xs text-muted mt-0.5">
                      Fakta konkret aksi korporasi, keterbukaan informasi (filings) BEI, kontrak baru, atau rilis laporan keuangan emiten.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-card p-3.5 rounded-lg border border-line">
                  <div className="w-7 h-7 rounded bg-paper border border-line text-navy font-head font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-head font-bold text-ink">WHY — Konteks & Pendorong</h4>
                    <p className="text-xs text-muted mt-0.5">
                      Mengapa katalis tersebut terjadi: pemicu industri makro, lonjakan harga komoditas acuan, ekspansi kapasitas, atau restrukturisasi utang.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-card p-3.5 rounded-lg border border-line">
                  <div className="w-7 h-7 rounded bg-paper border border-line text-navy font-head font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-head font-bold text-ink">WHAT'S NEXT — Langkah Selanjutnya & Proyeksi Risiko</h4>
                    <p className="text-xs text-muted mt-0.5">
                      Bukan sekadar dampak sesaat, melainkan apa langkah ke depan bagi investor: verifikasi data fundamental & teknikal Sectors API, level pantauan kunci, dan peringatan risiko jika emiten tidak sehat.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Risk Badge Showcase */}
            <div className="bg-card border border-line rounded-xl p-6 sm:p-7 relative">
              <div className="flex items-center justify-between pb-3.5 border-b border-line">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-up inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-warn inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-down inline-block" />
                </div>
                <span className="text-[12px] text-muted font-mono font-medium">Anti-FOMO Guard • Active</span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-lg bg-[#FDEDEC] border border-[#F5C2BE]">
                  <div className="flex items-center gap-2 text-down font-head font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>CONTOH PERINGATAN RED FLAG (WARNING)</span>
                  </div>
                  <p className="text-xs text-ink mt-2">
                    <em>"Emiten XYZ sedang viral di medsos karena isu merger. Namun data Sectors API mencatat Debt-to-Equity (DER) mencapai 4.8x dan Net Income masih merugi -Rp120 Miliar. Waspada jebakan FOMO!"</em>
                  </p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-[12px] bg-card border border-[#F5C2BE] text-down px-2 py-0.5 rounded font-mono font-medium">DER: 4.8x (High)</span>
                    <span className="text-[12px] bg-card border border-[#F5C2BE] text-down px-2 py-0.5 rounded font-mono font-medium">Valuasi: Bubble</span>
                    <span className="text-[12px] bg-card border border-[#F5C2BE] text-down px-2 py-0.5 rounded font-mono font-medium">Status: Warning</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#EAF7EE] border border-[#BDE8CB]">
                  <div className="flex items-center gap-2 text-up font-head font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONTOH VALIDASI SEHAT (GREEN LIGHT)</span>
                  </div>
                  <p className="text-xs text-ink mt-2">
                    <em>"Katalis kontrak baru emiten ABC didukung oleh PER 7.2x (di bawah rata-rata sektor 14.1x) dan ROE konsisten di atas 18%. Fundamental solid dan terverifikasi."</em>
                  </p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-[12px] bg-card border border-[#BDE8CB] text-up px-2 py-0.5 rounded font-mono font-medium">PER: 7.2x (Undervalued)</span>
                    <span className="text-[12px] bg-card border border-[#BDE8CB] text-up px-2 py-0.5 rounded font-mono font-medium">ROE: &gt;18%</span>
                    <span className="text-[12px] bg-card border border-[#BDE8CB] text-up px-2 py-0.5 rounded font-mono font-medium">Status: Green Light</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Data Source (Sectors.app REST API) ───────────── */}
      <section className="py-16 md:py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-line rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-navy font-head font-bold text-xs uppercase tracking-wider mb-2">
              <Database className="w-4 h-4" />
              <span>Core Data Source • Wajib & Tak Tergantikan</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-head font-extrabold text-ink">
              Mengapa Sectors.app REST API Merupakan Jantung SahamFYP?
            </h2>

            <blockquote className="mt-4 p-4 rounded-lg bg-paper border-l-4 border-navy text-ink text-xs sm:text-sm leading-relaxed italic">
              "SahamFYP menggunakan Sectors REST API di setiap tahap alur — deteksi ticker, enrichment laporan keuangan & valuasi, ranking top movers berkapitalisasi wajar, hingga foreign flow dan kalkulasi teknikal Moving Average. <strong>Kalau data Sectors.app dicabut, produk ini kehilangan fungsi intinya</strong>: slide 4–6 di semua template konten bergantung penuh pada data tersebut untuk verifikasi faktual. Tanpa Sectors API, sistem hanya jadi rewrite berita tanpa nilai tambah — persis kebalikan dari misi produk ini."
            </blockquote>

            <div className="mt-6">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                Daftar Endpoint Resmi Sectors.app REST API yang Diintegrasikan:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-paper p-3 rounded-lg border border-line">
                  <span className="text-navy font-bold">/v2/company/report/{'{ticker}'}/</span>
                  <p className="text-[12px] font-body text-muted mt-1">Laporan keuangan, PER, PBV, ROE, DER, Market Cap</p>
                </div>
                <div className="bg-paper p-3 rounded-lg border border-line">
                  <span className="text-navy font-bold">/v2/daily/{'{ticker}'}/</span>
                  <p className="text-[12px] font-body text-muted mt-1">Harga harian, volume transaksi, pergerakan MA harian</p>
                </div>
                <div className="bg-paper p-3 rounded-lg border border-line">
                  <span className="text-navy font-bold">/v2/brokers/top/</span>
                  <p className="text-[12px] font-body text-muted mt-1">Aktivitas akumulasi dan distribusi broker sekuritas</p>
                </div>
                <div className="bg-paper p-3 rounded-lg border border-line">
                  <span className="text-navy font-bold">/v2/companies/top-changes/</span>
                  <p className="text-[12px] font-body text-muted mt-1">Daftar top gainers & losers saham teraktif harian</p>
                </div>
                <div className="bg-paper p-3 rounded-lg border border-line">
                  <span className="text-navy font-bold">/v2/news/ & /v2/filings/</span>
                  <p className="text-[12px] font-body text-muted mt-1">Keterbukaan informasi resmi BEI dan kurasi berita pasar</p>
                </div>
                <div className="bg-paper p-3 rounded-lg border border-line">
                  <span className="text-navy font-bold">/v2/index-daily/ihsg/</span>
                  <p className="text-[12px] font-body text-muted mt-1">Data historis performa indeks gabungan IHSG</p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <a
                  href="https://sectors.app/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:underline transition"
                >
                  <span>Lihat Dokumentasi Sectors.app API</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. Dashboard Internal Operator ─────────────────── */}
      <section className="py-16 md:py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-line bg-card text-muted">
              Tool Internal Operator & Otomasi Backend
            </span>
            <h2 className="text-2xl sm:text-3xl font-head font-extrabold text-ink mt-3">
              Sistem Operasional Operator End-to-End
            </h2>
            <p className="text-sm text-muted mt-2">
              Cockpit kendali internal untuk kurasi berita pasar, validasi rasio Sectors API, generator konten visual, dan monitoring live status publikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-card border border-line p-5 rounded-xl hover:border-navy transition">
              <div className="w-10 h-10 rounded-lg bg-paper border border-line text-navy flex items-center justify-center mb-3">
                <Newspaper className="w-5 h-5" />
              </div>
              <h3 className="text-base font-head font-bold text-ink">📡 News Monitoring Real-Time</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Memantau feed RSS dari 8 media ekonomi terkemuka (Kontan, Bisnis.com, CNBC, Detik, dll) dan keterbukaan informasi BEI, diklasifikasikan dengan tagging sentimen Bullish/Bearish.
              </p>
            </div>

            <div className="bg-card border border-line p-5 rounded-xl hover:border-navy transition">
              <div className="w-10 h-10 rounded-lg bg-paper border border-line text-navy flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-head font-bold text-ink">📈 Daily Market Brief</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Ringkasan pasar sebelum jam bursa buka (08:00 WIB) dan pasca tutup (16:00 WIB), menganalisis kondisi IHSG harian, pergerakan sektor, dan foreign flow secara otomatis.
              </p>
            </div>

            <div className="bg-card border border-line p-5 rounded-xl hover:border-navy transition">
              <div className="w-10 h-10 rounded-lg bg-paper border border-line text-navy flex items-center justify-center mb-3">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-head font-bold text-ink">👁️ Stock Watchlist & Evaluasi</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Menyaring kandidat saham unggulan dengan perbandingan valuasi terhadap sektornya (PE vs Avg PE Sektor, PBV vs Avg PBV, ROE, DER, dan sinyal teknikal Moving Average).
              </p>
            </div>

            <div className="bg-card border border-line p-5 rounded-xl hover:border-navy transition">
              <div className="w-10 h-10 rounded-lg bg-paper border border-line text-navy flex items-center justify-center mb-3">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-head font-bold text-ink">🗂️ Posts & Live Sync Repliz</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Manajemen seluruh konten terbit (otomatis n8n & manual generator) dengan sinkronisasi status antrean jadwal publikasi dan live link media sosial dari Repliz API.
              </p>
            </div>

            <div className="bg-card border border-line p-5 rounded-xl hover:border-navy transition">
              <div className="w-10 h-10 rounded-lg bg-paper border border-line text-navy flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-head font-bold text-ink">✍️ Content Generator AI & Manual</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Wizard pembuatan konten visual instan: LLM menyusun naskah carousel slide edukatif, kemudian dirender ke grafis beresolusi tinggi (1080x1350) siap publish.
              </p>
            </div>

            <div className="bg-card border border-line p-5 rounded-xl hover:border-navy transition">
              <div className="w-10 h-10 rounded-lg bg-paper border border-line text-navy flex items-center justify-center mb-3">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-base font-head font-bold text-ink">🤖 100% Otonom via n8n</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Dua workflow mandiri (Daily Market Brief & News Monitoring) yang berjalan terjadwal tanpa operator manusia, lengkap dengan bot alert status di Telegram.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. Final CTA Banner (Dual Call to Action) ───────── */}
      {!inDashboard && (
        <section className="py-16 md:py-20 border-b border-line">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-card border border-line rounded-xl p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper border border-line text-muted text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Verifikasi Karya SahamFYP</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-head font-extrabold text-ink tracking-tight">
              Edukasi Publik di Medsos atau Buka Dashboard Monitoring
            </h2>
            <p className="mt-3 text-sm text-muted max-w-xl mx-auto leading-relaxed">
              Dua cara verifikasi karya ini: lihat hasil akhirnya di medsos, atau intip langsung dapur otomasinya di dashboard.
            </p>

            {/* Dual Actions CTA: 1 Gold CTA + 1 Navy CTA */}
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <a
                href="#product-showcase"
                onClick={(e) => scrollToSection(e, 'product-showcase')}
                className="w-full sm:w-auto py-3 px-6 bg-gold hover:bg-[#e09c00] text-ink font-body font-semibold rounded-lg text-sm transition shadow-sm flex items-center justify-center gap-2 active:scale-95 focus-visible:outline-3 focus-visible:outline-gold focus-visible:outline-offset-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Lihat Hasil Postingan</span>
                <span>↓</span>
              </a>

              <button
                onClick={handleLoginClick}
                className="w-full sm:w-auto py-3 px-6 bg-navy hover:bg-[#1c3563] text-on-navy font-body font-semibold rounded-lg text-sm transition shadow-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {onGoToLogin && (
              <div className="mt-5 text-center">
                <button
                  onClick={onGoToLogin}
                  className="text-muted hover:text-ink text-xs transition underline-offset-4 hover:underline"
                >
                  Akses login kredensial operator (opsional) →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="py-8 text-center text-xs text-muted">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo-sahamfyp.png" alt="SahamFYP Logo" className="w-5 h-5 rounded-full object-cover border border-line" />
          <span className="font-head font-bold text-ink">SahamFYP</span>
        </div>
        <p>© 2026 SahamFYP. All rights reserved.</p>
        <p className="mt-1 text-[12px] text-muted max-w-xl mx-auto">
          Disclaimer: Konten bersifat edukasi & verifikasi data publik pasar modal (DYOR). Bukan nasihat keuangan atau ajakan transaksi efek.
        </p>
      </footer>
    </div>
  );
}

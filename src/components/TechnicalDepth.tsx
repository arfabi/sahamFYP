import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  Code2, 
  GitBranch, 
  ExternalLink,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Calculator,
  Search,
  BookOpen
} from 'lucide-react';

export default function TechnicalDepth() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'endpoints' | 'math' | 'framework'>('architecture');

  return (
    <div className="bg-[#130a17]/90 backdrop-blur-md rounded-2xl p-5 sm:p-7 shadow-xl border border-[#251323] space-y-6 text-zinc-200">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#251323] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-md shadow-rose-950/40">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Technical Depth: SahamFYP Core Engine
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  open.ts Architecture
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Di balik konten visual yang mudah dipahami Gen-Z, bekerja orkestrasi 7+ endpoint data terverifikasi, kalkulasi kuantitatif lokal tanpa halusinasi, dan evaluasi multi-tahap Dual-Stage LLM.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap gap-1.5 bg-[#180b1d] p-1.5 rounded-xl border border-[#2d142d] self-start lg:self-auto text-xs font-semibold text-zinc-400">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-md shadow-rose-950/40'
                : 'hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Dual-Stage LLM Flow
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'endpoints'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-md shadow-rose-950/40'
                : 'hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            7+ Multi-API Hits
          </button>
          <button
            onClick={() => setActiveTab('math')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'math'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-md shadow-rose-950/40'
                : 'hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Deterministic Math
          </button>
          <button
            onClick={() => setActiveTab('framework')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'framework'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-md shadow-rose-950/40'
                : 'hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Katalis 3W & Matrix
          </button>
        </div>
      </div>

      {/* TAB 1: Dual-Stage LLM Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stage 1 Card */}
            <div className="rounded-2xl border border-amber-500/30 bg-[#1b1021] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  AI TAHAP 1 • CIO FILTER
                </span>
                <span className="text-xs font-mono text-amber-400">selectTickersWithLlm()</span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                🤖 AI Chief Investment Officer (CIO)
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Mengevaluasi hingga 40 berita & keterbukaan informasi BEI harian dengan pembobotan katalis ketat sebelum data diizinkan masuk ke proses pengayaan berat:
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong className="text-white">Skor 8–10 (Prioritas Utama):</strong> Aksi korporasi fundamental (M&A pengendali baru, rights issue jumbo, turnaround kinerja laba, isu manajemen).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong className="text-white">Hard Filter Kualitatif:</strong> Otomatis menolak saham gocap, penny stock, atau emiten Papan Pemantauan Khusus (FCA) tanpa likuiditas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong className="text-white">Diversifikasi Watchlist:</strong> Wajib mengombinasikan 2 Saham Bullish, 1 Saham Risiko/Warning (edukasi), dan 1 Saham Value/Turnaround.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong className="text-white">Audit Transparency:</strong> Setiap saham yang ditolak dicatat ke tabel database <code className="bg-[#271031] text-amber-300 px-1 rounded border border-[#3b1949]">sector_trigger_skipped</code> beserta alasan penolakannya.</span>
                </li>
              </ul>
            </div>

            {/* Stage 2 Card */}
            <div className="rounded-2xl border border-rose-500/30 bg-[#1c0f24] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  AI TAHAP 2 • SYNTHESIZER
                </span>
                <span className="text-xs font-mono text-rose-400">generateSlidesWithLlm()</span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                ✍️ Senior Analyst & Gen-Z Storyteller
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Mengintegrasikan seluruh hasil kalkulasi matematis (MA, Golden Cross, Rasio Sektor) ke dalam format slide visual JSON terstandarisasi:
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✓</span>
                  <span><strong className="text-white">Formulasi Katalis 3W:</strong> Memecah narasi rumit menjadi <strong>What</strong> (kejadian konkret), <strong>Why</strong> (urgensi/dampak nilai), dan <strong>What's Next</strong> (proyeksi arah bursa).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✓</span>
                  <span><strong className="text-white">Penentuan Kuadran Matrix:</strong> Mengelompokkan saham ke dalam Matrix 4-Kuadran (Fundamental × Teknikal) secara objektif.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✓</span>
                  <span><strong className="text-white">Rekomendasi Multiprofil:</strong> Strategi spesifik untuk Day Trader, Swing Trader (2-4 minggu), dan Investor Jangka Panjang (6+ bulan).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✓</span>
                  <span><strong className="text-white">Kamus Edukatif Gen-Z:</strong> Mentransformasi istilah teknis menjadi analogi relatable (PER = balik modal beli HP, ROE = patungan jastip).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Workflow Pipeline Step-by-Step Banner */}
          <div className="bg-[#180b1d] rounded-2xl p-5 text-zinc-200 border border-[#281329] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Pipeline Execution Cycle di open.ts
              </span>
              <span className="text-xs text-zinc-500 font-mono">08:00 WIB Batch Run</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="bg-[#200e26] p-3 rounded-xl border border-[#34163e]">
                <div className="text-amber-400 font-bold mb-1">1. Parallel Ingestion</div>
                <p className="text-zinc-400 text-[11px]">Ambil data makro IHSG, 40 berita, top movers, & broker foreign flow sekaligus.</p>
              </div>
              <div className="bg-[#200e26] p-3 rounded-xl border border-[#34163e]">
                <div className="text-amber-400 font-bold mb-1">2. AI CIO Filter</div>
                <p className="text-zinc-400 text-[11px]">LLM menyeleksi 1–3 emiten berbobot katalis tinggi & menolak saham tidur/spekulatif.</p>
              </div>
              <div className="bg-[#200e26] p-3 rounded-xl border border-[#34163e]">
                <div className="text-rose-400 font-bold mb-1">3. Deep Data Hit</div>
                <p className="text-zinc-400 text-[11px]">Hit data riwayat 400 hari & laporan peers industri khusus emiten yang lolos seleksi.</p>
              </div>
              <div className="bg-[#200e26] p-3 rounded-xl border border-[#34163e]">
                <div className="text-cyan-400 font-bold mb-1">4. Deterministic Math</div>
                <p className="text-zinc-400 text-[11px]">Kalkulasi lokal MA20/50/200, Golden Cross, Volume Spike, & Red Flag sanitizers.</p>
              </div>
              <div className="bg-[#200e26] p-3 rounded-xl border border-[#34163e]">
                <div className="text-emerald-400 font-bold mb-1">5. Output JSON & Post</div>
                <p className="text-zinc-400 text-[11px]">LLM merakit slide carousel visual dengan pagination & audit log Supabase lengkap.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-API Hits Catalog */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Sistem mengeksekusi beragam endpoint API secara modular dan terkontrol. Setiap data divalidasi ke sumber resmi (Bursa Efek Indonesia & Sectors.app v2) untuk mencegah bias dan informasi palsu:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Item 1 */}
            <div className="p-4 rounded-xl border border-[#281329] bg-[#1a0e21] hover:bg-[#200e27] hover:border-rose-500/30 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white bg-[#250f2e] border border-[#381642] px-2 py-0.5 rounded">
                  GET /v2/index-daily/ihsg/
                </span>
                <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  Macro Index
                </span>
              </div>
              <p className="text-zinc-400">
                Mengambil rentang 10 hari harga IHSG historis. Otomatis menghitung delta poin dan persentase perubahan hari terakhir bursa buka, bahkan melewati libur panjang/akhir pekan.
              </p>
            </div>

            {/* Item 2 */}
            <div className="p-4 rounded-xl border border-[#281329] bg-[#1a0e21] hover:bg-[#200e27] hover:border-rose-500/30 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white bg-[#250f2e] border border-[#381642] px-2 py-0.5 rounded">
                  GET /v2/filings/
                </span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Keterbukaan BEI
                </span>
              </div>
              <p className="text-zinc-400">
                Dokumen resmi aksi korporasi BEI (M&A, restrukturisasi modal, pembagian dividen, dan insider trading) sebagai validasi silang atas klaim berita yang beredar.
              </p>
            </div>

            {/* Item 3 */}
            <div className="p-4 rounded-xl border border-[#281329] bg-[#1a0e21] hover:bg-[#200e27] hover:border-rose-500/30 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white bg-[#250f2e] border border-[#381642] px-2 py-0.5 rounded">
                  GET /v2/companies/top-changes/
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Market Movers
                </span>
              </div>
              <p className="text-zinc-400">
                Top 5 Gainers & Top 5 Losers harian dengan hard parameter <code className="text-amber-300 bg-[#281132] px-1 rounded border border-[#3c184a]">minMcapBillion: 500</code> untuk memfilter penny stocks dan hanya menampilkan saham yang relevan secara likuiditas.
              </p>
            </div>

            {/* Item 4 */}
            <div className="p-4 rounded-xl border border-[#281329] bg-[#1a0e21] hover:bg-[#200e27] hover:border-rose-500/30 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white bg-[#250f2e] border border-[#381642] px-2 py-0.5 rounded">
                  GET /v2/brokers/foreign-flow/
                </span>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Institutional Flow
                </span>
              </div>
              <p className="text-zinc-400">
                Ringkasan akumulasi dana asing harian: Foreign Net Buy, Net Sell, dan Net Total Inflow/Outflow untuk mengetahui apakah pergerakan pasar didorong oleh modal institusi asing.
              </p>
            </div>

            {/* Item 5 */}
            <div className="p-4 rounded-xl border border-[#281329] bg-[#1a0e21] hover:bg-[#200e27] hover:border-rose-500/30 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white bg-[#250f2e] border border-[#381642] px-2 py-0.5 rounded">
                  GET /v2/company/report/{'{ticker}'}/
                </span>
                <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  Deep Fundamental & Peers
                </span>
              </div>
              <p className="text-zinc-400">
                Membedah valuasi historis (PER, PBV), kinerja laba bersih, beban utang (DER), profitabilitas (ROE), serta data puluhan kompetitor peers untuk perbandingan industri.
              </p>
            </div>

            {/* Item 6 */}
            <div className="p-4 rounded-xl border border-[#281329] bg-[#1a0e21] hover:bg-[#200e27] hover:border-rose-500/30 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white bg-[#250f2e] border border-[#381642] px-2 py-0.5 rounded">
                  GET /v2/daily/{'{ticker}'}/
                </span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  400-Day Technical Feed
                </span>
              </div>
              <p className="text-zinc-400">
                Mengambil 400 hari riwayat harga dan volume perdagangan untuk komputasi teknikal riil tanpa estimasi kasar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Deterministic Math Engine */}
      {activeTab === 'math' && (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-emerald-300">Zero-Hallucination Quantitative Guardrail</h4>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                LLM tidak pernah diinstruksikan untuk 'menebak' atau 'menghitung' rata-rata pergerakan harga atau valuasi. Seluruh metrik dihitung secara deterministik dengan fungsi TypeScript murni di <code className="bg-[#200f27] px-1 py-0.5 rounded text-emerald-300 font-mono border border-[#36173f]">computeTechnical()</code> dan <code className="bg-[#200f27] px-1 py-0.5 rounded text-emerald-300 font-mono border border-[#36173f]">digestCompanyReport()</code> sebelum diteruskan ke tahap narasi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="border border-[#281329] rounded-xl p-4 space-y-2 bg-[#1a0e21]">
              <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                📈 Trend & Cross Signals
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Algoritma memeriksa riwayat penutupan harga untuk mendeteksi sinyal presisi:
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="bg-[#220e28] p-2.5 rounded-lg border border-[#34163e] text-zinc-300">
                  <strong className="text-emerald-400">Golden Cross 🚀:</strong> MA20 memotong ke atas MA50 (konfirmasi momentum akumulasi).
                </div>
                <div className="bg-[#220e28] p-2.5 rounded-lg border border-[#34163e] text-zinc-300">
                  <strong className="text-rose-400">Death Cross ☠️:</strong> MA20 memotong ke bawah MA50 (waspada tren penurunan).
                </div>
                <div className="bg-[#220e28] p-2.5 rounded-lg border border-[#34163e] text-zinc-300">
                  <strong className="text-blue-400">52W Resistance:</strong> Gap persentase harga terhadap level tertinggi 252 hari perdagangan.
                </div>
              </div>
            </div>

            <div className="border border-[#281329] rounded-xl p-4 space-y-2 bg-[#1a0e21]">
              <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                📊 Volume Spike Validation
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Kenaikan harga saham diverifikasi dengan rasio volume perdagangan terhadap rata-rata 20 hari:
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="bg-[#220e28] p-2.5 rounded-lg border border-[#34163e] text-zinc-300">
                  <strong className="text-rose-400">Volume &gt; 1.5x Rata-rata:</strong> Status "Rame" — Kenaikan harga valid didukung transaksi institusional.
                </div>
                <div className="bg-[#220e28] p-2.5 rounded-lg border border-[#34163e] text-zinc-300">
                  <strong className="text-amber-400">Volume &lt; 0.7x Rata-rata:</strong> Status "Sepi" — Waspada jebakan beli (*false breakout/prank*).
                </div>
              </div>
            </div>

            <div className="border border-[#281329] rounded-xl p-4 space-y-2 bg-[#1a0e21]">
              <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                🚩 Red Flag & Anomaly Filters
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Sistem secara otomatis mendeteksi anomali finansial kritis sebelum mempublikasikan rekomendasi:
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="bg-[#220e28] p-2.5 rounded-lg border border-[#34163e] text-zinc-300">
                  <strong className="text-rose-400">PBV &lt; 0:</strong> Ekuitas Negatif (Defisit Modal) — Red flag bahaya kebangkrutan.
                </div>
                <div className="bg-[#220e28] p-2.5 rounded-lg border border-[#34163e] text-zinc-300">
                  <strong className="text-rose-400">DER &lt; 0:</strong> Utang Melebihi Aset Total.
                </div>
                <div className="bg-[#220e28] p-2.5 rounded-lg border border-[#34163e] text-zinc-300">
                  <strong className="text-amber-400">PER &lt; 0:</strong> Emiten merugi — rasio PER dinonaktifkan agar tidak menyesatkan.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Framework 3W & 4-Quadrant Matrix */}
      {activeTab === 'framework' && (
        <div className="space-y-5">
          {/* 3W Framework Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-blue-500/30 bg-[#141529] space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Inti Peristiwa</span>
              </div>
              <h4 className="font-extrabold text-sm text-white">WHAT (Apa yang Terjadi)</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Ringkasan konkret kejadian dalam 3–4 kalimat padat. Menjelaskan rilis laporan keuangan, aksi M&A, atau corporate action resmi tanpa bumbu spekulasi.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-purple-500/30 bg-[#1d1228] space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Urgensi Fundamental</span>
              </div>
              <h4 className="font-extrabold text-sm text-white">WHY (Kenapa Ini Penting)</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Menjelaskan alasan peristiwa tersebut berdampak nyata terhadap laba, struktur modal, atau valuasi wajar perusahaan dibandingkan rata-rata industrinya.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#11241f] space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Arah Strategi</span>
              </div>
              <h4 className="font-extrabold text-sm text-white">WHAT'S NEXT (Arah ke Depan)</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Level support dan resistance kunci MA20/MA50, sinyal tren teknikal, serta arahan aksi harga nyata untuk investor maupun trader.
              </p>
            </div>
          </div>

          {/* 4 Quadrant Matrix */}
          <div className="border border-[#281329] rounded-2xl p-5 bg-[#180b1d] space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
              <span>🎯 Framework Matrix: Fundamental × Teknikal</span>
              <span className="text-xs text-zinc-400 font-normal">(Ditampilkan di Slide Penutup Carousel)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#1f0e26] p-4 rounded-xl border border-emerald-500/30">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  Kuadran 1 (Q1) • Fund Bagus + Tech Bagus
                </div>
                <p className="text-zinc-300 text-[11px] mt-2 leading-relaxed">
                  <strong className="text-white">Cocok untuk:</strong> Investasi jangka panjang & Swing Trading. Valuasi sehat dan momentum tren harga sedang terkonfirmasi.
                </p>
              </div>

              <div className="bg-[#1f0e26] p-4 rounded-xl border border-amber-500/30">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  Kuadran 2 (Q2) • Fund Bagus + Tech Jelek
                </div>
                <p className="text-zinc-300 text-[11px] mt-2 leading-relaxed">
                  <strong className="text-white">Cocok untuk:</strong> Value Investing. Perusahaan berfundamental kuat namun harga masih terdiskon; sabar menunggu sinyal teknikal berbalik arah.
                </p>
              </div>

              <div className="bg-[#1f0e26] p-4 rounded-xl border border-orange-500/30">
                <div className="flex items-center gap-2 font-bold text-orange-400">
                  <span className="w-3 h-3 rounded-full bg-orange-400" />
                  Kuadran 3 (Q3) • Fund Jelek + Tech Bagus
                </div>
                <p className="text-zinc-300 text-[11px] mt-2 leading-relaxed">
                  <strong className="text-white">Cocok untuk:</strong> Trading momentum jangka pendek SAJA. Wajib pasang disiplin *stop loss* ketat karena fundamental tidak mendukung.
                </p>
              </div>

              <div className="bg-[#1f0e26] p-4 rounded-xl border border-rose-500/30">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  Kuadran 4 (Q4) • Fund Jelek + Tech Jelek
                </div>
                <p className="text-zinc-300 text-[11px] mt-2 leading-relaxed">
                  <strong className="text-white">Rekomendasi:</strong> Hindari dulu / Pantau pemulihan. Risiko tinggi baik dari sisi kinerja keuangan maupun aksi harga.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/90 space-y-6 text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-sm shadow-rose-500/20">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Technical Depth: SahamFYP Core Engine
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                  open.ts Architecture
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Di balik konten visual yang mudah dipahami Gen-Z, bekerja orkestrasi 7+ endpoint data terverifikasi, kalkulasi kuantitatif lokal tanpa halusinasi, dan evaluasi multi-tahap Dual-Stage LLM.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start lg:self-auto text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-sm shadow-rose-500/20'
                : 'hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Dual-Stage LLM Flow
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'endpoints'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-sm shadow-rose-500/20'
                : 'hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            7+ Multi-API Hits
          </button>
          <button
            onClick={() => setActiveTab('math')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'math'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-sm shadow-rose-500/20'
                : 'hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Deterministic Math
          </button>
          <button
            onClick={() => setActiveTab('framework')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'framework'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-sm shadow-rose-500/20'
                : 'hover:text-slate-900'
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
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  AI TAHAP 1 • CIO FILTER
                </span>
                <span className="text-xs font-mono text-amber-700 font-semibold">selectTickersWithLlm()</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                🤖 AI Chief Investment Officer (CIO)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mengevaluasi hingga 40 berita & keterbukaan informasi BEI harian dengan pembobotan katalis ketat sebelum data diizinkan masuk ke proses pengayaan berat:
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong className="text-slate-900">Skor 8–10 (Prioritas Utama):</strong> Aksi korporasi fundamental (M&A pengendali baru, rights issue jumbo, turnaround kinerja laba, isu manajemen).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong className="text-slate-900">Hard Filter Kualitatif:</strong> Otomatis menolak saham gocap, penny stock, atau emiten Papan Pemantauan Khusus (FCA) tanpa likuiditas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong className="text-slate-900">Diversifikasi Watchlist:</strong> Wajib mengombinasikan 2 Saham Bullish, 1 Saham Risiko/Warning (edukasi), dan 1 Saham Value/Turnaround.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong className="text-slate-900">Audit Transparency:</strong> Setiap saham yang ditolak dicatat ke tabel database <code className="bg-amber-100 text-amber-900 px-1 rounded border border-amber-200 font-mono">sector_trigger_skipped</code> beserta alasan penolakannya.</span>
                </li>
              </ul>
            </div>

            {/* Stage 2 Card */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                  AI TAHAP 2 • SYNTHESIZER
                </span>
                <span className="text-xs font-mono text-rose-700 font-semibold">generateSlidesWithLlm()</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                ✍️ Senior Analyst & Gen-Z Storyteller
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mengintegrasikan seluruh hasil kalkulasi matematis (MA, Golden Cross, Rasio Sektor) ke dalam format slide visual JSON terstandarisasi:
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span><strong className="text-slate-900">Formulasi Katalis 3W:</strong> Memecah narasi rumit menjadi <strong>What</strong> (kejadian konkret), <strong>Why</strong> (urgensi/dampak nilai), dan <strong>What's Next</strong> (proyeksi arah bursa).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span><strong className="text-slate-900">Penentuan Kuadran Matrix:</strong> Mengelompokkan saham ke dalam Matrix 4-Kuadran (Fundamental × Teknikal) secara objektif.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span><strong className="text-slate-900">Rekomendasi Multiprofil:</strong> Strategi spesifik untuk Day Trader, Swing Trader (2-4 minggu), dan Investor Jangka Panjang (6+ bulan).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span><strong className="text-slate-900">Kamus Edukatif Gen-Z:</strong> Mentransformasi istilah teknis menjadi analogi relatable (PER = balik modal beli HP, ROE = patungan jastip).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Workflow Pipeline Step-by-Step Banner */}
          <div className="bg-slate-900 rounded-2xl p-5 text-slate-200 border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Pipeline Execution Cycle di open.ts
              </span>
              <span className="text-xs text-slate-400 font-mono">08:00 WIB Batch Run</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80">
                <div className="text-amber-400 font-bold mb-1">1. Parallel Ingestion</div>
                <p className="text-slate-300 text-[11px]">Ambil data makro IHSG, 40 berita, top movers, & broker foreign flow sekaligus.</p>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80">
                <div className="text-amber-400 font-bold mb-1">2. AI CIO Filter</div>
                <p className="text-slate-300 text-[11px]">LLM menyeleksi 1–3 emiten berbobot katalis tinggi & menolak saham tidur/spekulatif.</p>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80">
                <div className="text-rose-400 font-bold mb-1">3. Deep Data Hit</div>
                <p className="text-slate-300 text-[11px]">Hit data riwayat 400 hari & laporan peers industri khusus emiten yang lolos seleksi.</p>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80">
                <div className="text-cyan-400 font-bold mb-1">4. Deterministic Math</div>
                <p className="text-slate-300 text-[11px]">Kalkulasi lokal MA20/50/200, Golden Cross, Volume Spike, & Red Flag sanitizers.</p>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80">
                <div className="text-emerald-400 font-bold mb-1">5. Output JSON & Post</div>
                <p className="text-slate-300 text-[11px]">LLM merakit slide carousel visual dengan pagination & audit log Supabase lengkap.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-API Hits Catalog */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Sistem mengeksekusi beragam endpoint API secara modular dan terkontrol. Setiap data divalidasi ke sumber resmi (Bursa Efek Indonesia & Sectors.app v2) untuk mencegah bias dan informasi palsu:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Item 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xs hover:border-rose-300 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs">
                  GET /v2/index-daily/ihsg/
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Macro Index
                </span>
              </div>
              <p className="text-slate-600">
                Mengambil rentang 10 hari harga IHSG historis. Otomatis menghitung delta poin dan persentase perubahan hari terakhir bursa buka, bahkan melewati libur panjang/akhir pekan.
              </p>
            </div>

            {/* Item 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xs hover:border-rose-300 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs">
                  GET /v2/filings/
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Keterbukaan BEI
                </span>
              </div>
              <p className="text-slate-600">
                Dokumen resmi aksi korporasi BEI (M&A, restrukturisasi modal, pembagian dividen, dan insider trading) sebagai validasi silang atas klaim berita yang beredar.
              </p>
            </div>

            {/* Item 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xs hover:border-rose-300 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs">
                  GET /v2/companies/top-changes/
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Market Movers
                </span>
              </div>
              <p className="text-slate-600">
                Top 5 Gainers & Top 5 Losers harian dengan hard parameter <code className="text-amber-800 bg-amber-50 px-1 rounded border border-amber-200">minMcapBillion: 500</code> untuk memfilter penny stocks dan hanya menampilkan saham yang relevan secara likuiditas.
              </p>
            </div>

            {/* Item 4 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xs hover:border-rose-300 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs">
                  GET /v2/brokers/foreign-flow/
                </span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                  Institutional Flow
                </span>
              </div>
              <p className="text-slate-600">
                Ringkasan akumulasi dana asing harian: Foreign Net Buy, Net Sell, dan Net Total Inflow/Outflow untuk mengetahui apakah pergerakan pasar didorong oleh modal institusi asing.
              </p>
            </div>

            {/* Item 5 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xs hover:border-rose-300 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs">
                  GET /v2/company/report/{'{ticker}'}/
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Deep Fundamental & Peers
                </span>
              </div>
              <p className="text-slate-600">
                Membedah valuasi historis (PER, PBV), kinerja laba bersih, beban utang (DER), profitabilitas (ROE), serta data puluhan kompetitor peers untuk perbandingan industri.
              </p>
            </div>

            {/* Item 6 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xs hover:border-rose-300 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs">
                  GET /v2/daily/{'{ticker}'}/
                </span>
                <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                  400-Day Technical Feed
                </span>
              </div>
              <p className="text-slate-600">
                Mengambil 400 hari riwayat harga dan volume perdagangan untuk komputasi teknikal riil tanpa estimasi kasar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Deterministic Math Engine */}
      {activeTab === 'math' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-emerald-900">Zero-Hallucination Quantitative Guardrail</h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                LLM tidak pernah diinstruksikan untuk 'menebak' atau 'menghitung' rata-rata pergerakan harga atau valuasi. Seluruh metrik dihitung secara deterministik dengan fungsi TypeScript murni di <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono border border-emerald-300">computeTechnical()</code> dan <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-mono border border-emerald-300">digestCompanyReport()</code> sebelum diteruskan ke tahap narasi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                📈 Trend & Cross Signals
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Algoritma memeriksa riwayat penutupan harga untuk mendeteksi sinyal presisi:
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <strong className="text-emerald-600">Golden Cross 🚀:</strong> MA20 memotong ke atas MA50 (konfirmasi momentum akumulasi).
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <strong className="text-rose-600">Death Cross ☠️:</strong> MA20 memotong ke bawah MA50 (waspada tren penurunan).
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <strong className="text-blue-600">52W Resistance:</strong> Gap persentase harga terhadap level tertinggi 252 hari perdagangan.
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                📊 Volume Spike Validation
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Kenaikan harga saham diverifikasi dengan rasio volume perdagangan terhadap rata-rata 20 hari:
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <strong className="text-rose-600">Volume &gt; 1.5x Rata-rata:</strong> Status "Rame" — Kenaikan harga valid didukung transaksi institusional.
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <strong className="text-amber-600">Volume &lt; 0.7x Rata-rata:</strong> Status "Sepi" — Waspada jebakan beli (*false breakout/prank*).
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                🚩 Red Flag & Anomaly Filters
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Sistem secara otomatis mendeteksi anomali finansial kritis sebelum mempublikasikan rekomendasi:
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <strong className="text-rose-600">PBV &lt; 0:</strong> Ekuitas Negatif (Defisit Modal) — Red flag bahaya kebangkrutan.
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <strong className="text-rose-600">DER &lt; 0:</strong> Utang Melebihi Aset Total.
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                  <strong className="text-amber-600">PER &lt; 0:</strong> Emiten merugi — rasio PER dinonaktifkan agar tidak menyesatkan.
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
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Inti Peristiwa</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">WHAT (Apa yang Terjadi)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ringkasan konkret kejadian dalam 3–4 kalimat padat. Menjelaskan rilis laporan keuangan, aksi M&A, atau corporate action resmi tanpa bumbu spekulasi.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Urgensi Fundamental</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">WHY (Kenapa Ini Penting)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menjelaskan alasan peristiwa tersebut berdampak nyata terhadap laba, struktur modal, atau valuasi wajar perusahaan dibandingkan rata-rata industrinya.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Arah Strategi</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">WHAT'S NEXT (Arah ke Depan)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Level support dan resistance kunci MA20/MA50, sinyal tren teknikal, serta arahan aksi harga nyata untuk investor maupun trader.
              </p>
            </div>
          </div>

          {/* 4 Quadrant Matrix */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <span>🎯 Framework Matrix: Fundamental × Teknikal</span>
              <span className="text-xs text-slate-500 font-normal">(Ditampilkan di Slide Penutup Carousel)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Kuadran 1 (Q1) • Fund Bagus + Tech Bagus
                </div>
                <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                  <strong className="text-slate-900">Cocok untuk:</strong> Investasi jangka panjang & Swing Trading. Valuasi sehat dan momentum tren harga sedang terkonfirmasi.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-amber-700">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  Kuadran 2 (Q2) • Fund Bagus + Tech Jelek
                </div>
                <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                  <strong className="text-slate-900">Cocok untuk:</strong> Value Investing. Perusahaan berfundamental kuat namun harga masih terdiskon; sabar menunggu sinyal teknikal berbalik arah.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-orange-700">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  Kuadran 3 (Q3) • Fund Jelek + Tech Bagus
                </div>
                <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                  <strong className="text-slate-900">Cocok untuk:</strong> Trading momentum jangka pendek SAJA. Wajib pasang disiplin *stop loss* ketat karena fundamental tidak mendukung.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-rose-700">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  Kuadran 4 (Q4) • Fund Jelek + Tech Jelek
                </div>
                <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                  <strong className="text-slate-900">Rekomendasi:</strong> Hindari dulu / Pantau pemulihan. Risiko tinggi baik dari sisi kinerja keuangan maupun aksi harga.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

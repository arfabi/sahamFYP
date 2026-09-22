import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Radio, 
  Sparkles, 
  Send, 
  ArrowRight, 
  Zap, 
  FileText, 
  CheckCircle2, 
  RefreshCw,
  Globe2,
  Workflow,
  Cpu,
  Share2,
  Play,
  Pause,
  Layers
} from 'lucide-react';

interface PipelineFlowProps {
  onNavigate?: (page: string) => void;
  stats?: {
    totalNews: number;
    totalBriefs: number;
    totalPosts: number;
    autoPosts: number;
  };
}

export default function PipelineFlow({ onNavigate, stats }: PipelineFlowProps) {
  const [activeLane, setActiveLane] = useState<'all' | 'brief' | 'news'>('all');
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [activeSecondsScan, setActiveSecondsScan] = useState(0);
  const [liveNewsPulse, setLiveNewsPulse] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Real-time ticking indicator: "Tiap Detik Scanning Berita terbaru"
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSecondsScan((prev) => (prev + 1) % 60);
      setLiveNewsPulse((prev) => !prev);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const newsChannels = [
    { name: 'CNBC Indonesia', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { name: 'Kontan', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { name: 'Bisnis.com', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { name: 'Detik Finance', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { name: 'Investor.id', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { name: 'Bloomberg Technoz', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { name: 'Katadata', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { name: 'BEI Filings (IDX)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl p-5 sm:p-7 shadow-xl border border-slate-800 text-slate-100 overflow-hidden relative isolate">
      {/* Background Decorative Tech Grids & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf815_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Pipeline Information */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <Workflow className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Arsitektur Otomasi SahamFYP: 2 Saluran Utama
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Pipeline Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Data kontinu mengalir dari 2 sumber utama (n8n Daily Market Brief & 8 Kanal Berita Realtime) melalui pipeline SahamFYP AI Engine menuju multi-channel postingan.
          </p>
        </div>

        {/* Controls & Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 flex items-center gap-1">
            <button
              onClick={() => setActiveLane('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeLane === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua (2 Lane)
            </button>
            <button
              onClick={() => setActiveLane('brief')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeLane === 'brief'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Brief (08:00)
            </button>
            <button
              onClick={() => setActiveLane('news')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeLane === 'news'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              News Monitoring
            </button>
          </div>

          <button
            onClick={() => setIsAnimationPlaying(!isAnimationPlaying)}
            title={isAnimationPlaying ? 'Jeda Animasi Aliran' : 'Lanjutkan Animasi Aliran'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
          >
            {isAnimationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Flow Canvas / Lane Containers */}
      <div className="relative z-10 py-6 space-y-6">

        {/* ========================================================================= */}
        {/* PIPELINE 1: Workflow N8N Daily Market Brief running tiap jam 08.00 WIB     */}
        {/* ========================================================================= */}
        {(activeLane === 'all' || activeLane === 'brief') && (
          <div className="bg-slate-850/90 bg-gradient-to-r from-slate-900/90 via-slate-800/50 to-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-lg relative overflow-hidden">
            {/* Header lane */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  SUMBER UTAMA 1 • BATCH SCHEDULED
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Running Tiap Jam 08.00 WIB
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (Sebelum Pembukaan Pasar BEI)
                </span>
              </div>
            </div>

            {/* Visual 3-Step Flow Pipeline with Animated Connectors */}
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-center">
              {/* STEP 1: Workflow N8N Daily Market Brief */}
              <div 
                onClick={() => setSelectedNode(selectedNode === 'n8n' ? null : 'n8n')}
                className={`lg:col-span-3 rounded-xl p-4 transition-all duration-200 cursor-pointer border ${
                  selectedNode === 'n8n'
                    ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-400'
                    : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
                    ⚡
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Sumber Input
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mt-3">
                  Workflow N8N Daily Market Brief
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Scheduler cron otomatis mengeksekusi pipeline n8n setiap pukul 08.00 WIB.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">Trigger: 08:00 WIB</span>
                  <span className="text-amber-400 font-medium">IHSG • Top Movers • Flow</span>
                </div>
              </div>

              {/* FLOW CONNECTOR 1 -> 2 */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0 relative">
                {/* Desktop horizontal flow pipe */}
                <div className="w-full hidden lg:block relative h-6">
                  {/* Pipe Track */}
                  <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-slate-700/80 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 w-1/2 rounded-full ${
                        isAnimationPlaying ? 'pipeline-particle-travel' : ''
                      }`}
                    />
                  </div>
                  {/* Flow Arrow Head */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-amber-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Mobile vertical flow */}
                <div className="lg:hidden flex items-center gap-1 text-amber-400 text-xs font-mono">
                  <span>Mengalir ke SahamFYP</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* STEP 2: SahamFYP Engine */}
              <div 
                onClick={() => setSelectedNode(selectedNode === 'core1' ? null : 'core1')}
                className={`lg:col-span-3 rounded-xl p-4 transition-all duration-200 cursor-pointer border ${
                  selectedNode === 'core1'
                    ? 'bg-blue-950/30 border-blue-500 ring-1 ring-blue-400'
                    : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Core Engine
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mt-3 flex items-center gap-1.5">
                  SahamFYP Engine
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Kompilasi Katalis 3W (What, Why, What's Next) + verifikasi data fundamental & teknikal.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-blue-300 font-medium">Sintesis AI Gen-Z</span>
                  <span className="text-emerald-400 font-mono">Output Siap Tayang</span>
                </div>
              </div>

              {/* FLOW CONNECTOR 2 -> 3 */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0 relative">
                <div className="w-full hidden lg:block relative h-6">
                  <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-slate-700/80 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-blue-500 via-indigo-300 to-emerald-400 w-1/2 rounded-full ${
                        isAnimationPlaying ? 'pipeline-particle-travel-fast' : ''
                      }`}
                    />
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-emerald-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="lg:hidden flex items-center gap-1 text-blue-400 text-xs font-mono">
                  <span>Diterbitkan ke Postingan</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* STEP 3: Postingan Output */}
              <div 
                onClick={() => {
                  if (onNavigate) onNavigate('daily-market-brief');
                }}
                className="lg:col-span-3 rounded-xl p-4 bg-gradient-to-br from-slate-800 to-slate-850 hover:to-slate-800 border border-emerald-500/40 hover:border-emerald-400 transition-all duration-200 cursor-pointer group shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Share2 className="w-5 h-5 group-hover:scale-110 transition" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Hasil Postingan
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mt-3 flex items-center justify-between">
                  Postingan Market Brief
                  <span className="text-xs text-emerald-400 group-hover:translate-x-1 transition">Lihat ↗</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Carousel visual Instagram, feed multi-slide, serta digest ringkas di Telegram & Threads.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-medium">Multi-slide Carousel</span>
                  <span className="text-slate-300 font-mono">Status: Auto-Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PIPELINE 2: Monitoring News: 8 Kanal Berita + Sector API News               */}
        {/* (Tiap Detik Scanning Berita terbaru) > SahamFYP > Postingan               */}
        {/* ========================================================================= */}
        {(activeLane === 'all' || activeLane === 'news') && (
          <div className="bg-slate-850/90 bg-gradient-to-r from-slate-900/90 via-slate-800/50 to-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700/60 shadow-lg relative overflow-hidden">
            {/* Header lane */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  SUMBER UTAMA 2 • STREAMING REALTIME
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Radio className={`w-3.5 h-3.5 text-emerald-400 ${liveNewsPulse ? 'scale-125' : 'scale-100'} transition-transform duration-300`} />
                  Tiap Detik Scanning Berita Terbaru
                </span>
                <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                  Active : {activeSecondsScan.toString().padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Visual 3-Step Flow Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-center">
              {/* STEP 1: 8 Kanal Berita & Sector.app API News */}
              <div 
                onClick={() => setSelectedNode(selectedNode === 'news_sources' ? null : 'news_sources')}
                className={`lg:col-span-3 rounded-xl p-4 transition-all duration-200 cursor-pointer border ${
                  selectedNode === 'news_sources'
                    ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-400'
                    : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Globe2 className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    8 Kanal + Sector API
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-white mt-3">
                  8 Kanal Berita & Sector API News
                </h3>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Scanning terus-menerus setiap detik ke 8 media finansial kredibel dan feed resmi bursa.
                </p>

                {/* Badges of the 8 Channels */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {newsChannels.map((channel, i) => (
                    <span 
                      key={i} 
                      className={`text-[9.5px] px-1.5 py-0.5 rounded border font-medium ${channel.color}`}
                    >
                      {channel.name}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-mono">Auto Ingestion</span>
                  <span className="text-slate-300">Tiap Detik ⚡</span>
                </div>
              </div>

              {/* FLOW CONNECTOR 1 -> 2 (Realtime High Speed Flow) */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0 relative">
                <div className="w-full hidden lg:block relative h-6">
                  <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-slate-700/80 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 w-2/3 rounded-full ${
                        isAnimationPlaying ? 'pipeline-particle-travel-rapid' : ''
                      }`}
                    />
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-cyan-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="lg:hidden flex items-center gap-1 text-emerald-400 text-xs font-mono">
                  <span>Stream ke SahamFYP</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* STEP 2: SahamFYP Ingestion & AI Scoring */}
              <div 
                onClick={() => setSelectedNode(selectedNode === 'core2' ? null : 'core2')}
                className={`lg:col-span-3 rounded-xl p-4 transition-all duration-200 cursor-pointer border ${
                  selectedNode === 'core2'
                    ? 'bg-teal-950/30 border-teal-500 ring-1 ring-teal-400'
                    : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Filter & Enrichment
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mt-3 flex items-center gap-1.5">
                  SahamFYP Ingestion
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Filtering berita relevan (Score &gt; 8), deteksi sentimen, validasi kode emiten & pengayaan data fundamental.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-teal-300 font-medium">Relevance Score &gt; 8</span>
                  <span className="text-cyan-300 font-mono">Auto Draft Gen</span>
                </div>
              </div>

              {/* FLOW CONNECTOR 2 -> 3 */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0 relative">
                <div className="w-full hidden lg:block relative h-6">
                  <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-slate-700/80 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 w-2/3 rounded-full ${
                        isAnimationPlaying ? 'pipeline-particle-travel-rapid' : ''
                      }`}
                    />
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-indigo-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="lg:hidden flex items-center gap-1 text-teal-400 text-xs font-mono">
                  <span>Diterbitkan ke Postingan</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              {/* STEP 3: Postingan Breaking News */}
              <div 
                onClick={() => {
                  if (onNavigate) onNavigate('generator');
                }}
                className="lg:col-span-3 rounded-xl p-4 bg-gradient-to-br from-slate-800 to-slate-850 hover:to-slate-800 border border-cyan-500/40 hover:border-cyan-400 transition-all duration-200 cursor-pointer group shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Send className="w-5 h-5 group-hover:scale-110 transition" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Hasil Postingan
                  </span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mt-3 flex items-center justify-between">
                  Postingan Breaking News
                  <span className="text-xs text-cyan-400 group-hover:translate-x-1 transition">Buka Generator ↗</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Carousel breaking news terverifikasi, flash alert, dan ringkasan insight saham instan siap upload.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-cyan-300 font-medium">Flash Carousel & Alert</span>
                  <span className="text-slate-300 font-mono">Publish Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continuous Flow Pipe Canvas (SVG Graphic Animation Stream) */}
        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">
              Status Aliran Pipa Otomasi: <strong className="text-emerald-400">Continuous Stream Aktif (100% Non-Stop)</strong>
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Latency: <strong className="text-cyan-400">&lt; 1.2s</strong></span>
            <span>Uptime: <strong className="text-emerald-400">99.98%</strong></span>
            <span>Jalur: <strong className="text-amber-400">2 Dedicated Pipes</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}

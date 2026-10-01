import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Breadcrumbs from './Breadcrumbs';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  Globe,
  Tag,
  Share2,
  Check,
  CheckCircle2,
  XCircle,
  Building2,
  Sparkles,
  Info
} from 'lucide-react';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [news, setNews] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadNewsDetail(id);
    }
  }, [id]);

  const loadNewsDetail = async (newsId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('sector_trigger_news')
        .select('*')
        .eq('id', newsId)
        .maybeSingle();

      if (err) throw err;
      if (!data) {
        setError('Berita tidak ditemukan.');
        return;
      }
      setNews(data);
    } catch (e: any) {
      console.error('loadNewsDetail error:', e);
      setError(e.message || 'Gagal memuat detail berita.');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmtDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return isoStr;
    }
  };

  const getDomain = (url?: string | null) => {
    if (!url) return 'Media Nasional';
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'Media Nasional';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-zinc-400 font-medium text-sm">Memuat rincian berita & scoring AI...</p>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto mt-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-800">
        <span className="text-4xl block">📰</span>
        <h2 className="text-xl font-bold text-slate-900">Berita Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">{error || 'Data artikel tidak tersedia di arsip.'}</p>
        <button
          onClick={() => navigate('/news')}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition cursor-pointer"
        >
          Kembali ke News Monitoring
        </button>
      </div>
    );
  }

  const isGenerate = news.decision === 'GENERATE' || (news.score ?? 0) >= 9;
  const symbols: string[] = news.symbols || [];
  const tags: string[] = news.tags || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 text-slate-800">
      {/* 1. Breadcrumbs & Top Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Breadcrumbs
          items={[
            { label: 'News Monitoring', to: '/news' },
            { label: news.title || 'Detail Berita' },
          ]}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
          </button>
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Berita</span>
          </button>
        </div>
      </div>

      {/* 2. Main Article Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Meta Info Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-rose-600" />
              {getDomain(news.source_url)}
            </span>
            <span className="text-slate-500 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {fmtDate(news.published_at || news.timestamp || news.created_at)}
            </span>
          </div>

          {news.source_url && (
            <a
              href={news.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 transition"
            >
              <span>Buka Artikel Sumber</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          {news.title}
        </h1>

        {/* Tags & Symbols */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-slate-100">
          {/* Ticker Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-semibold">Emiten Terdeteksi:</span>
            {symbols.map((sym, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs rounded-lg tracking-wider"
              >
                ${sym.replace('.JK', '')}
              </span>
            ))}
            {!symbols.length && <span className="text-xs text-slate-400">-</span>}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Featured Photo Thumbnail */}
        {news.thumbnail_url && (
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
            <img
              src={news.thumbnail_url}
              alt={news.title || 'Foto Berita'}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* AI Decision Box */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isGenerate
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isGenerate ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              {isGenerate ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Keputusan Kurasi AI: {isGenerate ? 'LOLOS (GENERATE)' : 'DITOLAK (PASS)'}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800 shadow-xs">
                  Skor: {news.score ?? '-'}/10
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {news.reason || (isGenerate ? 'Berita memiliki dampak katalis riil dan data faktual kuat.' : 'Berita kurang berdampak signifikan pada valuasi.')}
              </p>
            </div>
          </div>
        </div>

        {/* Article Body */}
        {news.body && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Naskah Lengkap Artikel
            </h3>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
              {news.body}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

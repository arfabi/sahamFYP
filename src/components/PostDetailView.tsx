// ============================================================
// PostDetailView.tsx
// Dedicated full-page view (non-modal) for Post Details
// Features: News & Catalyst, Full Carousel Slide Preview, Social Media Status, and Repliz Live Link Sync
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  type AutomationPost,
  type GeneratedPost,
  type PostImage,
  postImagesApi,
  contentLogsApi,
  sectorTriggerNewsApi,
  syncReplizLiveLink,
  getReplizScheduleDetails,
  supabase,
} from '../services/supabase';
import TemplateRenderer, { PALETTE } from '../Templates';
import Breadcrumbs from './Breadcrumbs';

interface PostDetailViewProps {
  post: AutomationPost | GeneratedPost;
  type: 'automation' | 'manual';
  onBack: () => void;
  onPostUpdated?: () => void;
}

const SOCIAL_CHANNELS = [
  {
    name: 'Instagram',
    handle: '@sahamfyp.id',
    url: 'https://www.instagram.com/sahamfyp.id/',
    icon: '📸',
    badgeColor: 'text-pink-700 bg-pink-50 border-pink-200 hover:bg-pink-100',
  },
  {
    name: 'TikTok',
    handle: '@sahamfyp.id',
    url: 'https://www.tiktok.com/@sahamfyp.id',
    icon: '🎵',
    badgeColor: 'text-slate-800 bg-slate-100 border-slate-200 hover:bg-slate-200/70',
  },
  {
    name: 'Facebook',
    handle: 'sahamfyp.id',
    url: 'https://www.facebook.com/116968125335221',
    icon: '👥',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
  {
    name: 'Threads',
    handle: '@sahamfyp.id',
    url: 'https://www.threads.net/@sahamfyp.id',
    icon: '🧵',
    badgeColor: 'text-slate-800 bg-slate-100 border-slate-200 hover:bg-slate-200/70',
  },
  {
    name: 'Telegram',
    handle: '@sahamfyp',
    url: 'https://t.me/sahamfyp',
    icon: '✈️',
    badgeColor: 'text-sky-700 bg-sky-50 border-sky-200 hover:bg-sky-100',
  },
];

export default function PostDetailView({ post, type, onBack, onPostUpdated }: PostDetailViewProps) {
  // Common properties
  const isAutomation = type === 'automation';
  const autoPost = isAutomation ? (post as AutomationPost) : null;
  const manualPost = !isAutomation ? (post as GeneratedPost) : null;

  // State: Status & Repliz Status
  const initialStatus = isAutomation
    ? autoPost?.status || 'pending'
    : manualPost?.instagram_status || 'scheduled';
  const [currentStatus, setCurrentStatus] = useState<string>(initialStatus);
  const initialLiveLink = isAutomation
    ? autoPost?.post_link || ''
    : manualPost?.permalink || manualPost?.permalink_ig || manualPost?.permalink_tiktok || '';
  const [liveLink, setLiveLink] = useState<string>(initialLiveLink);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // State: Carousel Images & Active Slide
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [slides, setSlides] = useState<string[]>([]);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(true);

  // State: News / Catalyst / Content Details
  const [newsDetail, setNewsDetail] = useState<any>(null);
  const [dailyBriefData, setDailyBriefData] = useState<{
    log: any;
    candidates: any[];
    news: any[];
  } | null>(null);
  const [loadingCatalyst, setLoadingCatalyst] = useState<boolean>(true);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const scheduleId = isAutomation ? autoPost?.post_id : manualPost?.schedule_id;
  const accountName = isAutomation ? autoPost?.account_id || '@sahamfyp.id' : `@${manualPost?.handle || 'sahamfyp'}`;
  const captionText = isAutomation ? autoPost?.caption || '' : '';
  const createdAt = post.created_at;

  // ─── 1. Load Slides & Images ──────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadMedia() {
      setLoadingMedia(true);
      try {
        if (isAutomation && autoPost) {
          const thumb = autoPost.thumbnail_url || '';

          // If thumbnail comes from Supabase Storage pattern (slide-{execId}-0.jpg)
          const match = thumb.match(/(.*\/sfyp-storage\/slide-[a-zA-Z0-9_-]+-)0\.jpg/);
          if (match) {
            const prefix = match[1];
            // Test slides 0 to 9 in parallel
            const candidateUrls = Array.from({ length: 10 }, (_, i) => `${prefix}${i}.jpg`);
            const checkPromises = candidateUrls.map(async (url) => {
              try {
                const res = await fetch(url, { method: 'HEAD' });
                return res.ok ? url : null;
              } catch {
                return null;
              }
            });
            const valid = (await Promise.all(checkPromises)).filter(Boolean) as string[];
            if (isMounted && valid.length > 0) {
              setSlides(valid);
              setLoadingMedia(false);
              return;
            }
          }

          // Fallback: If we have scheduleId, try fetching media from Repliz
          if (autoPost.post_id) {
            try {
              const details = await getReplizScheduleDetails(autoPost.post_id);
              if (details.medias && details.medias.length > 0) {
                const urls = details.medias.map((m) => m.url || m.thumbnail).filter(Boolean) as string[];
                if (isMounted && urls.length > 0) {
                  setSlides(urls);
                  setLoadingMedia(false);
                  return;
                }
              }
            } catch {
              // ignore
            }
          }

          // Final fallback to thumbnail
          if (thumb && isMounted) {
            setSlides([thumb]);
          }
        } else if (manualPost) {
          // Fetch from post_images table
          const images = (await postImagesApi.getByPostId(manualPost.id)) as PostImage[];
          if (images && images.length > 0) {
            const sortedUrls = images
              .sort((a, b) => a.slide_number - b.slide_number)
              .map((img) => img.cloudinary_url);
            if (isMounted) setSlides(sortedUrls);
          }
        }
      } catch (err) {
        console.warn('Error loading post media:', err);
      } finally {
        if (isMounted) setLoadingMedia(false);
      }
    }

    void loadMedia();
    return () => {
      isMounted = false;
    };
  }, [post.id, isAutomation]);

  // ─── 2. Load Catalyst / News Details ───────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadCatalyst() {
      setLoadingCatalyst(true);
      try {
        if (isAutomation && autoPost) {
          // ====================================================
          // A. DAILY MARKET BRIEF (Multi-Emiten & Ringkasan Pasar)
          // ====================================================
          if (autoPost.workflow_type === 'daily_market_brief') {
            const postDate = new Date(autoPost.created_at).toISOString().split('T')[0];

            let log: any = null;
            // 1. Coba cari log dengan trigger_date yang sama
            const { data: logsByDate } = await supabase
              .from('sector_trigger_logs')
              .select('*')
              .eq('trigger_date', postDate)
              .order('created_at', { ascending: false })
              .limit(1);

            if (logsByDate && logsByDate.length > 0) {
              log = logsByDate[0];
            } else {
              // Fallback: cari log paling dekat dengan tanggal postingan
              const { data: recentLogs } = await supabase
                .from('sector_trigger_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

              if (recentLogs && recentLogs.length > 0) {
                const postTime = new Date(autoPost.created_at).getTime();
                log = recentLogs.reduce((prev: any, curr: any) => {
                  const prevDiff = Math.abs(new Date(prev.created_at).getTime() - postTime);
                  const currDiff = Math.abs(new Date(curr.created_at).getTime() - postTime);
                  return currDiff < prevDiff ? curr : prev;
                });
              }
            }

            if (log && isMounted) {
              // Ambil kandidat saham & berita pada log session ini
              const [candRes, newsRes] = await Promise.all([
                supabase.from('sector_trigger_candidates').select('*').eq('log_id', log.id),
                supabase.from('sector_trigger_news').select('*').eq('log_id', log.id),
              ]);

              const candidates = (candRes.data || []) as any[];
              const newsList = (newsRes.data || []) as any[];

              setDailyBriefData({
                log,
                candidates,
                news: newsList,
              });
              setNewsDetail(null);
            }
            return;
          }

          // ====================================================
          // B. NEWS MONITORING (Katalis Berita Tunggal)
          // ====================================================
          const caption = autoPost.caption || '';

          // 1. Ekstrak ticker saham dari hashtag (#ADHI, #ULTJ, #IFII, dsb)
          const hashtagMatches = Array.from(caption.matchAll(/#([A-Za-z0-9_]+)/g)).map((m) => m[1].toUpperCase());
          const tickerIgnores = new Set([
            'SAHAMFYP', 'INVESTASISAHAM', 'BELAJARSAHAM', 'INFOSAHAM', 'EDUKASISAHAM', 
            'DIVIDENSAHAM', 'DIVIDENSEASON', 'ANALISISSAHAM', 'SAHAMINDONESIA', 'SAHAMBUMN', 
            'SAHAMBANK', 'RIGHTSISSUE', 'BERITASAHAM', 'DYOR', 'IHSG', 'BUMN', 'BEI', 'INFOEMITEN'
          ]);
          const candidateTickers = hashtagMatches.filter((t) => !tickerIgnores.has(t) && t.length >= 3 && t.length <= 5);

          // 2. Deteksi kata 4 huruf kapital di caption
          const wordMatches = Array.from(caption.matchAll(/\b([A-Z]{4})\b/g)).map((m) => m[1]);
          const allFoundTickers = Array.from(new Set([...candidateTickers, ...wordMatches])).filter((t) => !tickerIgnores.has(t));

          let matchedNews: any = null;

          // Cari di sector_trigger_news berdasarkan ticker
          if (allFoundTickers.length > 0) {
            for (const ticker of allFoundTickers) {
              const { data: newsItems } = await supabase
                .from('sector_trigger_news')
                .select('*')
                .or(`symbols.cs.{${ticker}.JK},symbols.cs.{${ticker}},title.ilike.%${ticker}%`)
                .order('published_at', { ascending: false })
                .limit(5);

              if (newsItems && newsItems.length > 0) {
                // Pilih berita paling dekat dengan waktu publish
                const postTime = new Date(autoPost.created_at).getTime();
                matchedNews = newsItems.reduce((prev: any, curr: any) => {
                  const prevDiff = Math.abs(new Date(prev.published_at || prev.created_at).getTime() - postTime);
                  const currDiff = Math.abs(new Date(curr.published_at || curr.created_at).getTime() - postTime);
                  return currDiff < prevDiff ? curr : prev;
                });
                break;
              }
            }
          }

          // Fallback: Cari dengan kata kunci di judul/caption
          if (!matchedNews) {
            const firstLine = caption.split('\n')[0].replace(/[#*]/g, '').trim();
            const keywords = firstLine.split(/\s+/).filter((w) => w.length >= 4).slice(0, 3);
            if (keywords.length > 0) {
              const { data: keywordNews } = await supabase
                .from('sector_trigger_news')
                .select('*')
                .ilike('title', `%${keywords[0]}%`)
                .order('published_at', { ascending: false })
                .limit(5);

              if (keywordNews && keywordNews.length > 0) {
                matchedNews = keywordNews[0];
              }
            }
          }

          // Fallback: 15 berita terbaru
          if (!matchedNews) {
            const recent = await sectorTriggerNewsApi.getRecent(15);
            if (recent.length > 0) {
              const match = recent.find((n: any) =>
                allFoundTickers.some((t) => n.symbols?.includes(`${t}.JK`) || n.title?.includes(t))
              );
              if (match) matchedNews = match;
            }
          }

          if (isMounted) {
            setNewsDetail(matchedNews);
            setDailyBriefData(null);
          }
        } else if (manualPost && manualPost.log_id) {
          const log = await contentLogsApi.getById(manualPost.log_id);
          if (isMounted && log) {
            setNewsDetail(log);
            setDailyBriefData(null);
          }
        }
      } catch (err) {
        console.warn('Error loading catalyst details:', err);
      } finally {
        if (isMounted) setLoadingCatalyst(false);
      }
    }

    void loadCatalyst();
    return () => {
      isMounted = false;
    };
  }, [post.id, isAutomation]);

  // ─── 3. Sync Repliz Schedule Status Action ───────────────
  const handleSyncRepliz = async () => {
    if (!scheduleId) {
      setSyncMessage({
        type: 'error',
        text: 'Postingan ini tidak memiliki Schedule ID Repliz yang tersimpan.',
      });
      return;
    }

    setSyncing(true);
    setSyncMessage(null);

    try {
      const res = await syncReplizLiveLink({
        scheduleId,
        recordId: post.id,
        type: isAutomation ? 'automation' : 'manual',
      });

      if (res.success === false) {
        setSyncMessage({
          type: 'error',
          text: res.message || (res as any).error || 'Gagal sinkronisasi status dari Repliz.',
        });
        return;
      }

      const st = ((res as any).status || res.scheduleStatus || '').toLowerCase();
      const isSuccess = st === 'success' || st === 'published' || st === 'completed';
      const isFailed = st === 'failed' || st === 'error' || st === 'cancelled';

      if (isSuccess) {
        setCurrentStatus('success');
        setSyncMessage({
          type: 'success',
          text: res.message || 'Postingan terverifikasi sudah terbit (STATUS: SUCCESS)! Silakan cek langsung di profil akun sosial media di bawah.',
        });
        if (onPostUpdated) onPostUpdated();
      } else if (isFailed) {
        setCurrentStatus('error');
        setSyncMessage({
          type: 'error',
          text: res.message || `Postingan gagal terbit di Repliz (STATUS: ${st.toUpperCase()}).`,
        });
        if (onPostUpdated) onPostUpdated();
      } else {
        setCurrentStatus('pending');
        setSyncMessage({
          type: 'info',
          text: res.message || `Status di Repliz saat ini: "${st.toUpperCase()}". Postingan masih dalam proses antrean (~10 menit). Silakan cek berkala.`,
        });
      }

      // If Repliz returned updated medias, update carousel
      if (res.medias && res.medias.length > 0) {
        const freshUrls = res.medias.map((m) => m.url || m.thumbnail).filter(Boolean) as string[];
        if (freshUrls.length > 0) {
          setSlides(freshUrls);
        }
      }
    } catch (error: any) {
      setSyncMessage({
        type: 'error',
        text: `Gagal sinkronisasi: ${error.message || 'Terjadi kesalahan pada request ke Repliz.'}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  // ─── 4. Auto-check Repliz Schedule Status on Mount ────────
  useEffect(() => {
    let isMounted = true;

    // Jika tidak ada scheduleId, skip
    if (!scheduleId) return;

    // Jika di database statusnya belum success/published, langsung cek otomatis ke Repliz
    const isAlreadySuccess = currentStatus === 'success' || currentStatus === 'published' || currentStatus === 'completed';
    if (isAlreadySuccess) return;

    async function autoCheckStatus() {
      try {
        setSyncing(true);
        const res = await syncReplizLiveLink({
          scheduleId: scheduleId as string,
          recordId: post.id,
          type: isAutomation ? 'automation' : 'manual',
        });

        if (!isMounted) return;

        if (res.success) {
          const st = ((res as any).status || res.scheduleStatus || '').toLowerCase();
          const isSuccess = st === 'success' || st === 'published' || st === 'completed';
          const isFailed = st === 'failed' || st === 'error' || st === 'cancelled';

          if (isSuccess) {
            setCurrentStatus('success');
            setSyncMessage({
              type: 'success',
              text: res.message || 'Postingan terverifikasi sudah terbit (STATUS: SUCCESS)!',
            });
            if (onPostUpdated) onPostUpdated();
          } else if (isFailed) {
            setCurrentStatus('error');
            setSyncMessage({
              type: 'error',
              text: res.message || `Postingan gagal terbit di Repliz (STATUS: ${st.toUpperCase()}).`,
            });
            if (onPostUpdated) onPostUpdated();
          } else {
            setCurrentStatus('pending');
            setSyncMessage({
              type: 'info',
              text: res.message || `Status di Repliz: "${st.toUpperCase()}" (Masih dalam proses).`,
            });
          }

          if (res.medias && res.medias.length > 0) {
            const freshUrls = res.medias.map((m) => m.url || m.thumbnail).filter(Boolean) as string[];
            if (freshUrls.length > 0) {
              setSlides(freshUrls);
            }
          }
        }
      } catch (err) {
        console.warn('[PostDetailView] Auto-check Repliz error:', err);
      } finally {
        if (isMounted) setSyncing(false);
      }
    }

    void autoCheckStatus();

    return () => {
      isMounted = false;
    };
  }, [scheduleId, post.id, isAutomation]);

  // Copy helper
  const copyToClipboard = (text: string, copyType: 'caption' | 'link') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (copyType === 'caption') {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // Manual slides_json rendering fallback
  const manualSlidesList = useMemo(() => {
    if (manualPost && Array.isArray(manualPost.slides_json)) {
      return manualPost.slides_json;
    }
    return [];
  }, [manualPost]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── Top Bar / Breadcrumb ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-xl border border-slate-200 transition cursor-pointer shadow-2xs"
          >
            <span>←</span>
            <span>Kembali ke Daftar Post</span>
          </button>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <Breadcrumbs
            items={[
              { label: 'Posts', to: '/post' },
              { label: `Post #${post.id.slice(0, 8)}` },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>📅 Dibuat: {fmtDate(createdAt)}</span>
        </div>
      </div>

      {/* ── Main Layout: 2 Columns ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: Interactive Carousel Preview ──────── */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 text-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🖼️</span>
                <h2 className="font-bold text-slate-900 text-base">Slide Carousel Preview</h2>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
                Slide {activeSlide + 1} dari {slides.length || manualSlidesList.length || 1}
              </div>
            </div>

            {/* Main Slide Screen (1080x1350 / 4:5 Aspect Ratio Container) */}
            <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center group shadow-inner">
              {loadingMedia ? (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Memuat gambar slide...</span>
                </div>
              ) : slides.length > 0 ? (
                <img
                  src={slides[activeSlide]}
                  alt={`Slide ${activeSlide + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : manualSlidesList.length > 0 ? (
                <div className="w-full h-full scale-[0.38] sm:scale-[0.45] origin-top flex items-center justify-center p-4">
                  <TemplateRenderer
                    template={manualSlidesList[activeSlide]?.template || 'cover'}
                    handle={manualPost?.handle || '@sahamfyp'}
                    badgeText={manualPost?.badge_text || 'SAHAM'}
                    badgeBgColor={manualPost?.badge_bg_color || PALETTE.navy}
                    badgeTextColor={manualPost?.badge_text_color || '#FFFFFF'}
                    textColor={PALETTE.navy}
                    accentColor={PALETTE.amber}
                    bgColor={PALETTE.cream}
                    title={manualSlidesList[activeSlide]?.title || ''}
                    description={manualSlidesList[activeSlide]?.description || ''}
                    source={manualSlidesList[activeSlide]?.source || 'SahamFYP'}
                    disclaimer={manualSlidesList[activeSlide]?.disclaimer || 'DYOR'}
                    visualMode={manualSlidesList[activeSlide]?.visualMode || 'icon'}
                    visualIcon={manualSlidesList[activeSlide]?.visualIcon || 'TrendingUp'}
                    illustrationUrl={manualSlidesList[activeSlide]?.illustrationUrl || null}
                    tldrCards={manualSlidesList[activeSlide]?.tldrCards || []}
                    metrics={manualSlidesList[activeSlide]?.metrics || []}
                    bullets={manualSlidesList[activeSlide]?.bullets || []}
                    slideIndex={activeSlide}
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <span className="text-3xl block mb-2">📸</span>
                  <p className="text-xs">Belum ada preview slide yang tergenerate.</p>
                </div>
              )}

              {/* Prev / Next Navigation Overlay Buttons */}
              {(slides.length > 1 || manualSlidesList.length > 1) && (
                <>
                  <button
                    onClick={() =>
                      setActiveSlide((curr) =>
                        curr > 0 ? curr - 1 : (slides.length || manualSlidesList.length) - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center backdrop-blur-sm border border-slate-200 transition shadow-md opacity-80 group-hover:opacity-100 cursor-pointer"
                    title="Slide Sebelumnya"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setActiveSlide((curr) =>
                        curr < (slides.length || manualSlidesList.length) - 1 ? curr + 1 : 0
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center backdrop-blur-sm border border-slate-200 transition shadow-md opacity-80 group-hover:opacity-100 cursor-pointer"
                    title="Slide Selanjutnya"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip underneath */}
            {(slides.length > 1 || manualSlidesList.length > 1) && (
              <div className="mt-4 flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {(slides.length > 0 ? slides : manualSlidesList).map((item, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    onClick={() => setActiveSlide(idx)}
                    className={`relative w-14 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition cursor-pointer ${
                      activeSlide === idx
                        ? 'border-rose-500 scale-105 shadow-md ring-2 ring-rose-400/30'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {typeof item === 'string' ? (
                      <img src={item} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                        #{idx + 1}
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white font-bold text-center py-0.5">
                      {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Catalyst, Social Media Status & Repliz ── */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Status Publikasi & Cek Profil Sosial Media Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Status Publikasi Repliz</h3>
                  <p className="text-xs text-slate-500">Akun: {accountName}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  (currentStatus === 'success' || currentStatus === 'published' || currentStatus === 'completed')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : (currentStatus === 'failed' || currentStatus === 'error' || currentStatus === 'cancelled')
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {(currentStatus === 'success' || currentStatus === 'published' || currentStatus === 'completed')
                  ? 'PUBLISHED (TERBIT)'
                  : (currentStatus === 'failed' || currentStatus === 'error' || currentStatus === 'cancelled')
                  ? 'FAILED (GAGAL)'
                  : 'SCHEDULED / PROSES'}
              </span>
            </div>

            {/* Status Information Box */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              (currentStatus === 'success' || currentStatus === 'published' || currentStatus === 'completed')
                ? 'bg-emerald-50/70 border-emerald-200'
                : (currentStatus === 'failed' || currentStatus === 'error' || currentStatus === 'cancelled')
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span>{(currentStatus === 'success' || currentStatus === 'published' || currentStatus === 'completed') ? '✅' : (currentStatus === 'failed' || currentStatus === 'error' || currentStatus === 'cancelled') ? '❌' : '⏳'}</span>
                  <span className={(currentStatus === 'success' || currentStatus === 'published' || currentStatus === 'completed') ? 'text-emerald-800' : (currentStatus === 'failed' || currentStatus === 'error' || currentStatus === 'cancelled') ? 'text-rose-800' : 'text-amber-800'}>
                    {(currentStatus === 'success' || currentStatus === 'published' || currentStatus === 'completed')
                      ? 'Postingan Terkonfirmasi Terbit'
                      : (currentStatus === 'failed' || currentStatus === 'error' || currentStatus === 'cancelled')
                      ? 'Postingan Gagal Terbit di Repliz'
                      : 'Postingan Sedang Diproses di Repliz'}
                  </span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase ${
                  (currentStatus === 'success' || currentStatus === 'published' || currentStatus === 'completed')
                    ? 'bg-emerald-100 text-emerald-800'
                    : (currentStatus === 'failed' || currentStatus === 'error' || currentStatus === 'cancelled')
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentStatus}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {(currentStatus === 'success' || currentStatus === 'published' || currentStatus === 'completed')
                  ? 'Status postingan di Repliz telah SUCCESS. Silakan klik tombol akun media sosial di bawah untuk melihat postingan langsung di profil Anda.'
                  : 'Sistem Repliz membutuhkan waktu antrean sekitar ~10 menit hingga postingan otomatis terbit di media sosial.'}
              </p>

              {scheduleId && (
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 font-mono mt-1 flex items-center justify-between">
                  <span>Schedule ID: <strong className="text-slate-900">{scheduleId}</strong></span>
                </div>
              )}
            </div>

            {/* Tombol Cek Profil Sosial Media */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cek Langsung di Profil Akun Sosmed:
                </h4>
                <span className="text-[11px] text-slate-400">Buka di tab baru ↗</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SOCIAL_CHANNELS.map((ch) => (
                  <a
                    key={ch.name}
                    href={ch.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition group ${ch.badgeColor}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg flex-shrink-0">{ch.icon}</span>
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition">
                          {ch.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {ch.handle}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition flex-shrink-0">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Sync Button & Feedback */}
            <div className="pt-1">
              <button
                onClick={handleSyncRepliz}
                disabled={syncing || !scheduleId}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition cursor-pointer"
              >
                {syncing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengecek status ke Repliz...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Cek & Sinkronkan Status dari Repliz</span>
                  </>
                )}
              </button>

              {syncMessage && (
                <div
                  className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    syncMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : syncMessage.type === 'info'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span className="text-sm">
                    {syncMessage.type === 'success' ? '🎉' : syncMessage.type === 'info' ? 'ℹ️' : '⚠️'}
                  </span>
                  <div className="flex-1 leading-relaxed">{syncMessage.text}</div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Berita, Katalis & Ringkasan Analisis Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {isAutomation && autoPost?.workflow_type === 'daily_market_brief' ? '📈' : '📰'}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isAutomation && autoPost?.workflow_type === 'daily_market_brief'
                      ? 'Daily Market Brief & Multi-Katalis'
                      : 'Berita & Katalis Terkait'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAutomation && autoPost?.workflow_type === 'daily_market_brief'
                      ? 'Kompilasi berita pasar, sentimen IHSG, dan saham pilihan AI'
                      : 'Sumber informasi dasar postingan'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {isAutomation && autoPost?.workflow_type === 'daily_market_brief' ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  Daily Brief Digest
                </span>
              ) : newsDetail?.score !== undefined ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Skor AI: {newsDetail.score}/10
                </span>
              ) : null}
            </div>

            {loadingCatalyst ? (
              <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full" />
                <span>Memuat data berita & analisis pasar...</span>
              </div>
            ) : isAutomation && autoPost?.workflow_type === 'daily_market_brief' && dailyBriefData ? (
              /* DAILY MARKET BRIEF MULTI-NEWS & MARKET DIGEST */
              <div className="space-y-4">
                {/* IHSG & Session KPI Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">Sesi Pasar</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                      {dailyBriefData.log.session === 'open' ? '☀️ Open (Pagi)' : '🌙 Close (Sore)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Indeks IHSG</span>
                    <span className="text-slate-900 font-mono font-bold text-sm mt-0.5 block">
                      {dailyBriefData.log.ihsg_price
                        ? Number(dailyBriefData.log.ihsg_price).toLocaleString('id-ID', { maximumFractionDigits: 2 })
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Perubahan IHSG</span>
                    <span
                      className={`font-bold font-mono text-sm mt-0.5 block ${
                        Number(dailyBriefData.log.ihsg_change) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {dailyBriefData.log.ihsg_change != null
                        ? `${Number(dailyBriefData.log.ihsg_change) >= 0 ? '+' : ''}${Number(
                            dailyBriefData.log.ihsg_change
                          ).toFixed(2)}%`
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Saham Terpilih</span>
                    <span className="text-amber-800 font-bold text-sm mt-0.5 block">
                      {dailyBriefData.candidates.length || dailyBriefData.log.tickers_selected || 0} Emiten
                    </span>
                  </div>
                </div>

                {/* AI Market Reasoning Quote */}
                {dailyBriefData.log.reasoning && (
                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <span>🤖</span>
                      <span>Alasan Kurasi Pasar AI:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed italic">
                      "{dailyBriefData.log.reasoning}"
                    </p>
                  </div>
                )}

                {/* Selected Candidates & News List */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                    <span>Daftar Saham Pilihan & Katalis Berita:</span>
                    <span className="text-slate-400 font-normal">
                      {dailyBriefData.candidates.length} emiten dianalisis
                    </span>
                  </div>

                  {dailyBriefData.candidates.map((cand, idx) => {
                    const candTicker = (cand.ticker || '').replace('.JK', '');
                    const matchedArticle = dailyBriefData.news.find(
                      (n) =>
                        n.symbols?.includes(cand.ticker) ||
                        n.symbols?.includes(`${candTicker}.JK`) ||
                        n.symbols?.includes(candTicker) ||
                        (n.title && n.title.includes(candTicker))
                    );

                    let tech: any = null;
                    if (cand.technical_json) {
                      try {
                        tech =
                          typeof cand.technical_json === 'string'
                            ? JSON.parse(cand.technical_json)
                            : cand.technical_json;
                      } catch {
                        // ignore
                      }
                    }

                    return (
                      <div
                        key={cand.id || idx}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition rounded-xl border border-slate-200 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-amber-800 font-mono bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-xs">
                              {candTicker}
                            </span>
                            <span className="font-bold text-slate-800 text-xs line-clamp-1">
                              {cand.company_name || candTicker}
                            </span>
                          </div>
                          {cand.price && (
                            <span className="text-xs font-bold font-mono text-slate-700 whitespace-nowrap">
                              Rp {Number(cand.price).toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>

                        {/* News Title & Link */}
                        {(cand.news_title || matchedArticle?.title) && (
                          <div className="text-xs text-slate-700 font-medium leading-snug">
                            📰 {cand.news_title || matchedArticle?.title}
                          </div>
                        )}

                        {/* Tags / Signals */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {tech?.crossSignal && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {tech.crossSignal}
                            </span>
                          )}
                          {cand.pe_signal && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200/70 text-slate-700 border border-slate-300">
                              PE: {cand.pe_signal}
                            </span>
                          )}
                          {matchedArticle?.source_url && (
                            <a
                              href={matchedArticle.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-auto text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
                            >
                              Buka Berita ↗
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : newsDetail ? (
              /* SINGLE NEWS CARD (NEWS MONITORING / MANUAL) */
              <div className="space-y-3">
                {/* News Thumbnail & Title */}
                <div className="flex items-start gap-3">
                  {newsDetail.thumbnail_url && (
                    <div className="w-20 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                      <img
                        src={newsDetail.thumbnail_url}
                        alt="News thumb"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {newsDetail.title || 'Untitled News'}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {newsDetail.sitename || 'Media Partner'}
                      </span>
                      {newsDetail.source_url && (
                        <a
                          href={newsDetail.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                        >
                          Buka Artikel ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Score & Reason / Impact */}
                {(newsDetail.score !== undefined || newsDetail.reason || newsDetail.description) && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    {newsDetail.score !== undefined && (
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold">Skor Katalis AI:</span>
                        <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {newsDetail.score} / 10 ({newsDetail.decision || 'GENERATE'})
                        </span>
                      </div>
                    )}
                    {newsDetail.reason && (
                      <div className="text-slate-700">
                        <span className="font-semibold text-slate-900">Alasan Analisis: </span>
                        {newsDetail.reason}
                      </div>
                    )}
                    {newsDetail.description && (
                      <div className="text-slate-500 italic">
                        "{newsDetail.description}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* FALLBACK WHEN NO MATCH FOUND */
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-semibold text-slate-900">
                  {isAutomation
                    ? autoPost?.workflow_type === 'daily_market_brief'
                      ? '📈 Daily Market Brief (IHSG, Top Movers & Sektor)'
                      : '📡 Katalis Berita Harian'
                    : `📝 Post Generator: ${manualPost?.badge_text || 'SahamFYP'}`}
                </div>
                <p className="text-slate-500 leading-relaxed">
                  {isAutomation
                    ? 'Konten ini diproses secara otomatis dari monitoring emiten dan dianalisis menggunakan LLM naskah generator.'
                    : 'Konten dibuat melalui Form Wizard / Manual Editor dengan naskah kustom.'}
                </p>
              </div>
            )}
          </div>

          {/* 3. Full Caption Card */}
          {captionText && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3 text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <h3 className="font-bold text-slate-900 text-base">Caption Sosial Media</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(captionText, 'caption')}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer shadow-2xs"
                >
                  {copiedCaption ? 'Tersalin! ✓' : 'Salin Caption'}
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-sans">
                {captionText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Manual Editor - Create content manually with full editor
import React, { useState, useCallback } from 'react';
import TemplateRenderer, { PALETTE } from '../Templates';
import { generateAllSlides, downloadAllImages } from '../services/imageGenerator';
import { publishToInstagram, isReplizConfigured } from '../services/repliz';
import { generateInstagramCaption } from '../services/llm';
import { contentLogsApi, generatedPostsApi } from '../services/supabase';
import type { CarouselData, SlideData } from '../types';
import { CATEGORIES, TEMPLATE_ICONS, DEFAULT_SLIDES, uid, type ManualSlideData, type ContentCategory } from './manualEditorData';

export default function ManualEditor() {
  const [category, setCategory] = useState<ContentCategory>('SINGLE_STOCK');
  const [ticker, setTicker] = useState('');
  const [slides, setSlides] = useState<ManualSlideData[]>(DEFAULT_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [caption, setCaption] = useState('');
  const [captionLoading, setCaptionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateSlide = useCallback((index: number, updates: Partial<ManualSlideData>) => {
    setSlides(prev => {
      const n = [...prev];
      n[index] = { ...n[index], ...updates };
      return n;
    });
  }, []);

  const buildCarouselData = useCallback((): CarouselData => ({
    handle: '@sahamfyp',
    badgeText: ticker || 'MANUAL',
    badgeBgColor: PALETTE.navy,
    badgeTextColor: '#FFFFFF',
    textColor: PALETTE.navy,
    bgColor: PALETTE.cream,
    slides: slides.map(s => ({
      template: s.template,
      title: s.title,
      description: s.description,
      icon: s.icon,
      accent: PALETTE.amber,
      tldrCards: s.tldrCards,
      metrics: s.metrics,
      bullets: s.bullets,
      source: s.source,
      disclaimer: s.disclaimer,
      visualMode: 'icon' as const,
      visualIcon: s.icon,
      illustrationUrl: null,
    })) as SlideData[],
  }), [slides, ticker]);

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await contentLogsApi.create({
        url: 'manual://' + ticker,
        title: slides[0]?.title || 'Manual Content',
        category,
        ticker,
        status: 'generated',
        sectors_data: slides,
      });
      setMessage('Draft saved!');
    } catch {
      setMessage('Gagal save draft');
    }
    setSaving(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const images = await generateAllSlides(buildCarouselData());
      await downloadAllImages(images, `manual_${ticker || 'content'}`);
      setMessage('Download selesai!');
    } catch {
      setMessage('Gagal download');
    }
    setDownloading(false);
  };

  // Auto generate caption via LLM (Sumopod)
  const handleAutoCaption = async () => {
    setCaptionLoading(true);
    setMessage('');
    try {
      const cover = slides[0];
      const tldr = slides[1];
      const dataSlide = slides[3];
      const pros = slides[4];

      const captionText = await generateInstagramCaption({
        handle: '@sahamfyp',
        badgeText: ticker || 'MANUAL',
        title: cover.title || 'Berita Saham',
        description: cover.description || '',
        source: cover.source || '',
        category,
        tldrCards: (tldr?.tldrCards || []).map(c => c.text).filter(Boolean),
        metrics: (dataSlide?.metrics || []).map(m => ({ label: m.label, value: m.value })),
        bullets: (pros?.bullets || []).map(b => b.text).filter(Boolean),
      });
      setCaption(captionText);
      setMessage('Caption auto-generated! Silahkan review dan edit jika perlu.');
    } catch (err) {
      setMessage(`Gagal generate caption: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCaptionLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const images = await generateAllSlides(buildCarouselData());
      const imageUrls = images.map(img => img.dataUrl);
      const result = await publishToInstagram({
        images: imageUrls,
        caption: caption || slides[0]?.title || 'Manual Post',
      });
      if (result.success) {
        await generatedPostsApi.create({
          handle: '@sahamfyp',
          badge_text: ticker || 'MANUAL',
          slides_json: slides,
          total_slides: 8,
        });
        setMessage(`Published! Schedule ID: ${result.scheduleId}`);
      } else {
        setMessage(result.error || 'Gagal publish');
      }
    } catch {
      setMessage('Gagal publish');
    }
    setPublishing(false);
  };

  const handleFetchData = useCallback(async () => {
    if (!ticker) { setMessage('Masukkan ticker terlebih dahulu'); return; }
    setMessage('Fetching data dari Sectors.app...');
    try {
      const { fetchCompanyReport } = await import('../services/sectors');
      const data = await fetchCompanyReport(ticker, ['valuation', 'financials']);
      const valuation = data?.valuation;
      if (valuation) {
        setSlides(prev => {
          const n = [...prev];
          n[3] = {
            ...n[3],
            metrics: [
              { id: uid(), icon: 'TrendingUp', label: 'PER', value: valuation.pe?.toString() || '-', caption: 'Price to Earnings Ratio', tone: 'sage' },
              { id: uid(), icon: 'BarChart3', label: 'PBV', value: valuation.pb?.toString() || '-', caption: 'Price to Book Value', tone: 'amber' },
              { id: uid(), icon: 'Coins', label: 'ROE', value: valuation.roe?.toString() || '-', caption: 'Return on Equity', tone: 'sage' },
            ],
          };
          return n;
        });
        setMessage('Data berhasil di-fetch!');
      } else {
        setMessage('Tidak ada data untuk ticker ini');
      }
    } catch {
      setMessage('Gagal fetch data dari Sectors.app');
    }
  }, [ticker]);

  const currentSlide = slides[activeSlide];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">✏️ Manual Editor</h1>
          <p className="text-sm text-slate-500 mt-1">Buat konten carousel secara manual</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSaveDraft} disabled={saving}
            className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg">
            {saving ? '⏳' : '💾'} Save Draft
          </button>
          <button onClick={handleDownload} disabled={downloading}
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg">
            {downloading ? '⏳' : '📥'} Download
          </button>
          {isReplizConfigured() && (
            <button onClick={handlePublish} disabled={publishing}
              className="px-4 py-2 text-sm bg-pink-500 hover:bg-pink-600 text-white rounded-lg">
              {publishing ? '⏳' : '📱'} Publish
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">{message}</div>
      )}

      {/* Category & Ticker */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="font-semibold text-slate-800 mb-3">📁 Kategori & Ticker</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`p-3 rounded-lg text-center transition border-2 ${
                category === cat.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-transparent bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span className="text-2xl block">{cat.icon}</span>
              <span className="text-xs font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ticker (contoh: BBCA)"
            className="px-4 py-2 border border-slate-300 rounded-lg flex-1"
          />
          <button onClick={handleFetchData}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            📡 Fetch Data
          </button>
        </div>
      </div>

      {/* Instagram Caption */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h2 className="font-semibold text-slate-800 mb-3">📱 Instagram Caption</h2>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Tulis caption Instagram di sini... (atau klik Auto Caption untuk generate via AI)"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px]"
          rows={4}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">{caption.length}/2200 karakter</span>
          <button
            onClick={handleAutoCaption}
            disabled={captionLoading}
            className="px-3 py-1.5 text-xs bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            {captionLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                ✨ Auto Caption
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EDITOR COLUMN */}
        <div className="space-y-4">
          {/* Slide Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {slides.map((slide, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  activeSlide === i
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {i + 1} {slide.template}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Edit: {currentSlide.template}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600">Title</label>
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={(e) => updateSlide(activeSlide, { title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1"
                />
              </div>

              {(currentSlide.template === 'cover' || currentSlide.template === 'kronologi' || currentSlide.template === 'standar' || currentSlide.template === 'cta') && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <textarea
                    value={currentSlide.description}
                    onChange={(e) => updateSlide(activeSlide, { description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1"
                    rows={2}
                  />
                </div>
              )}

              {/* TL;DR Cards */}
              {currentSlide.template === 'tldr' && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Cards</label>
                  {currentSlide.tldrCards.map((card, ci) => (
                    <div key={card.id} className="flex gap-2 mt-1">
                      <select
                        value={card.icon}
                        onChange={(e) => {
                          const c = [...currentSlide.tldrCards];
                          c[ci] = { ...card, icon: e.target.value };
                          updateSlide(activeSlide, { tldrCards: c });
                        }}
                        className="px-2 py-2 border border-slate-300 rounded-lg"
                      >
                        {TEMPLATE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                      </select>
                      <input
                        type="text"
                        value={card.text}
                        onChange={(e) => {
                          const c = [...currentSlide.tldrCards];
                          c[ci] = { ...card, text: e.target.value };
                          updateSlide(activeSlide, { tldrCards: c });
                        }}
                        placeholder={`Point ${ci + 1}`}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* Metrics */}
              {currentSlide.template === 'data' && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Metrics</label>
                  {currentSlide.metrics.map((m, mi) => (
                    <div key={m.id} className="grid grid-cols-4 gap-2 mt-1">
                      <input
                        type="text" value={m.label}
                        onChange={(e) => {
                          const n = [...currentSlide.metrics];
                          n[mi] = { ...m, label: e.target.value };
                          updateSlide(activeSlide, { metrics: n });
                        }}
                        placeholder="Label"
                        className="px-2 py-2 border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text" value={m.value}
                        onChange={(e) => {
                          const n = [...currentSlide.metrics];
                          n[mi] = { ...m, value: e.target.value };
                          updateSlide(activeSlide, { metrics: n });
                        }}
                        placeholder="Value"
                        className="px-2 py-2 border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text" value={m.caption}
                        onChange={(e) => {
                          const n = [...currentSlide.metrics];
                          n[mi] = { ...m, caption: e.target.value };
                          updateSlide(activeSlide, { metrics: n });
                        }}
                        placeholder="Caption"
                        className="px-2 py-2 border border-slate-300 rounded-lg"
                      />
                      <select
                        value={m.tone}
                        onChange={(e) => {
                          const n = [...currentSlide.metrics];
                          n[mi] = { ...m, tone: e.target.value as 'amber' | 'sage' };
                          updateSlide(activeSlide, { metrics: n });
                        }}
                        className="px-2 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="amber">Amber</option>
                        <option value="sage">Sage</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Bullets (Pros/Cons) */}
              {(currentSlide.template === 'pros' || currentSlide.template === 'cons') && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Bullets</label>
                  {currentSlide.bullets.map((b, bi) => (
                    <div key={b.id} className="flex gap-2 mt-1">
                      <select
                        value={b.icon}
                        onChange={(e) => {
                          const n = [...currentSlide.bullets];
                          n[bi] = { ...b, icon: e.target.value };
                          updateSlide(activeSlide, { bullets: n });
                        }}
                        className="px-2 py-2 border border-slate-300 rounded-lg"
                      >
                        {TEMPLATE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                      </select>
                      <input
                        type="text" value={b.text}
                        onChange={(e) => {
                          const n = [...currentSlide.bullets];
                          n[bi] = { ...b, text: e.target.value };
                          updateSlide(activeSlide, { bullets: n });
                        }}
                        placeholder={`Point ${bi + 1}`}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-600">Icon</label>
                <select
                  value={currentSlide.icon}
                  onChange={(e) => updateSlide(activeSlide, { icon: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1"
                >
                  {TEMPLATE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </div>

              {currentSlide.template === 'kronologi' && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Source</label>
                  <input
                    type="text"
                    value={currentSlide.source}
                    onChange={(e) => updateSlide(activeSlide, { source: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Preview</h3>
          <div className="flex justify-center">
            <TemplateRenderer
              template={currentSlide.template}
              handle="@sahamfyp"
              badgeText={ticker || 'MANUAL'}
              badgeBgColor={PALETTE.navy}
              badgeTextColor="#FFFFFF"
              textColor={PALETTE.navy}
              accentColor={PALETTE.amber}
              bgColor={PALETTE.cream}
              title={currentSlide.title}
              description={currentSlide.description}
              source={currentSlide.source}
              disclaimer={currentSlide.disclaimer}
              visualMode="icon"
              visualIcon={currentSlide.icon}
              illustrationUrl={null}
              tldrCards={currentSlide.tldrCards}
              metrics={currentSlide.metrics}
              bullets={currentSlide.bullets}
              slideIndex={activeSlide}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
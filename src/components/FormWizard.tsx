// ============================================================
// Form Wizard — Phase 5
// Multi-step wizard untuk edit naskah carousel
// Step 1: Review scraped content + classification
// Step 2: Review enrichment data
// Step 3: Edit naskah per slide (8 slide)
// Step 4: Preview & download
// ============================================================

import React, { useState, useCallback, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import TemplateRenderer, { PALETTE, type TemplateId, type CardItem, type MetricCard } from '../Templates';
import { generateAllSlides, downloadAllImages } from '../services/imageGenerator';
import { publishToInstagram, isReplizConfigured } from '../services/repliz';
import { generateInstagramCaption } from '../services/gemini';
import { contentLogsApi, generatedPostsApi, postImagesApi } from '../services/supabase';
import type { CarouselData, SlideData } from '../types';

// ================= ICONS =================
const ICON_OPTIONS = [
  'ArrowLeftRight', 'ArrowRight', 'AlertTriangle', 'BadgePercent', 'BarChart3',
  'ChartNoAxesCombined', 'CheckCircle2', 'Coins', 'DollarSign', 'Eye', 'Flame',
  'Gauge', 'Globe', 'Handshake', 'MessageCircle', 'Pickaxe', 'Rocket', 'Scale',
  'Sparkles', 'ThumbsUp', 'TrendingUp', 'Wallet',
];

const uid = () => Math.random().toString(36).slice(2, 10);

// ================= TYPES =================
export interface FormWizardProps {
  carouselData: CarouselData;
  scrapedContent: { title: string; content: string; source: string };
  classification: { category: string; ticker: string | null; sector: string | null; confidence: number };
  enrichmentData: Record<string, any>;
  onComplete?: (data: CarouselData) => void;
}

type Step = 1 | 2 | 3 | 4;

// ================= MAIN COMPONENT =================
export default function FormWizard(props: FormWizardProps) {
  const { carouselData, scrapedContent, classification, enrichmentData } = props;

  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<CarouselData>(carouselData);
  const [activeSlide, setActiveSlide] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [caption, setCaption] = useState('');
  const [captionLoading, setCaptionLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Update a slide field
  const updateSlide = useCallback((slideIndex: number, updates: Partial<SlideData>) => {
    setData(prev => {
      const newSlides = [...prev.slides];
      newSlides[slideIndex] = { ...newSlides[slideIndex], ...updates };
      return { ...prev, slides: newSlides };
    });
  }, []);

  // Update global field (handle, badgeText, colors)
  const updateGlobal = useCallback((updates: Partial<CarouselData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  // Download all 8 slides as PNG using imageGenerator service
  const handleDownloadAll = useCallback(async () => {
    setDownloading(true);
    setDownloadProgress(0);
    try {
      const images = await generateAllSlides(data, (current, total) => {
        setDownloadProgress(Math.round((current / total) * 100));
      });
      await downloadAllImages(images, 'sahamfyp');
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  }, [data]);

  // Publish to Instagram via Repliz
  // Auto generate caption via Gemini
  const handleAutoCaption = useCallback(async () => {
    setCaptionLoading(true);
    setPublishResult(null);
    try {
      const firstSlide = data.slides[0];
      const tldrSlide = data.slides[1];
      const dataSlide = data.slides[3];
      const prosSlide = data.slides[4];

      const captionText = await generateInstagramCaption({
        handle: data.handle,
        badgeText: data.badgeText,
        title: firstSlide.title || 'Berita Saham',
        description: firstSlide.description || '',
        source: firstSlide.source || '',
        category: classification.ticker || undefined,
        tldrCards: (tldrSlide?.tldrCards || []).map(c => c.text).filter(Boolean),
        metrics: (dataSlide?.metrics || []).map(m => ({ label: m.label, value: m.value })),
        bullets: (prosSlide?.bullets || []).map(b => b.text).filter(Boolean),
      });
      setCaption(captionText);
      setPublishResult({ success: true, message: 'Caption auto-generated! Silahkan review dan edit jika perlu.' });
    } catch (err) {
      setPublishResult({ success: false, message: `Gagal generate caption: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setCaptionLoading(false);
    }
  }, [data, classification.ticker]);

  const handlePublish = useCallback(async () => {
    if (!caption.trim()) {
      setPublishResult({ success: false, message: 'Caption tidak boleh kosong' });
      return;
    }
    setPublishing(true);
    setPublishResult(null);
    try {
      // Generate all 8 slide images
      const images = await generateAllSlides(data);
      if (images.length === 0) {
        setPublishResult({ success: false, message: 'Gagal generate gambar' });
        return;
      }
      // Get all image URLs for carousel
      const imageUrls = images.map(img => img.dataUrl);
      if (imageUrls.length === 0) {
        setPublishResult({ success: false, message: 'Gagal mengambil gambar' });
        return;
      }
      const result = await publishToInstagram({
        images: imageUrls,
        caption: caption,
      });
      if (result.success) {
        // Save post to Supabase
        try {
          const post = await generatedPostsApi.create({
            handle: data.handle,
            badge_text: data.badgeText,
            badge_bg_color: data.badgeBgColor,
            badge_text_color: data.badgeTextColor,
            slides_json: data.slides,
            total_slides: 8,
            schedule_id: result.scheduleId,
            instagram_status: 'scheduled',
            permalink: result.url || '',
          });
          // Save images to Supabase if Cloudinary results available
          if (result.cloudinaryResults && result.cloudinaryResults.length > 0 && post) {
            const imageRecords = result.cloudinaryResults.map((img, idx) => ({
              post_id: post.id,
              slide_number: idx + 1,
              template_type: data.slides[idx]?.template || 'unknown',
              cloudinary_url: img.secure_url,
              cloudinary_public_id: img.public_id,
              width: 800,
              height: 1000,
              file_size: img.bytes,
            }));
            await postImagesApi.createBatch(imageRecords);
          }
        } catch (dbError) {
          console.error('Failed to save to Supabase:', dbError);
        }
        setPublishResult({ success: true, message: `Berhasil dijadwalkan! Schedule ID: ${result.scheduleId}` });
      } else {
        setPublishResult({ success: false, message: result.error || 'Gagal publish' });
      }
    } catch (err) {
      setPublishResult({ success: false, message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setPublishing(false);
    }
  }, [data, caption, classification.ticker]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">📝 Form Wizard — Edit Naskah</h1>
          <StepIndicator step={step} setStep={setStep} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {step === 1 && (
          <Step1Review scraped={scrapedContent} classification={classification} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2Enrichment data={enrichmentData} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <Step3Edit
            data={data}
            activeSlide={activeSlide}
            setActiveSlide={setActiveSlide}
            updateSlide={updateSlide}
            updateGlobal={updateGlobal}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Step4Preview
            data={data}
            previewRef={previewRef}
            downloading={downloading}
            downloadProgress={downloadProgress}
            onDownload={handleDownloadAll}
            onBack={() => setStep(3)}
            caption={caption}
            onCaptionChange={setCaption}
            captionLoading={captionLoading}
            onAutoCaption={handleAutoCaption}
            publishing={publishing}
            publishResult={publishResult}
            onPublish={handlePublish}
            replizConfigured={isReplizConfigured()}
          />
        )}
      </main>
    </div>
  );
}


// ================= STEP INDICATOR =================
function StepIndicator({ step, setStep }: { step: Step; setStep: (s: Step) => void }) {
  const steps = [
    { n: 1, label: 'Review' },
    { n: 2, label: 'Data' },
    { n: 3, label: 'Edit' },
    { n: 4, label: 'Preview' },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <button
            onClick={() => setStep(s.n as Step)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              step === s.n
                ? 'bg-amber-500 text-white'
                : step > s.n
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              {step > s.n ? '✓' : s.n}
            </span>
            {s.label}
          </button>
          {i < steps.length - 1 && <div className="w-4 h-px bg-slate-300" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ================= STEP 1: REVIEW =================
function Step1Review({
  scraped,
  classification,
  onNext,
}: {
  scraped: { title: string; content: string; source: string };
  classification: { category: string; ticker: string | null; sector: string | null; confidence: number };
  onNext: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Step 1: Review Hasil Scraping & Klasifikasi</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Judul Berita</label>
            <p className="text-sm text-slate-800 mt-1">{scraped.title}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Isi Berita</label>
            <p className="text-sm text-slate-700 mt-1 max-h-40 overflow-y-auto">{scraped.content}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sumber</label>
            <p className="text-sm text-slate-600 mt-1">{scraped.source}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Hasil Klasifikasi</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-xs text-slate-500">Kategori</span>
            <p className="text-sm font-semibold text-slate-800">{classification.category}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-xs text-slate-500">Ticker</span>
            <p className="text-sm font-semibold text-slate-800">{classification.ticker || '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-xs text-slate-500">Sektor</span>
            <p className="text-sm font-semibold text-slate-800">{classification.sector || '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <span className="text-xs text-slate-500">Confidence</span>
            <p className="text-sm font-semibold text-slate-800">{(classification.confidence * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition"
      >
        Lanjut ke Data Enrichment →
      </button>
    </div>
  );
}


// ================= STEP 2: ENRICHMENT DATA =================
function Step2Enrichment({
  data,
  onNext,
  onBack,
}: {
  data: Record<string, any>;
  onNext: () => void;
  onBack: () => void;
}) {
  const entries = Object.entries(data);
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Step 2: Data Enrichment dari Sectors.app</h2>
        <p className="text-sm text-slate-600 mb-4">Data berikut akan dipakai untuk mengisi slide naskah. Pastikan data benar sebelum lanjut.</p>
        
        {entries.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>Tidak ada data enrichment (IPO baru / SKIP)</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(([key, value]) => (
              <div key={key} className="bg-slate-50 rounded-xl p-4">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{key}</span>
                <pre className="text-xs text-slate-700 mt-2 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition"
        >
          ← Kembali
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition"
        >
          Lanjut Edit Naskah →
        </button>
      </div>
    </div>
  );
}


// ================= STEP 3: EDIT NASKAH =================
function Step3Edit({
  data,
  activeSlide,
  setActiveSlide,
  updateSlide,
  updateGlobal,
  onNext,
  onBack,
}: {
  data: CarouselData;
  activeSlide: number;
  setActiveSlide: (i: number) => void;
  updateSlide: (i: number, u: Partial<SlideData>) => void;
  updateGlobal: (u: Partial<CarouselData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const slide = data.slides[activeSlide];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Editor */}
      <div className="space-y-4">
        {/* Global Settings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Pengaturan Global</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">Handle</label>
              <input
                type="text"
                value={data.handle}
                onChange={e => updateGlobal({ handle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Badge Text</label>
              <input
                type="text"
                value={data.badgeText}
                onChange={e => updateGlobal({ badgeText: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Slide Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Pilih Slide</h3>
          <div className="flex gap-2 flex-wrap">
            {data.slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeSlide === i
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {i + 1}. {s.template}
              </button>
            ))}
          </div>
        </div>

        {/* Slide Editor */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-3">
            Edit Slide {activeSlide + 1}: {slide.template}
          </h3>
          <SlideEditor slide={slide} onChange={u => updateSlide(activeSlide, u)} />
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition"
          >
            ← Kembali
          </button>
          <button
            onClick={onNext}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Preview & Download →
          </button>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="flex flex-col items-center sticky top-20">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Live Preview — Slide {activeSlide + 1}/8
        </span>
        <TemplateRenderer {...(buildRenderProps(data, activeSlide) as any)} />
      </div>
    </div>
  );
}


// ================= SLIDE EDITOR =================
function SlideEditor({ slide, onChange }: { slide: SlideData; onChange: (u: Partial<SlideData>) => void }) {
  const template = slide.template;

  const TextField = ({ label, value, field }: { label: string; value: string; field: keyof SlideData }) => (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange({ [field]: e.target.value })}
        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg mt-1"
      />
    </div>
  );

  const IconPicker = ({ value, field }: { value: string; field: keyof SlideData }) => (
    <div>
      <label className="text-xs text-slate-500">Pilih Icon</label>
      <div className="flex flex-wrap gap-1.5 mt-1 max-h-32 overflow-auto p-2 border border-slate-200 rounded-lg">
        {ICON_OPTIONS.map((name) => {
          const IconComp = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
          const isSelected = (value || 'TrendingUp') === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange({ [field]: name })}
              className={`p-2 rounded-lg border transition ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              title={name}
            >
              {IconComp && <IconComp size={18} />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const VisualModeToggle = () => (
    <div>
      <label className="text-xs text-slate-500">Mode Visual</label>
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={() => onChange({ visualMode: 'icon' })}
          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition ${
            (slide.visualMode || 'icon') === 'icon'
              ? 'border-amber-500 bg-amber-50 text-amber-700'
              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
          }`}
        >
          Icon
        </button>
        <button
          type="button"
          onClick={() => onChange({ visualMode: 'image' })}
          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition ${
            slide.visualMode === 'image'
              ? 'border-amber-500 bg-amber-50 text-amber-700'
              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
          }`}
        >
          Gambar
        </button>
      </div>
    </div>
  );

  const ImageUrlInput = () => (
    <div>
      <label className="text-xs text-slate-500">URL Gambar</label>
      <input
        type="text"
        value={slide.illustrationUrl || ''}
        onChange={e => onChange({ illustrationUrl: e.target.value })}
        placeholder="https://example.com/image.jpg"
        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg mt-1"
      />
    </div>
  );

  const ColorPicker = ({ value, field }: { value: string; field: keyof SlideData }) => (
    <div>
      <label className="text-xs text-slate-500">Accent</label>
      <div className="flex gap-2 mt-1">
        {['#F2A93B', '#4CAF7D', '#E4572E', '#14182B', '#F5F1E7'].map(c => (
          <button
            key={c}
            onClick={() => onChange({ [field]: c })}
            className={`w-8 h-8 rounded-full border-2 ${value === c ? 'border-slate-800' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <TextField label="Title" value={slide.title} field="title" />

      {(template === 'cover' || template === 'kronologi' || template === 'standar' || template === 'cta') && (
        <div>
          <label className="text-xs text-slate-500">Description</label>
          <textarea
            value={slide.description || ''}
            onChange={e => onChange({ description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg mt-1"
          />
        </div>
      )}

      {template === 'standar' && (
        <TextField label="Source" value={slide.source || ''} field="source" />
      )}

      {template === 'cta' && (
        <TextField label="Disclaimer" value={slide.disclaimer || ''} field="disclaimer" />
      )}

      {(template === 'cover' || template === 'kronologi' || template === 'standar' || template === 'cta') && (
        <VisualModeToggle />
      )}

      {(template === 'cover' || template === 'kronologi' || template === 'standar' || template === 'cta') && (
        slide.visualMode === 'image' ? (
          <ImageUrlInput />
        ) : (
          <IconPicker value={slide.visualIcon || ''} field="visualIcon" />
        )
      )}

      <ColorPicker value={slide.accent || '#F2A93B'} field="accent" />

      {template === 'tldr' && (
        <ArrayEditor
          label="TL;DR Cards"
          items={slide.tldrCards || []}
          onChange={items => onChange({ tldrCards: items })}
          defaultIcon="CheckCircle2"
        />
      )}

      {template === 'data' && (
        <MetricsEditor
          items={slide.metrics || []}
          onChange={items => onChange({ metrics: items })}
        />
      )}

      {(template === 'pros' || template === 'cons') && (
        <ArrayEditor
          label={template === 'pros' ? 'Pros Bullets' : 'Cons Bullets'}
          items={slide.bullets || []}
          onChange={items => onChange({ bullets: items })}
          defaultIcon={template === 'pros' ? 'CheckCircle2' : 'AlertTriangle'}
        />
      )}
    </div>
  );
}


// ================= ARRAY EDITOR (tldrCards, bullets) =================
function ArrayEditor({
  label,
  items,
  onChange,
  defaultIcon,
}: {
  label: string;
  items: CardItem[];
  onChange: (items: CardItem[]) => void;
  defaultIcon: string;
}) {
  const addItem = () => {
    onChange([...items, { id: uid(), icon: defaultIcon, text: 'Item baru' }]);
  };

  const updateItem = (id: string, updates: Partial<CardItem>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <div className="space-y-2 mt-1">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <select
              value={item.icon}
              onChange={e => updateItem(item.id, { icon: e.target.value })}
              className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
            >
              {ICON_OPTIONS.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
            <input
              type="text"
              value={item.text}
              onChange={e => updateItem(item.id, { text: e.target.value })}
              className="flex-1 px-2 py-1.5 text-sm border border-slate-300 rounded-lg"
            />
            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-lg border text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              <LucideIcons.Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full px-3 py-2 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1"
        >
          <LucideIcons.Plus size={14} /> Tambah
        </button>
      </div>
    </div>
  );
}

// ================= METRICS EDITOR =================
function MetricsEditor({
  items,
  onChange,
}: {
  items: MetricCard[];
  onChange: (items: MetricCard[]) => void;
}) {
  const addItem = () => {
    onChange([...items, { id: uid(), icon: 'BarChart3', label: 'Label', value: 'Value', caption: 'Caption', tone: 'amber' }]);
  };

  const updateItem = (id: string, updates: Partial<MetricCard>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div>
      <label className="text-xs text-slate-500">Metrics</label>
      <div className="space-y-2 mt-1">
        {items.map(item => (
          <div key={item.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={item.icon}
                onChange={e => updateItem(item.id, { icon: e.target.value })}
                className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <select
                value={item.tone}
                onChange={e => updateItem(item.id, { tone: e.target.value as 'amber' | 'sage' })}
                className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
              >
                <option value="amber">Amber</option>
                <option value="sage">Sage</option>
              </select>
              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 rounded-lg border text-slate-400 hover:bg-red-50 hover:text-red-500 ml-auto"
              >
                <LucideIcons.Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" value={item.label} onChange={e => updateItem(item.id, { label: e.target.value })} placeholder="Label" className="px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
              <input type="text" value={item.value} onChange={e => updateItem(item.id, { value: e.target.value })} placeholder="Value" className="px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
              <input type="text" value={item.caption} onChange={e => updateItem(item.id, { caption: e.target.value })} placeholder="Caption" className="px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full px-3 py-2 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1"
        >
          <LucideIcons.Plus size={14} /> Tambah Metric
        </button>
      </div>
    </div>
  );
}


// ================= BUILD RENDER PROPS =================
function buildRenderProps(data: CarouselData, slideIndex: number) {
  const slide = data.slides[slideIndex];
  return {
    template: slide.template,
    handle: data.handle,
    badgeText: data.badgeText,
    badgeBgColor: data.badgeBgColor,
    badgeTextColor: data.badgeTextColor,
    textColor: data.textColor,
    accentColor: slide.accent || '#F2A93B',
    bgColor: data.bgColor,
    title: slide.title,
    description: slide.description || '',
    source: slide.source || '',
    disclaimer: slide.disclaimer || '',
    visualMode: slide.visualMode || 'icon',
    visualIcon: slide.visualIcon || 'TrendingUp',
    illustrationUrl: slide.illustrationUrl || null,
    tldrCards: slide.tldrCards || [],
    metrics: slide.metrics || [],
    bullets: slide.bullets || [],
    slideIndex,
  };
}

// ================= STEP 4: PREVIEW & DOWNLOAD =================
function Step4Preview({
  data,
  previewRef,
  downloading,
  downloadProgress,
  onDownload,
  onBack,
  caption,
  onCaptionChange,
  captionLoading,
  onAutoCaption,
  publishing,
  publishResult,
  onPublish,
  replizConfigured,
}: {
  data: CarouselData;
  previewRef: React.RefObject<HTMLDivElement>;
  downloading: boolean;
  downloadProgress: number;
  onDownload: () => void;
  onBack: () => void;
  caption: string;
  onCaptionChange: (caption: string) => void;
  captionLoading: boolean;
  onAutoCaption: () => void;
  publishing: boolean;
  publishResult: { success: boolean; message: string } | null;
  onPublish: () => void;
  replizConfigured: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Step 4: Preview & Download</h2>
        <p className="text-sm text-slate-600 mb-4">Preview semua 8 slide. Klik download untuk mengunduh semua slide sebagai PNG.</p>
        
        {/* All Slides Preview */}
        <div ref={previewRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.slides.map((_, i) => (
            <div key={i} data-slide className="flex flex-col items-center">
              <span className="text-xs text-slate-500 mb-1">Slide {i + 1}</span>
              <div className="transform scale-[0.4] origin-top">
                <TemplateRenderer {...(buildRenderProps(data, i) as any)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Progress */}
      {downloading && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Generating images...</span>
            <span className="text-sm font-bold text-amber-600">{downloadProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Download Button */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition"
        >
          ← Edit Lagi
        </button>
        <button
          onClick={onDownload}
          disabled={downloading}
          className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <LucideIcons.Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <LucideIcons.Download size={18} />
              Download 8 PNG
            </>
          )}
        </button>
      </div>

      {/* Publish to Instagram */}
      {replizConfigured && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">📱 Publish ke Instagram</h3>
          <p className="text-sm text-slate-600 mb-4">Tulis caption untuk post Instagram. Semua 8 slide akan dijadikan carousel.</p>
          
          <textarea
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Tulis caption Instagram di sini...&#10;&#10;Contoh: 📈 Saham BBCA menunjukkan performa positif!&#10;&#10;#saham #investasi #BBCA"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={5}
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">{caption.length}/2200 karakter</span>
            <button
              onClick={onAutoCaption}
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
                  ✨
                  Auto Caption
                </>
              )}
            </button>
          </div>
          
          {publishResult && (
            <div className={`mt-3 px-4 py-2 rounded-lg text-sm ${publishResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {publishResult.message}
            </div>
          )}
          
          <button
            onClick={onPublish}
            disabled={publishing || !caption.trim()}
            className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {publishing ? (
              <>
                <LucideIcons.Loader2 size={18} className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <LucideIcons.Send size={18} />
                Publish ke Instagram
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

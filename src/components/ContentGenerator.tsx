// ============================================================
// Content Generator Page - Phase 1
// Wrapper for existing FormWizard functionality
// ============================================================

import React, { useState } from 'react';
import FormWizard from './FormWizard';
import type { CarouselData } from '../types';

export default function ContentGenerator() {
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scraped, setScraped] = useState<{ title: string; content: string } | null>(null);
  const [classification, setClassification] = useState<{ category: string; ticker: string | null; sector: string | null; confidence: number; reason: string } | null>(null);
  const [enrichmentData, setEnrichmentData] = useState<{ data: Record<string, any> } | null>(null);

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Dynamic import to avoid circular dependencies
      const { scrapeUrl } = await import('../services/scraper');
      const { classifyContent } = await import('../services/llm');
      const { enrichClassification } = await import('../services/enrichment');
      const { generateNaskah } = await import('../services/naskahGenerator');

      // Step 1: Scrape
      const scrapedResult = await scrapeUrl(url);
      if (!scrapedResult) throw new Error('Failed to scrape URL');
      setScraped(scrapedResult);

      // Step 2: Classify
      const classificationResult = await classifyContent(scrapedResult.title, scrapedResult.content);
      setClassification(classificationResult);

      if (classificationResult.category === "SKIP") {
        setError("Berita tidak relevan untuk konten @sahamfyp");
        return;
      }

      // Step 3: Enrich
      const enrichmentResult = await enrichClassification(classificationResult);
      setEnrichmentData(enrichmentResult);

      // Step 4: Generate Naskah
      const naskah = await generateNaskah({
        category: classificationResult.category,
        title: scrapedResult.title,
        content: scrapedResult.content,
        enrichmentData: enrichmentResult.data,
        ticker: classificationResult.ticker,
        image: scrapedResult.image,
        siteName: scrapedResult.siteName,
      });

      setCarouselData(naskah);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (carouselData) {
    return (
      <div>
        <button
          onClick={() => setCarouselData(null)}
          className="mb-4 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 flex items-center gap-2"
        >
          ← Back to Generator
        </button>
        <FormWizard
          carouselData={carouselData}
          scrapedContent={{ title: scraped?.title || '', content: scraped?.content || '', source: url }}
          classification={{ category: classification?.category || '', ticker: classification?.ticker || null, sector: classification?.sector || null, confidence: classification?.confidence || 0 }}
          enrichmentData={enrichmentData?.data || {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <span>📝</span> Content Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate naskah carousel otomatis dari tautan berita saham (Scraping + LLM).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 max-w-3xl">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              URL Berita Saham
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.cnbcindonesia.com/market/..."
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition shadow-2xs"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-5 py-3 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-rose-500/20 transition cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses & Men-generate Naskah...</span>
              </>
            ) : (
              <>
                <span>✍️</span>
                <span>Generate Naskah Carousel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
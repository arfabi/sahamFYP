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
      const { classifyContent } = await import('../services/gemini');
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📝 Content Generator</h1>
        <p className="text-sm text-slate-500 mt-1">Generate carousel dari berita saham</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">URL Berita Saham</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.cnbcindonesia.com/market/..."
              className="w-full mt-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-semibold rounded-xl transition"
          >
            {loading ? 'Generating...' : '✍️ Generate Naskah'}
          </button>
        </div>
      </div>
    </div>
  );
}
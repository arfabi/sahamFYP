import React, { useState } from "react";
import CardGenerator from "./CardGenerator";
import FormWizard from "./components/FormWizard";
import { scrapeUrl, classifyContent, enrichClassification, generateNaskah } from "./services";
import type { CarouselData } from "./types";

type AppMode = "generator" | "wizard";

export default function App() {
  const [mode, setMode] = useState<AppMode>("generator");
  const [wizardData, setWizardData] = useState<{
    carousel: CarouselData;
    scraped: { title: string; content: string; source: string };
    classification: { category: string; ticker: string | null; sector: string | null; confidence: number };
    enrichment: Record<string, any>;
  } | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle "Generate Naskah" action
  const handleStartWizard = async (url: string) => {
    if (!url.trim()) {
      alert("Masukkan URL berita terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Scrape
      console.log("📡 Scraping:", url);
      const scraped = await scrapeUrl(url);
      console.log("✅ Scraped:", scraped.title);
      
      // Step 2: Classify
      console.log("🤖 Classifying...");
      const classification = await classifyContent(scraped.title, scraped.content);
      console.log("✅ Category:", classification.category);
      
      if (classification.category === "SKIP") {
        alert("Berita tidak relevan untuk konten @sahamfyp");
        return;
      }
      
      // Step 3: Enrich
      console.log("📊 Enriching data...");
      const enrichment = await enrichClassification(classification);
      console.log("✅ Enrichment credits:", enrichment.creditsUsed);
      
      // Step 4: Generate Naskah
      console.log("✍️ Generating naskah...");
      const carousel = await generateNaskah({
        category: classification.category,
        title: scraped.title,
        content: scraped.content,
        enrichmentData: enrichment.data,
        ticker: classification.ticker,
      });
      console.log("✅ Naskah generated:", carousel.slides.length, "slides");
      
      setWizardData({
        carousel,
        scraped: { title: scraped.title, content: scraped.content, source: scraped.siteName || url },
        classification: {
          category: classification.category,
          ticker: classification.ticker,
          sector: classification.sector,
          confidence: classification.confidence,
        },
        enrichment: enrichment.data,
      });
      setMode("wizard");
    } catch (error) {
      console.error("Error starting wizard:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Wizard mode
  if (mode === "wizard" && wizardData) {
    return (
      <FormWizard
        carouselData={wizardData.carousel}
        scrapedContent={wizardData.scraped}
        classification={wizardData.classification}
        enrichmentData={wizardData.enrichment}
        onComplete={() => setMode("generator")}
      />
    );
  }

  // Generator mode (default)
  return (
    <div className="min-h-screen bg-slate-50">
      {/* URL Input Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800 mb-3">📰 SahamFYP — Generator Konten</h1>
          <div className="flex gap-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste URL berita saham (contoh: https://www.cnbcindonesia.com/market/...)"
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleStartWizard(urlInput)}
            />
            <button
              onClick={() => handleStartWizard(urlInput)}
              disabled={loading || !urlInput.trim()}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center gap-2 text-sm whitespace-nowrap"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  ✍️ Generate Naskah
                </>
              )}
            </button>
          </div>
          {loading && (
            <div className="mt-2 text-xs text-slate-500">
              Scraping → Classifying → Enriching → Generating Naskah...
            </div>
          )}
        </div>
      </div>

      {/* Card Generator */}
      <CardGenerator />
    </div>
  );
}
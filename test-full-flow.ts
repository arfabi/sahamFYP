// Full Flow Test: Scrape -> Classify -> Enrich -> Generate Naskah
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface ScrapedContent {
  url: string; title: string; content: string; siteName?: string;
}

interface ClassificationResult {
  category: string; ticker: string | null; sector: string | null;
  confidence: number; reason: string;
}

interface EnrichmentResult {
  category: string; ticker: string | null; sector: string | null;
  data: Record<string, any>; creditsUsed: number; errors: string[];
  fetchedAt: string;
}

interface SlideData {
  template: string; title: string; description?: string;
  source?: string; disclaimer?: string; visualIcon?: string;
  tldrCards?: Array<{ icon: string; text: string }>;
  metrics?: Array<{ icon: string; label: string; value: string; caption: string; tone: string }>;
  bullets?: Array<{ icon: string; text: string }>;
}

interface CarouselData {
  handle: string; badgeText: string; slides: SlideData[];
}

// ==================== SCRAPE ====================
async function scrapeUrl(url: string): Promise<ScrapedContent> {
  const endpoint = 'http://localhost:3000/api/scrape';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// ==================== CLASSIFY ====================
async function classifyContent(title: string, content: string): Promise<ClassificationResult> {
  const prompt = `
Kamu adalah AI News Classifier untuk sistem otomasi konten @sahamfyp.
Tugasmu adalah membaca judul + isi berita, lalu menentukan SATU kategori paling tepat dari 6 kategori resmi:
[SINGLE_STOCK, MACRO_ECONOMY, SECTOR_ANALYSIS, CORPORATE_ACTION, IPO_RIGHTS_ISSUE, SUSPENSION_DELISTING, SKIP].
Berikan output Wajib JSON valid, tanpa markdown tambahan.

Format JSON yang diminta:
{
  "category": "KATEGORI",
  "ticker": "KODE / null",
  "sector": "SEKTOR / null",
  "confidence": 0.0,
  "reason": "Alasan singkat 1-2 kalimat."
}

---
DATA BERITA YANG HARUS DIKLASIFIKASIKAN:
- Judul: ${title}
- Isi: ${content.slice(0, 3000)}
`;
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!response.ok) throw new Error(`Gemini API error: ${await response.text()}`);
  const data = await response.json();
  const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
// ==================== ENRICH ====================
async function enrichClassification(classification: ClassificationResult): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    category: classification.category, ticker: classification.ticker,
    sector: classification.sector, data: {}, creditsUsed: 0,
    errors: [], fetchedAt: new Date().toISOString(),
  };
  if (classification.category === 'SKIP') return result;
  if (classification.ticker) {
    try {
      const sectorsUrl = `https://api.sectors.app/v2/company/report/${classification.ticker}/?sections=overview`;
      const resp = await fetch(sectorsUrl, {
        headers: { 'Authorization': process.env.VITE_SECTORS_API_KEY || '' },
      });
      if (resp.ok) { result.data.companyReport = await resp.json(); result.creditsUsed += 1; }
    } catch (e: any) { result.errors.push(`companyReport: ${e.message}`); }
  }
  return result;
// ==================== GENERATE NASKAH ====================
async function generateNaskah(params: {
  category: string; title: string; content: string;
  enrichmentData: Record<string, any>; ticker: string | null;
}): Promise<CarouselData> {
  const { category, title, content, enrichmentData, ticker } = params;
  const enrichmentJson = JSON.stringify(enrichmentData, null, 2).slice(0, 2000);
  const prompt = `
Kamu adalah AI Naskah Generator untuk @sahamfyp (Instagram carousel tentang saham Indonesia).
Tugasmu adalah membuat konten carousel 8 slide berdasarkan berita dan data yang diberikan.

## ATURAN WAJIB
1. SEMUA data harus BERDASARKAN berita dan data enrichment yang diberikan. JANGAN MENGADA-NGIKAT.
2. Format setiap point: "Point: Explanation" (contoh: "Naik 5%: Harga naik 5% dalam sehari")
3. Gunakan bahasa Indonesia yang informatif dan engaging
4. Slide terakhir WAJIB berisi disclaimer DYOR (Do Your Own Research)
5. Output WAJIB JSON valid sesuai schema di bawah

## DATA BERITA
- Judul: ${title}
- Isi: ${content.slice(0, 4000)}
- Kategori: ${category}
- Ticker: ${ticker || 'N/A'}

## DATA ENRICHMENT (dari Sectors.app)
${enrichmentJson}

## OUTPUT SCHEMA (JSON)
{
  "handle": "@sahamfyp",
  "badgeText": "SAHAMFYP",
  "slides": [
    { "template": "cover", "title": "...", "description": "...", "visualIcon": "TrendingUp" },
    { "template": "tldr", "title": "...", "tldrCards": [{ "icon": "...", "text": "..." }] },
    { "template": "kronologi", "title": "...", "bullets": [{ "icon": "...", "text": "..." }] },
    { "template": "data", "title": "...", "metrics": [{ "icon": "...", "label": "...", "value": "...", "caption": "...", "tone": "amber" }] },
    { "template": "pros", "title": "...", "bullets": [{ "icon": "...", "text": "..." }] },
    { "template": "cons", "title": "...", "bullets": [{ "icon": "...", "text": "..." }] },
    { "template": "standar", "title": "...", "description": "...", "bullets": [{ "icon": "...", "text": "..." }] },
    { "template": "cta", "title": "...", "description": "...", "disclaimer": "Do Your Own Research. Bukan ajakan beli/jual." }
  ]
}

Pilih visualIcon dari: TrendingUp, BarChart3, DollarSign, Globe, AlertTriangle, Rocket, Scale, Coins, ChartNoAxesCombined, Flame, Gauge, Eye, Handshake, MessageCircle, Sparkles, ThumbsUp, BadgePercent, Pickaxe, Wallet, ArrowLeftRight, CheckCircle2

Generate JSON sekarang:
`;
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!response.ok) throw new Error(`Gemini API error: ${await response.text()}`);
  const data = await response.json();
  const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawOutput) throw new Error('No response from Gemini');
  let parsed: any;
  try { parsed = JSON.parse(rawOutput); } catch {
    const match = rawOutput.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) { parsed = JSON.parse(match[1].trim()); }
    else { const jm = rawOutput.match(/\{[\s\S]*\}/); if (jm) parsed = JSON.parse(jm[0]); else throw new Error('No valid JSON'); }
// ==================== MAIN ====================
async function runFullFlow(url: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`🔗 URL: ${url}`);
  console.log('='.repeat(70));

  console.log('\n📡 Step 1: Scraping...');
  const t1 = Date.now();
  const scraped = await scrapeUrl(url);
  console.log(`   ✅ Done in ${Date.now() - t1}ms`);
  console.log(`   Title: ${scraped.title}`);
  console.log(`   Content: ${scraped.content?.length || 0} chars`);

  console.log('\n🤖 Step 2: Classifying...');
  const t2 = Date.now();
  const classification = await classifyContent(scraped.title, scraped.content);
  console.log(`   ✅ Done in ${Date.now() - t2}ms`);
  console.log(`   Category: ${classification.category}`);
  console.log(`   Ticker: ${classification.ticker || 'N/A'}`);
  console.log(`   Confidence: ${classification.confidence}`);

  console.log('\n📊 Step 3: Enriching data...');
  const t3 = Date.now();
  const enrichment = await enrichClassification(classification);
  console.log(`   ✅ Done in ${Date.now() - t3}ms`);
  console.log(`   Credits used: ${enrichment.creditsUsed}`);
  if (enrichment.errors.length > 0) console.log(`   ⚠️  Errors: ${enrichment.errors.join(', ')}`);

  console.log('\n✍️  Step 4: Generating naskah...');
  const t4 = Date.now();
  const naskah = await generateNaskah({
    category: classification.category, title: scraped.title,
    content: scraped.content, enrichmentData: enrichment.data,
    ticker: classification.ticker,
  });
  console.log(`   ✅ Done in ${Date.now() - t4}ms`);

  console.log('\n' + '='.repeat(70));
  console.log('📋 NASKAH RESULT');
  console.log('='.repeat(70));
  console.log(`Handle: ${naskah.handle}`);
  console.log(`Slides: ${naskah.slides.length}`);
  naskah.slides.forEach((slide, i) => {
    console.log(`\n--- Slide ${i + 1} (${slide.template}) ---`);
    console.log(`  Title: ${slide.title}`);
    if (slide.description) console.log(`  Desc: ${slide.description.slice(0, 100)}...`);
    if (slide.tldrCards) console.log(`  Cards: ${slide.tldrCards.length}`);
    if (slide.metrics) console.log(`  Metrics: ${slide.metrics.length}`);
    if (slide.bullets) console.log(`  Bullets: ${slide.bullets.length}`);
  });

  const fs = await import('fs');
  const outputFile = `naskah-${classification.category.toLowerCase()}-${Date.now()}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(naskah, null, 2));
  console.log(`\n💾 Saved to: ${outputFile}`);
  return naskah;
}

async function main() {
  console.log('🚀 Full Flow Test: Scrape → Classify → Enrich → Generate Naskah');
  console.log(`Model: ${GEMINI_MODEL}`);
  const url = process.argv[2] || 'https://www.cnbcindonesia.com/market';
  try {
    await runFullFlow(url);
    console.log('\n' + '='.repeat(70));
    console.log('🏁 Test completed successfully!');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

  }
  if (!parsed.slides || parsed.slides.length !== 8) throw new Error(`Invalid: expected 8 slides, got ${parsed.slides?.length}`);
  return { handle: parsed.handle || '@sahamfyp', badgeText: parsed.badgeText || 'SAHAMFYP', slides: parsed.slides };
}

}

  if (!rawOutput) throw new Error('No response from Gemini');
  return JSON.parse(rawOutput);
}

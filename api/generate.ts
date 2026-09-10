import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import { validateApiKey, parseBody } from '../_lib/auth';

// --- Gemini (self-contained) ---
function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    generationConfig: { responseMimeType: 'application/json' },
  });
}

async function classifyContent(title: string, content: string) {
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
- Isi: ${content}
`;

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const rawOutput = result.response.text();

  let jsonStr = rawOutput.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  return JSON.parse(jsonStr);
}

async function generateContentRaw(prompt: string): Promise<string> {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// --- Sectors.app client (self-contained) ---
const SECTORS_API_KEY = process.env.SECTORS_API_KEY || '';
const SECTORS_BASE = 'https://api.sectors.app/v2';

async function fetchSectors(endpoint: string, params?: Record<string, string>) {
  if (!SECTORS_API_KEY) {
    throw new Error('Sectors API key not configured');
  }

  const url = new URL(`${SECTORS_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': SECTORS_API_KEY },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sectors API error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function fetchCompanyReport(symbol: string, sections: string[] = ['overview', 'valuation', 'financials']) {
  const results: Record<string, any> = {};

  await Promise.all(
    sections.map(async (section) => {
      try {
        const data = await fetchSectors(`/stocks/${symbol}/company-report`, { section });
        results[section] = data;
      } catch (error) {
        console.warn(`Failed to fetch ${section} for ${symbol}:`, error);
        results[section] = null;
      }
    })
  );

  return results;
}

async function fetchForeignFlow(symbol: string) {
  try {
    return await fetchSectors(`/foreign-flow/${symbol}`);
  } catch (error) {
    console.warn(`Failed to fetch foreign flow for ${symbol}:`, error);
    return null;
  }
}

async function enrichByCategory(category: string, ticker: string | null) {
  if (!ticker) {
    return { category, ticker: null, data: null };
  }

  const enrichmentMap: Record<string, () => Promise<any>> = {
    SINGLE_STOCK: async () => {
      const [report, foreignFlow] = await Promise.all([
        fetchCompanyReport(ticker, ['overview', 'valuation', 'financials', 'dividend', 'ownership']),
        fetchForeignFlow(ticker),
      ]);
      return { report, foreignFlow };
    },
    MACRO_ECONOMY: async () => {
      return { note: 'Macro economy uses general market data, not ticker-specific' };
    },
    SECTOR_ANALYSIS: async () => {
      const report = await fetchCompanyReport(ticker, ['overview', 'valuation']);
      return { report };
    },
    CORPORATE_ACTION: async () => {
      const report = await fetchCompanyReport(ticker, ['overview', 'financials']);
      return { report };
    },
    IPO_RIGHTS_ISSUE: async () => {
      const report = await fetchCompanyReport(ticker, ['overview', 'valuation', 'financials']);
      return { report };
    },
    SUSPENSION_DELISTING: async () => {
      const report = await fetchCompanyReport(ticker, ['overview']);
      return { report };
    },
  };

  const enricher = enrichmentMap[category];
  if (!enricher) {
    return { category, ticker, data: null };
  }

  try {
    const data = await enricher();
    return { category, ticker, data };
  } catch (error) {
    console.error(`Enrichment failed for ${category}/${ticker}:`, error);
    return { category, ticker, data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// --- Scraper (self-contained) ---
async function scrapeUrl(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

  const contentSelectors = [
    'article', '.article-content', '.post-content', '.entry-content',
    '[itemprop="articleBody"]', '.detail__text', '.read__content', '.fck_detail', 'main',
  ];

  let content = '';
  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      element.find('script, style, nav, header, footer, aside').remove();
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }

  if (!content || content.length < 100) {
    const paragraphs: string[] = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20) paragraphs.push(text);
    });
    content = paragraphs.join('\n\n');
  }

  content = content.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n\n').substring(0, 5000);

  const author = $('[itemprop="author"]').text().trim() || $('.author').text().trim() || $('[rel="author"]').text().trim() || '';
  const image = $('meta[property="og:image"]').attr('content') || $('[itemprop="image"]').attr('content') || $('article img').first().attr('src') || '';
  const siteName = $('meta[property="og:site_name"]').attr('content') || $('meta[name="application-name"]').attr('content') || '';

  return { url, title, content, image, siteName };
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!validateApiKey(req)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, title: inputTitle, content: inputContent, category: inputCategory, ticker: inputTicker } = parseBody(req);

  try {
    // Step 1: Scrape (if URL provided)
    let title = inputTitle;
    let content = inputContent;
    let image = '';
    let siteName = '';

    if (url) {
      const scraped = await scrapeUrl(url);
      title = scraped.title;
      content = scraped.content;
      image = scraped.image;
      siteName = scraped.siteName;
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'No content to process' });
    }

    // Step 2: Classify
    const classification = await classifyContent(title, content);
    const { category, ticker } = classification;

    if (category === 'SKIP') {
      return res.status(200).json({
        skipped: true,
        reason: classification.reason,
        classification,
      });
    }

    // Step 3: Enrich
    const enrichment = await enrichByCategory(category, ticker);

    // Step 4: Generate naskah
    const naskah = await generateNaskah({
      category,
      ticker,
      title,
      content,
      image,
      siteName,
      enrichment,
    });

    return res.status(200).json({
      classification,
      enrichment,
      naskah,
      image,
      siteName,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return res.status(500).json({
      error: 'Failed to generate content',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function generateNaskah(params: {
  category: string;
  ticker: string | null;
  title: string;
  content: string;
  image: string;
  siteName: string;
  enrichment: any;
}) {
  const { category, ticker, title, content, image, siteName, enrichment } = params;

  const prompt = `
Kamu adalah AI Content Generator untuk @sahamfyp Instagram carousel.
Generate naskah 8 slide carousel dalam format JSON valid.

KATEGORI: ${category}
TICKER: ${ticker || 'N/A'}
JUDUL: ${title}
KONTEN: ${content}
SUMBER: ${siteName}
DATA_ENRICHMENT: ${JSON.stringify(enrichment.data || {})}

FORMAT OUTPUT (JSON valid, tanpa markdown):
{
  "handle": "@sahamfyp",
  "badgeText": "${ticker || category}",
  "slides": [
    { "template": "cover", "title": "...", "description": "..." },
    { "template": "tldr", "title": "...", "tldrCards": [{"icon": "TrendingUp", "text": "..."}] },
    { "template": "kronologi", "title": "...", "description": "...", "source": "${siteName}" },
    { "template": "data", "title": "...", "metrics": [{"icon": "TrendingUp", "label": "...", "value": "...", "caption": "...", "tone": "amber"}] },
    { "template": "pros", "title": "...", "bullets": [{"icon": "CheckCircle2", "text": "..."}] },
    { "template": "cons", "title": "...", "bullets": [{"icon": "AlertTriangle", "text": "..."}] },
    { "template": "standar", "title": "...", "description": "..." },
    { "template": "cta", "title": "...", "description": "...", "disclaimer": "DYOR" }
  ],
  "caption": {
    "instagram": "...",
    "tiktok": "..."
  }
}

ATURAN:
- Bahasa Indonesia kasual
- Caption IG: hook + info + CTA + 3 hashtags (#saham #investasi #${ticker?.toLowerCase() || 'saham'})
- Caption TikTok: hook agresif + #fyp #foryou #sahamindonesia
- DYOR disclaimer selalu di slide terakhir
- DARIKAN DATA NYATA, jangan mengarang
`;

  const rawOutput = await generateContentRaw(prompt);

  // Clean JSON from markdown
  let jsonStr = rawOutput.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    console.error('Failed to parse naskah JSON:', rawOutput);
    throw new Error('Failed to generate valid naskah JSON');
  }
}
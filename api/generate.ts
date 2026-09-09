import type { VercelRequest, VercelResponse } from '@vercel/node';
import { classifyContent, generateContent } from './_lib/gemini.ts';
import { enrichByCategory } from './_lib/sectors.ts';
import { scrapeUrl } from './_lib/scraper.ts';
import { validateApiKey, isScrapeEndpoint, isHealthEndpoint } from './_lib/auth.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isScrapeEndpoint(req.url) && !isHealthEndpoint(req.url)) {
    if (!validateApiKey(req)) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, title: inputTitle, content: inputContent, category: inputCategory, ticker: inputTicker } = req.body;

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

  const rawOutput = await generateContent(prompt);

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
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import { validateApiKey, parseBody } from './_lib/auth.js';
import { chatComplete, generateJson } from './_lib/llm.js';

// --- LLM (Sumopod, OpenAI-compatible) ---

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

  return generateJson(prompt, { temperature: 0.2 });
}

async function generateContentRaw(prompt: string): Promise<string> {
  // json mode supaya model dipaksa output JSON valid (fallback otomatis kalau
  // model/gateway tidak mendukung response_format — lihat api/_lib/llm.ts)
  return chatComplete(prompt, { json: true });
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

// Fetch company report - returns all sections in one call
async function fetchCompanyReport(symbol: string) {
  try {
    return await fetchSectors(`/company/report/${symbol}/`);
  } catch (error) {
    console.warn(`Failed to fetch company report for ${symbol}:`, error);
    return { 
      error: true, 
      message: error instanceof Error ? error.message : 'Unknown error',
      note: 'Sectors.app API endpoint may have changed. Check https://docs.sectors.app/'
    };
  }
}

// Fetch foreign flow data
async function fetchForeignFlow(symbol: string) {
  try {
    return await fetchSectors(`/foreign-flow/${symbol}/`);
  } catch (error) {
    console.warn(`Failed to fetch foreign flow for ${symbol}:`, error);
    return { 
      error: true, 
      message: error instanceof Error ? error.message : 'Unknown error',
      note: 'Sectors.app API endpoint may have changed. Check https://docs.sectors.app/'
    };
  }
}

async function enrichByCategory(category: string, ticker: string | null) {
  if (!ticker) {
    return { category, ticker: null, data: null };
  }

  const enrichmentMap: Record<string, () => Promise<any>> = {
    SINGLE_STOCK: async () => {
      const [report, foreignFlow] = await Promise.all([
        fetchCompanyReport(ticker),
        fetchForeignFlow(ticker),
      ]);
      return { report, foreignFlow };
    },
    MACRO_ECONOMY: async () => {
      return { note: 'Macro economy uses general market data, not ticker-specific' };
    },
    SECTOR_ANALYSIS: async () => {
      const report = await fetchCompanyReport(ticker);
      return { report };
    },
    CORPORATE_ACTION: async () => {
      const report = await fetchCompanyReport(ticker);
      return { report };
    },
    IPO_RIGHTS_ISSUE: async () => {
      const report = await fetchCompanyReport(ticker);
      return { report };
    },
    SUSPENSION_DELISTING: async () => {
      const report = await fetchCompanyReport(ticker);
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

/** Limit teks ke maksimum N kata (buat enforce hard-limit KRONOLOGI) */
function limitWords(text: string, maxWords = 30): string {
  const trimmed = (text || '').trim();
  if (!trimmed) return text;
  const words = trimmed.split(/\s+/);
  return words.length <= maxWords ? trimmed : words.slice(0, maxWords).join(' ');
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

  const OUTPUT_SCHEMA = `{
  "handle": "@sahamfyp",
  "badgeText": "${ticker || category}",
  "badgeBgColor": "#14182B",
  "badgeTextColor": "#FFFFFF",
  "textColor": "#14182B",
  "bgColor": "#F5F1E7",
  "slides": [
    { "template": "cover", "title": "...", "description": "...", "visualIcon": "TrendingUp", "accent": "#F2A93B" },
    { "template": "tldr", "title": "TL;DR", "tldrCards": [{ "icon": "...", "text": "..." }], "accent": "#F2A93B" },
    { "template": "kronologi", "title": "Kronologi", "description": "... (maks 30 kata)", "source": "${siteName || 'Keterbukaan Informasi'}", "visualIcon": "Coins", "accent": "#F2A93B" },
    { "template": "data", "title": "...", "metrics": [{ "icon": "...", "label": "...", "value": "...", "caption": "...", "tone": "amber|sage" }], "accent": "#F2A93B" },
    { "template": "pros", "title": "...", "bullets": [{ "icon": "CheckCircle2", "text": "..." }], "accent": "#4CAF7D" },
    { "template": "cons", "title": "...", "bullets": [{ "icon": "AlertTriangle", "text": "..." }], "accent": "#E4572E" },
    { "template": "standar", "title": "Kesimpulan", "description": "...", "visualIcon": "Scale", "accent": "#F2A93B" },
    { "template": "cta", "title": "Gas atau Skip?", "description": "...", "disclaimer": "Do Your Own Research (DYOR).", "visualIcon": "MessageCircle", "accent": "#F2A93B" }
  ],
  "caption": {
    "instagram": "Teks caption IG...",
    "tiktok": "Teks caption TikTok..."
  }
}`;

  const COMMON_RULES = \`
ATURAN WAJIB:
1. Output HARUS JSON valid — tanpa markdown, tanpa teks di luar JSON.
2. Semua field wajib diisi — jangan biarkan string kosong, gunakan "-" jika data tidak tersedia.
3. JANGAN mengarang data. Jika data enrichment tidak ada, skip metrik tersebut atau tulis "Data tidak tersedia".
4. Bahasa: Indonesia informal ala Instagram (gaya @sahamfyp) — "lo", "gue", analogi sehari-hari.
5. Slide 5 & 6 wajib format: Point (bold) + Explanation (1-2 kalimat analogi).
6. Slide 8 (CTA) wajib ada disclaimer DYOR.
7. Total 8 slides persis — jangan lebih, jangan kurang.
8. visualIcon harus salah satu dari: ArrowLeftRight, ArrowRight, AlertTriangle, BadgePercent, BarChart3, ChartNoAxesCombined, CheckCircle2, Coins, DollarSign, Eye, Flame, Gauge, Globe, Handshake, MessageCircle, Pickaxe, Rocket, Scale, Sparkles, ThumbsUp, TrendingUp, Wallet.
9. tone metrics hanya "amber" atau "sage".
10. accent: cover/tldr/kronologi/data/standar/cta = "#F2A93B", pros = "#4CAF7D", cons = "#E4572E".
11. KRONOLOGI (slide 3): description WAJIB MAKSIMAL 30 KATA — JANGAN LEBIH! Cek sendiri word count (split teks by spasi) sebelum output, potong jika lebih. Sumber/gambar kredit set di field "source".
12. Caption IG: hook menarik + isi konten ringkas + CTA (Call to Action) + 3 hashtags relevan.
13. Caption TikTok: hook agresif/penasaran + CTA ringkas + #fyp #foryou #sahamindonesia.
\`;

  let prompt = '';
  const dataStr = JSON.stringify(enrichment?.data || {}, null, 2);

  switch (category) {
    case 'SINGLE_STOCK':
      prompt = \`Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita analisis emiten tunggal.

BERITA:
- Judul: \${title}
- Isi: \${content}

DATA ENRICHMENT (dari Sectors.app):
\${dataStr}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (angka kunci wajib ada)
3. KRONOLOGI — Narasi konteks berita + sumber
4. BEDAH_DATA — 4-6 metrik dari enrichment (PER, PBV, ROE, EPS, dll)
5. PROS — 2-3 sisi positif (point + explanation)
6. CONS — 2-3 sisi risiko (point + explanation)
7. KESIMPULAN — Rangkuman netral, cocok buat tipe investor apa
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

\${COMMON_RULES}

FORMAT OUTPUT:
\${OUTPUT_SCHEMA}\`;
      break;
    case 'MACRO_ECONOMY':
      prompt = \`Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita makro ekonomi & tren pasar.

BERITA:
- Judul: \${title}
- Isi: \${content}

DATA ENRICHMENT (dari Sectors.app):
\${dataStr}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (angka kunci: IHSG, market cap, suku bunga)
3. KRONOLOGI — Narasi konteks berita + sumber
4. DAMPAK_PASAR — 4-6 metrik (IHSG, total market cap, top gainer/loser, most traded)
5. DIUNTUNGKAN — 2-3 sektor/sisi yang diuntungkan (point + explanation)
6. PERLU_DIWASPADAI — 2-3 risiko/tantangan (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

\${COMMON_RULES}

FORMAT OUTPUT:
\${OUTPUT_SCHEMA}\`;
      break;
    case 'SECTOR_ANALYSIS':
      prompt = \`Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita rotasi/sektor analisis.

BERITA:
- Judul: \${title}
- Isi: \${content}

DATA ENRICHMENT (dari Sectors.app):
\${dataStr}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (PE sektor, top gainer, YTD return)
3. KRONOLOGI — Narasi konteks berita + sumber
4. DATA_SEKTOR — 4-6 metrik (PE median, PBV, market cap sektor, top gainer, YTD)
5. SAHAM_JAGOAN — 2-3 saham yang menonjol di sektor (point + explanation)
6. PERLU_DIWASPADAI — 2-3 risiko sektor (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

\${COMMON_RULES}

FORMAT OUTPUT:
\${OUTPUT_SCHEMA}\`;
      break;
    case 'CORPORATE_ACTION':
      prompt = \`Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita aksi korporat (dividen, RUPS, buyback, stock split).

BERITA:
- Judul: \${title}
- Isi: \${content}

DATA ENRICHMENT (dari Sectors.app):
\${dataStr}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (jenis aksi, nilai, jadwal)
3. KRONOLOGI — Narasi konteks berita + sumber
4. DETAIL_AKSI — 4-6 metrik (jenis, nilai, yield, payout ratio, ex-date, buyback)
5. UNTUNG_BUAT_INVESTOR — 2-3 keuntungan buat investor (point + explanation)
6. PERLU_DIPERHATIKAN — 2-3 hal yang perlu diperhatikan (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

\${COMMON_RULES}

FORMAT OUTPUT:
\${OUTPUT_SCHEMA}\`;
      break;
    case 'IPO_RIGHTS_ISSUE':
      if (!ticker) {
        prompt = \`Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita IPO baru (calon emiten belum listing).

BERITA:
- Judul: \${title}
- Isi: \${content}

CATATAN: Ini IPO BARU — belum ada data enrichment dari Sectors.app.
Semua data diambil 100% dari isi berita. JANGAN panggil API, JANGAN mengarang data.

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (bisnis, afiliasi, target dana)
3. PROFIL_PERUSAHAAN — Sekilas model bisnis, klien, posisi industri
4. DETAIL_PENAWARAN — 4-6 metrik (harga IPO, jumlah saham, target dana, penggunaan dana, jadwal listing)
5. KENAPA_MENARIK — 2-3 alasan menarik (point + explanation)
6. RISIKO — 2-3 risiko IPO baru (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

\${COMMON_RULES}

FORMAT OUTPUT:
\${OUTPUT_SCHEMA}\`;
      } else {
        prompt = \`Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita Right Issue / Stock Split.

BERITA:
- Judul: \${title}
- Isi: \${content}

DATA ENRICHMENT (dari Sectors.app):
\${dataStr}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (jenis, rasio, harga pelaksanaan, target dana)
3. KRONOLOGI — Narasi konteks berita + sumber
4. SKEMA_AKSI — 4-6 metrik (jenis, jumlah saham baru, harga, rasio, target dana, record date)
5. UNTUNG_BUAT_INVESTOR — 2-3 keuntungan (point + explanation)
6. PERLU_DIWASPADAI — 2-3 risiko/dilusi (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

\${COMMON_RULES}

FORMAT OUTPUT:
\${OUTPUT_SCHEMA}\`;
      }
      break;
    case 'SUSPENSION_DELISTING':
      prompt = \`Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita suspensi/delisting saham.

BERITA:
- Judul: \${title}
- Isi: \${content}

DATA ENRICHMENT (dari Sectors.app):
\${dataStr}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (tanggal, alasan, jenis suspensi, harga terakhir)
3. KRONOLOGI — Narasi konteks berita + sumber (link PDF resmi BEI jika ada)
4. FAKTA_SUSPENSI — 4-6 metrik (tanggal, alasan, harga, 52w range, market cap, sektor)
5. APA_ITU_SUSPENSI — 2-3 edukasi mekanisme suspensi (point + explanation)
6. YANG_PERLU_DILAKUKAN — 2-3 langkah yang harus diambil investor (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

\${COMMON_RULES}

FORMAT OUTPUT:
\${OUTPUT_SCHEMA}\`;
      break;
    default:
      prompt = \`Kamu adalah AI Content Writer untuk @sahamfyp.
Tugasmu: tulis naskah carousel 8 slide untuk berita saham.

BERITA:
- Judul: \${title}
- Isi: \${content}

DATA ENRICHMENT:
\${dataStr}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik
2. TLDR — 3-4 poin ringkasan
3. KRONOLOGI — Narasi berita
4. DATA — 4-6 metrik
5. PROS — 2-3 hal positif
6. CONS — 2-3 hal negatif
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi

\${COMMON_RULES}

FORMAT OUTPUT:
\${OUTPUT_SCHEMA}\`;
  }


  const rawOutput = await generateContentRaw(prompt);

  // Clean JSON from markdown
  let jsonStr = rawOutput.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  try {
    const parsed = JSON.parse(jsonStr);
    
    // Fix CTA slide icon - always use MessageCircle (comment icon)
    if (parsed?.slides && parsed.slides[7] && parsed.slides[7].template === 'cta') {
      parsed.slides[7].visualIcon = 'MessageCircle';
      parsed.slides[7].visualMode = 'icon';
    }

    // Enforce hard limit: KRONOLOGI (slide 3) description maksimal 30 kata
    if (parsed?.slides) {
      for (const slide of parsed.slides) {
        if (slide && slide.template === 'kronologi' && slide.description) {
          slide.description = limitWords(slide.description, 30);
        }
      }
    }

    return parsed;
  } catch {
    console.error('Failed to parse naskah JSON:', rawOutput);
    throw new Error('Failed to generate valid naskah JSON');
  }
}
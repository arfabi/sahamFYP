import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateApiKey } from '../_lib/auth.js';
import { fetchIndexDaily, fetchTopMovers, fetchFilings, getYesterdayDate } from '../_lib/sectorsMarket.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!validateApiKey(req)) return res.status(401).json({ error: 'Invalid or missing API key' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const yesterday = getYesterdayDate();
    const [indexData, topMovers, filingsData] = await Promise.all([
      fetchIndexDaily(yesterday, yesterday),
      fetchTopMovers({ classifications: ['top_gainers', 'top_losers'], periods: ['1d'], nStock: 3 }),
      fetchFilings({ start: yesterday, end: yesterday }),
    ]);

    const prompt = buildOpenPrompt(yesterday, indexData, topMovers, filingsData);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite', generationConfig: { responseMimeType: 'application/json' } });
    const result = await model.generateContent(prompt);
    let jsonStr = result.response.text().trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    const naskah = JSON.parse(jsonStr);

    if (naskah.slides?.[7]?.template === 'cta') {
      naskah.slides[7].visualIcon = 'MessageCircle';
      naskah.slides[7].visualMode = 'icon';
    }

    return res.status(200).json({ success: true, session: 'open', date: yesterday, naskah, creditsUsed: 4 });
  } catch (error) {
    console.error('[SectorTrigger Open] Error:', error);
    return res.status(500).json({ error: 'Failed to generate open naskah', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}

function buildOpenPrompt(date: string, indexData: any[], topMovers: any, filings: any): string {
  const ihs = indexData[0] || {};
  const gainers = topMovers?.top_gainers?.['1d'] || [];
  const losers = topMovers?.top_losers?.['1d'] || [];
  const filingsArray = Array.isArray(filings) ? filings : (filings?.data || filings?.results || []);
  const insiderFilings = filingsArray.filter((f: any) => (f.transaction_value || 0) > 500000000);

  return `Kamu adalah AI Content Generator untuk @sahamfyp.
Tugasmu adalah membuat konten carousel "Market Open" untuk tanggal ${date}.

## DATA PASAR:

### IHSG Kemarin (${date}):
- Closing: ${ihs.price || 'N/A'}
- Perubahan: ${ihs.change || 'N/A'}%

### Top 3 Gainer Kemarin:
${gainers.map((g: any) => `- ${g.symbol} (${g.name}): +${g.price_change}%`).join('\n') || 'Tidak ada data'}

### Top 3 Loser Kemarin:
${losers.map((l: any) => `- ${l.symbol} (${l.name}): ${l.price_change}%`).join('\n') || 'Tidak ada data'}

### Insider Filing Kemarin (>Rp500 juta):
${insiderFilings.map((f: any) => `- ${f.insider_name} (${f.insider_position}) ${f.transaction_type} ${f.symbol} senilai Rp${(f.transaction_value / 1000000).toFixed(0)} juta`).join('\n') || 'Tidak ada insider filing signifikan'}

## FORMAT OUTPUT (JSON VALID, TANPA MARKDOWN):
{
  "handle": "@sahamfyp",
  "badgeText": "OPEN",
  "badgeBgColor": "#14182B",
  "badgeTextColor": "#FFFFFF",
  "slides": [
    { "template": "cover", "title": "Selamat Pagi! IHSG Kemarin Tutup di ${ihs.price || 'N/A'}", "description": "Hari ini bakal kemana? Cek recap lengkapnya!", "visualIcon": "TrendingUp", "accent": "#F2A93B" },
    { "template": "tldr", "title": "TL;DR", "tldrCards": [{ "icon": "TrendingUp", "text": "IHSG kemarin: ${ihs.price || 'N/A'} (${ihs.change || 'N/A'}%)" }, { "icon": "TrendingUp", "text": "Gainer terbesar: ${gainers[0]?.symbol || 'N/A'} +${gainers[0]?.price_change || 0}%" }, { "icon": "AlertTriangle", "text": "Loser terbesar: ${losers[0]?.symbol || 'N/A'} ${losers[0]?.price_change || 0}%" }], "accent": "#F2A93B" },
    { "template": "kronologi", "title": "Pergerakan IHSG Kemarin", "description": "Narasi singkat pergerakan IHSG kemarin (maks 30 kata)", "visualIcon": "TrendingUp", "accent": "#F2A93B" },
    { "template": "data", "title": "Top Gainer & Loser", "metrics": [{ "icon": "TrendingUp", "label": "Top Gainer", "value": "${gainers[0]?.symbol || 'N/A'}", "caption": "+${gainers[0]?.price_change || 0}%", "tone": "amber" }, { "icon": "AlertTriangle", "label": "Top Loser", "value": "${losers[0]?.symbol || 'N/A'}", "caption": "${losers[0]?.price_change || 0}%", "tone": "amber" }], "accent": "#F2A93B" },
    { "template": "pros", "title": "Insider Filing", "bullets": [{ "icon": "CheckCircle2", "text": "**${insiderFilings[0]?.insider_name || 'N/A'}** ${insiderFilings[0]?.transaction_type || 'beli'} ${insiderFilings[0]?.symbol || 'N/A'} senilai Rp${((insiderFilings[0]?.transaction_value || 0) / 1000000).toFixed(0)} juta" }], "accent": "#4CAF7D" },
    { "template": "cons", "title": "Yang Perlu Dipantau", "bullets": [{ "icon": "AlertTriangle", "text": "Event hari ini yang bisa gerakkan pasar" }], "accent": "#E4572E" },
    { "template": "standar", "title": "Outlook", "description": "Outlook singkat netral berdasarkan data kemarin", "visualIcon": "Scale", "accent": "#F2A93B" },
    { "template": "cta", "title": "Gimana Menurutmu?", "description": "Saham apa yang lo pantau hari ini? Drop di kolom komentar!", "disclaimer": "DYOR: Konten ini murni edukasi, bukan ajakan jual/beli.", "visualIcon": "MessageCircle", "accent": "#F2A93B" }
  ]
}

## ATURAN:
1. Output HARUS JSON valid
2. Slide 3 description MAKSIMAL 30 KATA
3. Slide 8 WAJIB ada disclaimer DYOR
4. Bahasa: Indonesia informal
5. JANGAN mengarang data
`;
}

export default handler;

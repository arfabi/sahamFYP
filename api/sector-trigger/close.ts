import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateApiKey } from '../_lib/auth.js';
import {
  fetchIndexDaily,
  fetchTopMovers,
  fetchForeignFlowTop,
  fetchForeignNetTop,
  fetchFilings,
  fetchTopBrokers,
  fetchBrokerActivityTop,
  getTodayDate,
  getYesterdayDate,
} from '../_lib/sectorsMarket.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!validateApiKey(req)) return res.status(401).json({ error: 'Invalid or missing API key' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    const [indexData, topMovers, foreignFlow, foreignNet, filings, brokers] = await Promise.all([
      fetchIndexDaily(today, today),
      fetchTopMovers({ classifications: ['top_gainers', 'top_losers'], periods: ['1d'], nStock: 3 }),
      fetchForeignFlowTop({ start: yesterday, end: today, nStock: 5 }),
      fetchForeignNetTop({ start: yesterday, end: today, nStock: 5 }),
      fetchFilings({ start: yesterday, end: today }),
      fetchTopBrokers({ start: yesterday, end: today, origin: 'foreign', metric: 'net' }),
    ]);

    const topBroker = brokers?.[0];
    let brokerActivity = null;
    if (topBroker?.broker_code) {
      brokerActivity = await fetchBrokerActivityTop({
        start: yesterday,
        end: today,
        symbol: topBroker.broker_code,
        nStock: 5,
      });
    }

    const prompt = buildClosePrompt(today, indexData, topMovers, foreignFlow, foreignNet, filings, brokers, brokerActivity);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite', generationConfig: { responseMimeType: 'application/json' } });
    const result = await model.generateContent(prompt);
    let jsonStr = result.response.text().trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    const naskah = JSON.parse(jsonStr);

    if (naskah.slides?.[7]?.template === 'cta') {
      naskah.slides[7].visualIcon = 'MessageCircle';
      naskah.slides[7].visualMode = 'icon';
    }

    return res.status(200).json({ success: true, session: 'close', date: today, naskah, creditsUsed: 10 });
  } catch (error) {
    console.error('[SectorTrigger Close] Error:', error);
    return res.status(500).json({ error: 'Failed to generate close naskah', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}

function buildClosePrompt(
  date: string,
  indexData: any[],
  topMovers: any,
  foreignFlow: any[],
  foreignNet: any[],
  filings: any[],
  brokers: any[],
  brokerActivity: any
): string {
  const ihs = indexData[0] || {};
  const gainers = topMovers?.top_gainers?.['1d'] || [];
  const losers = topMovers?.top_losers?.['1d'] || [];
  const filingsArray = Array.isArray(filings) ? filings : (filings?.data || filings?.results || []);
  const insiderFilings = filingsArray.filter((f: any) => (f.transaction_value || 0) > 500000000);
  const topBroker = brokers?.[0];
  const brokerStocks = brokerActivity?.stocks?.slice(0, 3) || [];

  return `Kamu adalah AI Content Generator untuk @sahamfyp.
Tugasmu adalah membuat konten carousel "Market Close" untuk tanggal ${date}.

## DATA PASAR:

### IHSG Hari Ini (${date}):
- Closing: ${ihs.price || 'N/A'}
- Perubahan: ${ihs.change || 'N/A'}%

### Top 3 Gainer Hari Ini:
${gainers.map((g: any) => `- ${g.symbol} (${g.name}): +${g.price_change}%`).join('\n') || 'Tidak ada data'}

### Top 3 Loser Hari Ini:
${losers.map((l: any) => `- ${l.symbol} (${l.name}): ${l.price_change}%`).join('\n') || 'Tidak ada data'}

### Foreign Flow Top 5:
${(foreignFlow || []).slice(0, 5).map((f: any) => `- ${f.symbol}: ${f.net_value > 0 ? '+' : ''}${(f.net_value / 1000000000).toFixed(1)} M`).join('\n') || 'Tidak ada data'}

### Broker Asing #1 Net Buy: ${topBroker?.broker_name || 'N/A'}
### Saham yang Diborong:
${brokerStocks.map((s: any) => `- ${s.symbol}: +${(s.net_value / 1000000000).toFixed(1)} M`).join('\n') || 'Tidak ada data'}

### Insider Filing (>Rp500 juta):
${insiderFilings.map((f: any) => `- ${f.insider_name} (${f.insider_position}) ${f.transaction_type} ${f.symbol} senilai Rp${(f.transaction_value / 1000000).toFixed(0)} juta`).join('\n') || 'Tidak ada insider filing signifikan'}

## FORMAT OUTPUT (JSON VALID, TANPA MARKDOWN):
{
  "handle": "@sahamfyp",
  "badgeText": "CLOSE",
  "badgeBgColor": "#14182B",
  "badgeTextColor": "#FFFFFF",
  "slides": [
    { "template": "cover", "title": "Recap Market - ${date}", "description": "IHSG hari ini: ${ihs.price || 'N/A'} (${ihs.change || 'N/A'}%)", "visualIcon": "TrendingUp", "accent": "#F2A93B" },
    { "template": "tldr", "title": "TL;DR", "tldrCards": [{ "icon": "TrendingUp", "text": "IHSG: ${ihs.price || 'N/A'} (${ihs.change || 'N/A'}%)" }, { "icon": "TrendingUp", "text": "Gainer: ${gainers[0]?.symbol || 'N/A'} +${gainers[0]?.price_change || 0}%" }, { "icon": "AlertTriangle", "text": "Loser: ${losers[0]?.symbol || 'N/A'} ${losers[0]?.price_change || 0}%" }], "accent": "#F2A93B" },
    { "template": "kronologi", "title": "Pergerakan IHSG Hari Ini", "description": "Narasi singkat pergerakan IHSG hari ini (maks 30 kata)", "visualIcon": "TrendingUp", "accent": "#F2A93B" },
    { "template": "data", "title": "Gainer, Loser & Volume", "metrics": [{ "icon": "TrendingUp", "label": "Top Gainer", "value": "${gainers[0]?.symbol || 'N/A'}", "caption": "+${gainers[0]?.price_change || 0}%", "tone": "amber" }, { "icon": "AlertTriangle", "label": "Top Loser", "value": "${losers[0]?.symbol || 'N/A'}", "caption": "${losers[0]?.price_change || 0}%", "tone": "amber" }], "accent": "#F2A93B" },
    { "template": "pros", "title": "Broker Asing Akumulasi", "bullets": [{ "icon": "CheckCircle2", "text": "**${topBroker?.broker_name || 'N/A'}** broker asing #1 net buy hari ini" }, { "icon": "CheckCircle2", "text": "Saham yang diborong: ${brokerStocks.map((s: any) => s.symbol).join(', ') || 'N/A'}" }], "accent": "#4CAF7D" },
    { "template": "cons", "title": "Yang Perlu Diperhatikan", "bullets": [{ "icon": "AlertTriangle", "text": "Sektor yang underperform hari ini" }, { "icon": "AlertTriangle", "text": "Potensi profit taking besok" }], "accent": "#E4572E" },
    { "template": "standar", "title": "Kesimpulan", "description": "Ringkasan netral berdasarkan data hari ini", "visualIcon": "Scale", "accent": "#F2A93B" },
    { "template": "cta", "title": "Gimana Menurutmu?", "description": "Saham apa yang lo pantau besok? Drop di kolom komentar!", "disclaimer": "DYOR: Konten ini murni edukasi, bukan ajakan jual/beli.", "visualIcon": "MessageCircle", "accent": "#F2A93B" }
  ]
}

## ATURAN:
1. Output HARUS JSON valid
2. Slide 3 description MAKSIMAL 30 KATA
3. Slide 8 WAJIB ada disclaimer DYOR
4. Bahasa: Indonesia informal
5. JANGAN mengarang data
6. Jika IHSG turun > -1.5%, gunakan tone hati-hati di slide 6
`;
}

export default handler;

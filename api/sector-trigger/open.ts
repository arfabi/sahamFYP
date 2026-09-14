import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateApiKey } from '../_lib/auth.js';
import { fetchIndexDaily, fetchFilings, fetchNews, fetchTopMovers, getYesterdayDate, getTodayDate } from '../_lib/sectorsMarket.js';
import { fetchCompanyReport } from '../_lib/sectors.js';
import { supabaseServer } from '../_lib/supabase.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Fixed kamus from docs/format-brief-revisi-14-sept-2026.md
const FIXED_KAMUS = [
  {
    term: 'PER',
    definition: 'Price to Earnings Ratio \u2014 Berapa tahun balik modal kalau laba perusahaan segini terus.',
    analogi: 'Beli HP Rp15jt, tiap tahun lo "untung" Rp1jt dari pemakaian/produktivitas \u2192 PER = 15x, alias 15 tahun modal balik. Makin kecil = makin cepet "balik modal".'
  },
  {
    term: 'PBV',
    definition: 'Price to Book Value \u2014 Lo bayar berapa kali lipat dari aset bersih perusahaan.',
    analogi: 'Beli barang preloved. Kalau harga aslinya Rp1jt tapi lo bayar Rp3jt (PBV 3x), berarti lo bayar mahal buat "brand" atau ekspektasi, bukan buat barangnya doang.'
  },
  {
    term: 'ROE',
    definition: 'Return on Equity \u2014 Seberapa efisien modal sendiri perusahaan menghasilkan cuan.',
    analogi: '2 temen sama-sama modal patungan bisnis jastip. Yang modal Rp1jt untung Rp200rb (ROE 20%) lebih jago ngolah modal daripada yang modal Rp5jt untung Rp200rb (ROE 4%).'
  },
  {
    term: 'DER',
    definition: 'Debt to Equity Ratio \u2014 Utang perusahaan dibanding modal sendiri.',
    analogi: 'Kayak paylater. DER 1x = utang lo sama gede sama modal sendiri. DER 3x = utang lo 3x lipat modal sendiri \u2014 makin gede, makin gampang "kepontal" kalau ada masalah.'
  }
];

/**
 * Extract peer company rows from Sectors v2 company report `peers` section.
 * v2 structure: peers.peers_data.companies[] — each item is a peer company
 * with fields: pe_ttm, pb_mrq, market_cap, net_income, total_equity,
 * total_liabilities, total_revenue, company_name, symbol ...
 * Fallback: flat array (older shape).
 */
function extractPeersCompanies(peersRaw: any): any[] {
  if (!peersRaw) return [];
  const companies = peersRaw.peers_data?.companies;
  if (Array.isArray(companies)) return companies;
  if (Array.isArray(peersRaw)) return peersRaw;
  return [];
}

async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!validateApiKey(req)) return res.status(401).json({ error: 'Invalid or missing API key' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const yesterday = getYesterdayDate();
    const today = getTodayDate();

    // Step 1: Fetch raw data (IHSG + news + filings + top movers)
    const [indexData, newsData, filingsData, topMovers] = await Promise.all([
      fetchIndexDaily(yesterday, yesterday),
      fetchNews({ start: yesterday, end: today, limit: 15, tags: 'bullish,rights-issue,executive-changes' }),
      fetchFilings({ start: yesterday, end: today }),
      fetchTopMovers({ classifications: ['top_gainers', 'top_losers'], periods: ['1d'], nStock: 5 }),
    ]);

    const newsResults = Array.isArray(newsData?.results) ? newsData.results : [];
    const filingsArray = Array.isArray(filingsData) ? filingsData : (filingsData?.data || filingsData?.results || []);
    const ihs = Array.isArray(indexData) ? indexData[0] : indexData;

    // Insert main log to database
    const { data: logData, error: logError } = await supabaseServer
      .from('sector_trigger_logs')
      .insert({
        session: 'open',
        trigger_date: today,
        data_date: yesterday,
        ihsg_price: ihs?.price || null,
        ihsg_change: ihs?.change || null,
        news_fetched: newsResults.length,
        status: 'success'
      })
      .select()
      .single();

    if (logError) {
      console.error('[SectorTrigger Open] Log insert error:', logError);
    }

    const logId = logData?.id;

    // Insert news articles to database
    if (logId && newsResults.length > 0) {
      const newsInserts = newsResults.map((n: any, i: number) => ({
        log_id: logId,
        news_index: i + 1,
        title: n.title || null,
        tags: n.tags || [],
        symbols: n.symbols || [],
        sector: n.sector || null,
        source_url: n.source || null,
        published_at: n.timestamp || null,
        is_selected: false
      }));

      const { error: newsError } = await supabaseServer
        .from('sector_trigger_news')
        .insert(newsInserts);

      if (newsError) {
        console.error('[SectorTrigger Open] News insert error:', newsError);
      }
    }

    // Insert top movers to database
    if (logId && topMovers) {
      const moversInserts: any[] = [];
      
      const gainers = topMovers?.top_gainers?.['1d'] || [];
      const losers = topMovers?.top_losers?.['1d'] || [];

      gainers.forEach((g: any) => {
        moversInserts.push({
          log_id: logId,
          classification: 'top_gainers',
          symbol: g.symbol,
          company_name: g.name,
          price_change: g.price_change
        });
      });

      losers.forEach((l: any) => {
        moversInserts.push({
          log_id: logId,
          classification: 'top_losers',
          symbol: l.symbol,
          company_name: l.name,
          price_change: l.price_change
        });
      });

      if (moversInserts.length > 0) {
        const { error: moversError } = await supabaseServer
          .from('sector_trigger_movers')
          .insert(moversInserts);

        if (moversError) {
          console.error('[SectorTrigger Open] Movers insert error:', moversError);
        }
      }
    }

    // Step 2: Gemini selects best tickers from news
    const selection = await selectTickersWithGemini(newsResults, filingsArray);
    const selectedTickers = selection.tickers;

    // Update log with selection info
    if (logId) {
      await supabaseServer
        .from('sector_trigger_logs')
        .update({
          tickers_selected: selectedTickers.length,
          reasoning: selection.reasoning || null
        })
        .eq('id', logId);
    }

    // Insert skipped tickers
    if (logId && selection.skipped && selection.skipped.length > 0) {
      const skippedInserts = selection.skipped.map((s: any) => ({
        log_id: logId,
        ticker: s.ticker,
        reason: s.reason
      }));

      const { error: skippedError } = await supabaseServer
        .from('sector_trigger_skipped')
        .insert(skippedInserts);

      if (skippedError) {
        console.error('[SectorTrigger Open] Skipped insert error:', skippedError);
      }
    }

    if (selectedTickers.length === 0) {
      // Update log status
      if (logId) {
        await supabaseServer
          .from('sector_trigger_logs')
          .update({ status: 'no_candidates' })
          .eq('id', logId);
      }

      return res.status(200).json({
        success: true,
        session: 'open',
        date: today,
        dataDate: yesterday,
        naskah: null,
        message: 'Tidak ada katalis yang cukup kuat hari ini',
        creditsUsed: 5,
        selection,        logId
      });
    }

    // Step 3: Fetch company reports ONLY for selected tickers
    const candidates = await Promise.all(
      selectedTickers.map(async (ticker: string) => {
        const report = await fetchCompanyReport(ticker, ['valuation', 'financials', 'peers']);
        const relatedNews = newsResults.filter((n: any) => n.symbols?.includes(ticker));
        return {
          symbol: ticker,
          newsTitle: relatedNews[0]?.title || 'N/A',
          newsBody: relatedNews[0]?.body || '',
          tags: relatedNews[0]?.tags || [],
          sector: relatedNews[0]?.sector || null,
          report,
        };
      })
    );

    // Insert candidates to database
    if (logId && candidates.length > 0) {
      const candidatesInserts = candidates.map((c: any) => {
        const valuation = c.report?.valuation || {};
        const financials = c.report?.financials || {};
        const peers = extractPeersCompanies(c.report?.peers);

        const peerCount = peers.length || 1;
        const avgPER = peers.reduce((sum: number, p: any) => sum + (p.pe_ttm || 0), 0) / peerCount || 0;
        const avgPBV = peers.reduce((sum: number, p: any) => sum + (p.pb_mrq || 0), 0) / peerCount || 0;
        const avgROE = peers.reduce((sum: number, p: any) => sum + (p.net_income && p.total_equity ? (p.net_income / p.total_equity) : 0), 0) / peerCount * 100 || 0;
        const avgDER = peers.reduce((sum: number, p: any) => sum + (p.total_liabilities && p.total_equity ? (p.total_liabilities / p.total_equity) : 0), 0) / peerCount || 0;

        const roeV = typeof financials.roe === 'number'
          ? (financials.roe <= 1 ? financials.roe * 100 : financials.roe)
          : (financials.net_income && financials.total_equity ? (financials.net_income / financials.total_equity) * 100 : null);
        const derV = typeof financials.debt_to_equity === 'number'
          ? financials.debt_to_equity
          : (financials.total_liabilities && financials.total_equity ? financials.total_liabilities / financials.total_equity : null);

        return {
          log_id: logId,
          ticker: c.symbol,
          company_name: valuation.company_name || c.report?.company_name || c.report?.overview?.company_name || null,
          sector: c.sector,
          news_title: c.newsTitle,
          news_tags: c.tags,
          news_body: c.newsBody,
          price: valuation.close_price || valuation.price || null,
          market_cap: valuation.market_cap || null,
          pe_ratio: valuation.pe_ttm || valuation.pe_ratio || null,
          pb_ratio: valuation.pb_mrq || valuation.pb_ratio || null,
          roe: roeV,
          der: derV,
          revenue: financials.total_revenue || financials.revenue || null,
          net_income: financials.net_income || null,
          avg_sector_pe: avgPER || null,
          avg_sector_pbv: avgPBV || null,
          avg_sector_roe: avgROE || null,
          avg_sector_der: avgDER || null,
          pe_signal: valuation.pe_ttm !== undefined ? (valuation.pe_ttm < avgPER ? 'lebih murah' : valuation.pe_ttm > avgPER * 1.5 ? 'lebih mahal/berisiko' : 'netral') : null,
          pbv_signal: valuation.pb_mrq !== undefined ? (valuation.pb_mrq < avgPBV ? 'lebih murah' : valuation.pb_mrq > avgPBV * 1.5 ? 'lebih mahal/berisiko' : 'netral') : null,
          roe_signal: roeV !== null ? (roeV > avgROE ? 'di atas sektor' : 'di bawah sektor') : null,
          der_signal: derV !== null ? (derV > avgDER * 1.5 ? 'berisiko tinggi' : 'wajar') : null,
          enrichment_json: c.report
        };
      });

      const { error: candidatesError } = await supabaseServer
        .from('sector_trigger_candidates')
        .insert(candidatesInserts);

      if (candidatesError) {
        console.error('[SectorTrigger Open] Candidates insert error:', candidatesError);
      }

      // Update news is_selected flag
      if (selectedTickers.length > 0) {
        await supabaseServer
          .from('sector_trigger_news')
          .update({ is_selected: true })
          .eq('log_id', logId)
          .contains('symbols', selectedTickers);
      }
    }

    // Step 4: Gemini generates final slides
    const naskah = await generateSlidesWithGemini(today, yesterday, ihs, candidates, newsResults, selection, topMovers);

    const totalCredits = 5 + candidates.length;

    // Update log with final credits
    if (logId) {
      await supabaseServer
        .from('sector_trigger_logs')
        .update({ credits_used: totalCredits })
        .eq('id', logId);
    }

    return res.status(200).json({
      success: true,
      session: 'open',
      date: today,
      dataDate: yesterday,
      naskah,
      creditsUsed: totalCredits,
      selection,
      logId
    });
  } catch (error) {
    console.error('[SectorTrigger Open] Error:', error);
    return res.status(500).json({ error: 'Failed to generate open naskah', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export default handler;

async function selectTickersWithGemini(newsResults: any[], filingsArray: any[]): Promise<{
  tickers: string[];
  reasoning: string;
  skipped: Array<{ ticker: string; reason: string }>;
}> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const newsSummary = newsResults.map((n: any, i: number) => ({
    idx: i + 1,
    title: n.title,
    tags: n.tags || [],
    symbols: n.symbols || [],
    sector: n.sector || null,
    timestamp: n.timestamp,
  }));

  const prompt = `Kamu adalah Manajer Investasi senior di sekuritas terkemuka Indonesia dengan pengalaman 15+ tahun menganalisis saham IDX.

Tugasmu: Dari daftar berita berikut, pilih 1-4 saham yang paling menarik untuk dijadikan watchlist hari ini.

## KRITERIA SELEKSI (urutan prioritas):
1. **Katalis kuat**: Rights issue besar, M&A, perubahan direksi/resign massal, akuisisi signifikan
2. **Dampak harga potensial**: Event yang bisa gerakkan signifikan dalam 1-5 hari
3. **Unik/interesting**: Cerita yang tidak biasa, kontroversial, atau jarang terjadi
4. **Relevansi pasar**: Semakin banyak simbol yang terlibat = semakin menarik

## ATURAN:
- Minimal 1 saham, maksimal 4 saham
- Kalau tidak ada yang cukup menarik, kembalikan array kosong (tickers: [])
- Jangan pilih saham yang hanya karena "bullish" tanpa katalis spesifik
- Lebih baik 1 saham berkualitas daripada 4 saham lemah
- Prioritaskan saham dengan katalis KORPORASI (bukan sekadar sentimen)

## DAFTAR BERITA (total: ${newsResults.length}):
${JSON.stringify(newsSummary, null, 2)}

## FORMAT OUTPUT (JSON VALID):
{
  "tickers": ["TICKER1", "TICKER2"],
  "reasoning": "Alasan singkat kenapa memilih saham-saham ini (maks 50 kata)",
  "skipped": [
    { "ticker": "XXX", "reason": "Alasan skip" }
  ]
}

Output HANYA JSON, tanpa markdown atau penjelasan tambahan.`;

  const result = await model.generateContent(prompt);
  let jsonStr = result.response.text().trim();
  if (jsonStr.startsWith('\`\`\`json')) jsonStr = jsonStr.replace(/^\`\`\`json\s*\n?/, '').replace(/\n?\`\`\`\s*$/, '');
  
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      tickers: parsed.tickers || [],
      reasoning: parsed.reasoning || '',
      skipped: parsed.skipped || [],
    };
  } catch {
    console.error('[SelectTickers] Failed to parse Gemini response:', jsonStr);
    return { tickers: [], reasoning: 'Gagal menganalisis berita', skipped: [] };
  }
}

async function generateSlidesWithGemini(
  today: string,
  yesterday: string,
  ihs: any,
  candidates: any[],
  newsResults: any[],
  selection: { tickers: string[]; reasoning: string; skipped: Array<{ ticker: string; reason: string }> },
  topMovers: any
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const candidatesData = candidates.map((c: any) => {
    const valuation = c.report?.valuation || {};
    const financials = c.report?.financials || {};
    const peers = extractPeersCompanies(c.report?.peers);

    const peerCount = peers.length || 1;
    const avgPER = peers.reduce((sum: number, p: any) => sum + (p.pe_ttm || 0), 0) / peerCount || 0;
    const avgPBV = peers.reduce((sum: number, p: any) => sum + (p.pb_mrq || 0), 0) / peerCount || 0;
    const avgROE = peers.reduce((sum: number, p: any) => sum + (p.net_income && p.total_equity ? (p.net_income / p.total_equity) : 0), 0) / peerCount * 100 || 0;
    const avgDER = peers.reduce((sum: number, p: any) => sum + (p.total_liabilities && p.total_equity ? (p.total_liabilities / p.total_equity) : 0), 0) / peerCount || 0;

    const roeV = typeof financials.roe === 'number'
      ? (financials.roe <= 1 ? financials.roe * 100 : financials.roe)
      : (financials.net_income && financials.total_equity ? (financials.net_income / financials.total_equity) * 100 : null);
    const derV = typeof financials.debt_to_equity === 'number'
      ? financials.debt_to_equity
      : (financials.total_liabilities && financials.total_equity ? financials.total_liabilities / financials.total_equity : null);

    return {
      symbol: c.symbol,
      newsTitle: c.newsTitle,
      tags: c.tags,
      sector: c.sector,
      harga: valuation.close_price || valuation.price || 'N/A',
      marketCap: valuation.market_cap || 'N/A',
      PER: valuation.pe_ttm || valuation.pe_ratio || 'N/A',
      avgSectorPER: avgPER.toFixed(1),
      signalPER: valuation.pe_ttm !== undefined ? (valuation.pe_ttm < avgPER ? 'lebih murah' : valuation.pe_ttm > avgPER * 1.5 ? 'lebih mahal/berisiko' : 'netral') : 'N/A',
      PBV: valuation.pb_mrq || valuation.pb_ratio || 'N/A',
      avgSectorPBV: avgPBV.toFixed(1),
      signalPBV: valuation.pb_mrq !== undefined ? (valuation.pb_mrq < avgPBV ? 'lebih murah' : valuation.pb_mrq > avgPBV * 1.5 ? 'lebih mahal/berisiko' : 'netral') : 'N/A',
      ROE: roeV !== null ? roeV.toFixed(1) : 'N/A',
      avgSectorROE: avgROE.toFixed(1),
      signalROE: roeV !== null ? (roeV > avgROE ? 'di atas sektor' : 'di bawah sektor') : 'N/A',
      DER: derV !== null ? derV.toFixed(2) : 'N/A',
      avgSectorDER: avgDER.toFixed(2),
      signalDER: derV !== null ? (derV > avgDER * 1.5 ? 'berisiko tinggi' : 'wajar') : 'N/A',
      revenue: financials.total_revenue || financials.revenue || 'N/A',
      netIncome: financials.net_income || 'N/A',
    };
  });

  const gainers = topMovers?.top_gainers?.['1d'] || [];
  const losers = topMovers?.top_losers?.['1d'] || [];

  const prompt = `Kamu adalah Content Creator ahli untuk @sahamfyp \u2014 akun edukasi saham Gen Z dengan 100K+ followers.

Tugasmu: Buat konten carousel Instagram "Market Open" yang engaging, informatif, dan actionable.

## DATA MARKET:
- Tanggal: ${today}
- Data harga: ${yesterday} (hari terakhir IDX buka)
- IHSG: ${ihs?.price || 'N/A'} (${ihs?.change || 'N/A'}%)

## TOP GAINERS (1D):
${gainers.map((g: any) => `- ${g.symbol} (${g.name}): +${g.price_change}%`).join('\n') || 'Tidak ada data'}

## TOP LOSERS (1D):
${losers.map((l: any) => `- ${l.symbol} (${l.name}): ${l.price_change}%`).join('\n') || 'Tidak ada data'}

## WATCHLIST TERPILIH (${candidatesData.length} saham):
${JSON.stringify(candidatesData, null, 2)}

## PROSES SELEKSI:
- Total berita dianalisis: ${newsResults.length}
- Alasan seleksi: ${selection.reasoning}
- Saham di-skip: ${JSON.stringify(selection.skipped)}

## KAMUS FIX (dari docs, jangan ubah):
${JSON.stringify(FIXED_KAMUS, null, 2)}

## FORMAT OUTPUT (JSON VALID - TANPA MARKDOWN):
{
  "handle": "@sahamfyp",
  "badgeText": "OPEN",
  "badgeBgColor": "#14182B",
  "badgeTextColor": "#FFFFFF",
  "date": "${today}",
  "slides": [
    {
      "template": "cover",
      "title": "Selamat Pagi! Market Brief ${today}",
      "description": "Yang perlu lo tau sebelum bel bursa bunyi",
      "visualIcon": "TrendingUp",
      "accent": "#F2A93B"
    },
    {
      "template": "tldr",
      "title": "TL;DR Market",
      "tldrCards": [
        { "icon": "TrendingUp", "text": "IHSG: ${ihs?.price || 'N/A'} (${ihs?.change || 'N/A'}%)" },
        { "icon": "Newspaper", "text": "${candidatesData.length} saham dengan katalis kuat" }
      ],
      "accent": "#F2A93B"
    },
    {
      "template": "kronologi",
      "title": "Proses Seleksi",
      "description": "Dari ${newsResults.length} berita, dipilih ${candidatesData.length} saham dengan katalis paling kuat. ${selection.reasoning}",
      "visualIcon": "Filter",
      "accent": "#F2A93B"
    },
    {{STOCK_SLIDES}},
    {
      "template": "kamus",
      "title": "Kamus Ala Gen Z",
      "intro": "Biar lo ngerti istilah di slide sebelumnya",
      "terms": "GUNAKAN_FIX_KAMUS_DI_ATAS + tambah istilah baru jika ada di slides (maks 6 items total)",
      "note": "Nggak ada angka 'pasti bagus' \u2014 semua musti dibandingin sama rata-rata sektornya.",
      "accent": "#F2A93B"
    },
    {
      "template": "standar",
      "title": "Kesimpulan",
      "description": "${candidatesData.length} saham ini kepilih dari ${newsResults.length} berita \u2014 murni karena katalis korporasi, bukan karena udah naik/turun harga.",
      "visualIcon": "Scale",
      "accent": "#F2A93B"
    },
    {
      "template": "cta",
      "title": "Gimana Menurutmu?",
      "description": "Dari ${candidatesData.length} katalis hari ini, mana yang paling bikin lo penasaran? Drop di komen!",
      "disclaimer": "DYOR \u2014 Konten ini edukasi, bukan ajakan jual/beli. Bedakan 'ramai karena berita' sama 'naik karena kinerja'.",
      "visualIcon": "MessageCircle",
      "accent": "#F2A93B"
    }
  ]
}

## ATURAN:
1. {{STOCK_SLIDES}} harus di-replace dengan array slides (1 per kandidat)
2. Tiap stock slide punya format:
   {
     "template": "stock",
     "ticker": "SYMBOL",
     "companyName": "Nama Perusahaan",
     "tags": ["tag1", "tag2"],
     "newsTitle": "Judul berita",
     "apa": "1 kalimat singkat: apa yang terjadi",
     "kenapa": "1 kalimat singkat: kenapa penting",
     "fundamentals": {
       "per": "nilai",
       "perSector": "rata-rata",
       "perSignal": "\u2705 lebih murah / \u26a0\ufe0f lebih mahal / \u2014 netral",
       "pbv": "nilai",
       "pbvSector": "rata-rata",
       "pbvSignal": "\u2705 lebih murah / \u26a0\ufe0f lebih mahal / \u2014 netral",
       "roe": "nilai",
       "roeSector": "rata-rata",
       "roeSignal": "\u2705 di atas / \u26a0\ufe0f di bawah / \u2014 netral",
       "der": "nilai",
       "derSector": "rata-rata",
       "derSignal": "\u26a0\ufe0f berisiko / \u2014 wajar"
     },
     "tldr": "1 kalimat kesimpulan (bullish/bearish/netral + alasan)"
   }
3. Manfaatkan data TOP GAINERS/LOSERS untuk narasi (contoh: "TINS masih lanjut bullish, dari kemarin sudah naik 4.2%")
4. Slide KAMUS: gunakan data FIX_KAMUS di atas, jangan definisi ulang. Tambah istilah baru hanya jika ada di slides.
5. Kalau fundamental BERTENTANGAN dengan cerita berita (berita bullish tapi valuasi ekstrem/rugi), WAJIB tambah note peringatan di field "warning"
6. Bahasa: Indonesia informal, Gen Z friendly, scannable
7. JANGAN prediksi arah harga \u2014 deskriptif saja
8. Output HANYA JSON valid, tanpa markdown`;

  const result = await model.generateContent(prompt);
  let jsonStr = result.response.text().trim();
  if (jsonStr.startsWith('\`\`\`json')) jsonStr = jsonStr.replace(/^\`\`\`json\s*\n?/, '').replace(/\n?\`\`\`\s*$/, '');
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('[GenerateSlides] Failed to parse Gemini response:', jsonStr);
    throw error;
  }
}

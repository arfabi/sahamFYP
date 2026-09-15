import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateApiKey } from '../_lib/auth.js';
import { generateJson } from '../_lib/llm.js';
import { fetchIndexDaily, fetchFilings, fetchNews, fetchTopMovers, getYesterdayDate, getTodayDate } from '../_lib/sectorsMarket.js';
import { fetchCompanyReport } from '../_lib/sectors.js';
import { supabaseServer } from '../_lib/supabase.js';

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

// ─── Sectors API usage / credit bookkeeping ───────────────────────────────────
const NEWS_TAGS = 'bullish,rights-issue,executive-changes';
const IHSG_WINDOW_DAYS = 10; // fetch a range so weekend/holiday gaps resolve to latest trading day
const TOP_MOVERS_MIN_MCAP_BILLION = 500; // filter micro/penny caps so top movers match real market screens (e.g. Stockbit)
const BASE_CREDITS = 5; // index-daily(1) + news(1) + filings(1) + top-changes gainers+losers(2)
const REPORT_CREDITS_PER_TICKER = 3; // company report sections requested: valuation + financials + peers

/** WIB date `n` days ago as YYYY-MM-DD */
function dateNDaysAgo(n: number): string {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  wib.setDate(wib.getDate() - n);
  return wib.toISOString().split('T')[0];
}

/** Safely coerce a finite number */
function num(v: any): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Average of finite numbers mapped from rows (ignores null/missing) */
function avgOf(rows: any[], fn: (r: any) => number | null): number {
  const vals = rows.map(fn).filter((v): v is number => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

/**
 * Extract peer company rows from Sectors v2 company report `peers` section.
 * v2 structure: peers = [ { peers_data: { companies: [...], group_name } } ]
 * Each company row carries: pe_ttm, pb_mrq, market_cap, net_income, total_equity,
 * total_liabilities, total_revenue, company_name, symbol, group.
 * The "self" row (group includes "self") is excluded so averages reflect real peers only.
 */
function extractPeersCompanies(peersRaw: any): any[] {
  if (!peersRaw) return [];
  const wrappers = Array.isArray(peersRaw) ? peersRaw : [peersRaw];
  const out: any[] = [];
  for (const w of wrappers) {
    const companies = w?.peers_data?.companies;
    if (Array.isArray(companies)) {
      out.push(...companies.filter((c: any) => !(Array.isArray(c.group) && c.group.includes('self'))));
    }
  }
  if (out.length) return out;
  // Fallback: flat array (older shape)
  if (Array.isArray(peersRaw)) return peersRaw;
  return [];
}

/**
 * Flatten Sectors v2 company report into the watchlist metrics.
 * Source fields (from the live API response):
 *  - valuation.last_close_price
 *  - valuation.historical_valuation[last] -> { pe, pb, pe_peer_avg, pb_peer_avg }
 *  - financials.historical_financials[last] -> { revenue, earnings }
 *  - financials.historical_financial_ratio[last] -> { profitability.roe, leverage.debt_to_equity_ratio }
 *  - overview.{ market_cap, sector }, top-level company_name
 *  - peers[].peers_data.companies[] for cross-check averages
 */
interface DigestResult {
  companyName: string | null;
  sector: string | null;
  price: number | null;
  marketCap: number | null;
  PER: number | null;
  PBV: number | null;
  ROE: number | null; // percent
  DER: number | null; // ratio
  revenue: number | null;
  netIncome: number | null;
  avgPER: number;
  avgPBV: number;
  avgROE: number; // percent
  avgDER: number;
  peSignal: string | null;
  pbvSignal: string | null;
  roeSignal: string | null;
  derSignal: string | null;
}

function digestCompanyReport(report: any): DigestResult {
  const empty: DigestResult = {
    companyName: null, sector: null, price: null, marketCap: null,
    PER: null, PBV: null, ROE: null, DER: null, revenue: null, netIncome: null,
    avgPER: 0, avgPBV: 0, avgROE: 0, avgDER: 0,
    peSignal: null, pbvSignal: null, roeSignal: null, derSignal: null,
  };
  if (!report || typeof report !== 'object' || Array.isArray(report)) return empty;

  const valuation = report.valuation || {};
  const financials = report.financials || {};
  const overview = report.overview || {};

  const histVal: any[] = Array.isArray(valuation.historical_valuation) ? valuation.historical_valuation : [];
  const curVal: any = histVal.length ? histVal[histVal.length - 1] : {};

  const histFin: any[] = Array.isArray(financials.historical_financials) ? financials.historical_financials : [];
  const curFin: any = histFin.length ? histFin[histFin.length - 1] : {};

  const histRatio: any[] = Array.isArray(financials.historical_financial_ratio) ? financials.historical_financial_ratio : [];
  const curRatio: any = histRatio.length ? histRatio[histRatio.length - 1] : {};
  const profit = curRatio.profitability || {};
  const leverage = curRatio.leverage || {};

  const peers = extractPeersCompanies(report.peers);
  const avgPER = avgOf(peers, (p) => num(p.pe_ttm));
  const avgPBV = avgOf(peers, (p) => num(p.pb_mrq));
  const avgROERatio = avgOf(peers, (p) => {
    const e = num(p.total_equity);
    const ni = num(p.net_income);
    return e !== null && ni !== null ? ni / e : null;
  });
  const avgDER = avgOf(peers, (p) => {
    const e = num(p.total_equity);
    const tl = num(p.total_liabilities);
    return e !== null && tl !== null ? tl / e : null;
  });

  // Multi-field fallback untuk price: close_price > last_close_price > harga
  const price = num(valuation.close_price) ?? num(valuation.last_close_price) ?? num(overview.last_close_price) ?? num(valuation.price);
  const marketCap = num(overview.market_cap) ?? num(valuation.market_cap);
  // PER: hist_val.pe > hist_val.pe_ttm > valuation.pe_ratio
  const PER = num(curVal.pe) ?? num(curVal.pe_ttm) ?? num(valuation.pe_ratio);
  // PBV: hist_val.pb > hist_val.pb_mrq > valuation.pb_ratio
  const PBV = num(curVal.pb) ?? num(curVal.pb_mrq) ?? num(valuation.pb_ratio);
  const roeRatio = num(profit.roe) ?? num(financials.roe);
  const ROE = roeRatio !== null ? roeRatio * 100 : null;
  const DER = num(leverage.debt_to_equity_ratio) ?? num(financials.debt_to_equity) ?? num(leverage.debt_to_equity);
  const revenue = num(curFin.revenue) ?? num(financials.revenue) ?? num(curFin.total_revenue);
  const netIncome = num(curFin.earnings) ?? num(financials.net_income) ?? num(curFin.net_income);

  // Prefer Sectors' own peer average from the valuation row; fall back to computed peers average
  const sectorPE = num(curVal.pe_peer_avg) ?? avgPER;
  const sectorPBV = num(curVal.pb_peer_avg) ?? avgPBV;
  const sectorROE = avgROERatio * 100;
  const sectorDER = avgDER;

  const peSignal = PER !== null && PER > 0 && sectorPE > 0
    ? (PER < sectorPE ? 'lebih murah' : PER > sectorPE * 1.5 ? 'lebih mahal/berisiko' : 'netral')
    : null;
  const pbvSignal = PBV !== null && PBV > 0 && sectorPBV > 0
    ? (PBV < sectorPBV ? 'lebih murah' : PBV > sectorPBV * 1.5 ? 'lebih mahal/berisiko' : 'netral')
    : null;
  const roeSignal = ROE !== null ? (ROE > sectorROE ? 'di atas sektor' : 'di bawah sektor') : null;
  const derSignal = DER !== null
    ? (DER < 0 ? 'berisiko tinggi' : DER > sectorDER * 1.5 ? 'berisiko tinggi' : 'wajar')
    : null;

  return {
    companyName: report.company_name || null,
    sector: overview.sector || null,
    price, marketCap, PER, PBV, ROE, DER, revenue, netIncome,
    avgPER: sectorPE, avgPBV: sectorPBV, avgROE: sectorROE, avgDER: sectorDER,
    peSignal, pbvSignal, roeSignal, derSignal,
  };
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
    const ihsStart = dateNDaysAgo(IHSG_WINDOW_DAYS);

    // Step 1: Fetch raw data (IHSG + news + filings + top movers)
    const [indexData, newsData, filingsData, topMovers] = await Promise.all([
      fetchIndexDaily(ihsStart, today),
      fetchNews({ start: yesterday, end: today, limit: 15, tags: NEWS_TAGS }),
      fetchFilings({ start: yesterday, end: today }),
      fetchTopMovers({
        classifications: ['top_gainers', 'top_losers'],
        periods: ['1d'],
        nStock: 5,
        minMcapBillion: TOP_MOVERS_MIN_MCAP_BILLION,
      }),
    ]);

    const newsResults = Array.isArray(newsData?.results) ? newsData.results : [];
    const filingsArray = Array.isArray(filingsData) ? filingsData : (filingsData?.data || filingsData?.results || []);

    // IHSG: index-daily returns { index_code, date, price } rows (no change field).
    // Latest trading day = last row of the window; change% computed vs previous row.
    const idxRows = Array.isArray(indexData) ? indexData : [];
    const idxLast = idxRows.length ? idxRows[idxRows.length - 1] : null;
    const idxPrev = idxRows.length > 1 ? idxRows[idxRows.length - 2] : null;
    const lastPrice = idxLast ? num(idxLast.price) : null;
    const prevPrice = idxPrev ? num(idxPrev.price) : null;
    const ihs = idxLast
      ? {
          price: lastPrice,
          prev: prevPrice,
          change: lastPrice !== null && prevPrice !== null ? ((lastPrice - prevPrice) / prevPrice) * 100 : null,
          date: idxLast.date,
        }
      : null;
    const dataDate = ihs?.date || yesterday;

    // Insert main log to database
    const { data: logData, error: logError } = await supabaseServer
      .from('sector_trigger_logs')
      .insert({
        session: 'open',
        trigger_date: today,
        data_date: dataDate,
        ihsg_price: ihs?.price ?? null,
        ihsg_change: ihs?.change ?? null,
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
        const pct = num(g.price_change);
        moversInserts.push({
          log_id: logId,
          classification: 'top_gainers',
          symbol: g.symbol,
          company_name: g.name,
          price_change: pct !== null ? pct * 100 : null // store as percent (Sectors returns decimal: 0.05 = +5%)
        });
      });

      losers.forEach((l: any) => {
        const pct = num(l.price_change);
        moversInserts.push({
          log_id: logId,
          classification: 'top_losers',
          symbol: l.symbol,
          company_name: l.name,
          price_change: pct !== null ? pct * 100 : null
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

    // Step 2: LLM (Sumopod) selects best tickers from news
    const selection = await selectTickersWithLlm(newsResults, filingsArray);
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
        dataDate: dataDate,
        naskah: null,
        message: 'Tidak ada katalis yang cukup kuat hari ini',
        creditsUsed: BASE_CREDITS,
        selection,        logId
      });
    }

    // Step 3: Fetch company reports ONLY for selected tickers
    const candidates = await Promise.all(
      selectedTickers.map(async (ticker: string) => {
        const report = await fetchCompanyReport(ticker, ['valuation', 'financials', 'peers']);
        const relatedNews = newsResults.filter((n: any) =>
          Array.isArray(n?.symbols) && n.symbols.some((s: string) =>
            String(s).replace(/\.JK$/i, '') === String(ticker).replace(/\.JK$/i, '')
          )
        );
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
        const d = digestCompanyReport(c.report);

        return {
          log_id: logId,
          ticker: c.symbol,
          company_name: d.companyName || c.symbol,
          sector: c.sector || d.sector,
          news_title: c.newsTitle,
          news_tags: c.tags,
          news_body: c.newsBody,
          price: d.price,
          market_cap: d.marketCap,
          pe_ratio: d.PER,
          pb_ratio: d.PBV,
          roe: d.ROE,
          der: d.DER,
          revenue: d.revenue,
          net_income: d.netIncome,
          avg_sector_pe: d.avgPER || null,
          avg_sector_pbv: d.avgPBV || null,
          avg_sector_roe: d.avgROE || null,
          avg_sector_der: d.avgDER || null,
          pe_signal: d.peSignal,
          pbv_signal: d.pbvSignal,
          roe_signal: d.roeSignal,
          der_signal: d.derSignal,
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

    // Step 4: LLM (Sumopod) generates final slides
    const naskah = await generateSlidesWithLlm(today, dataDate, ihs, candidates, newsResults, selection, topMovers);

    const totalCredits = BASE_CREDITS + candidates.length * REPORT_CREDITS_PER_TICKER;

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
      dataDate: dataDate,
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

async function selectTickersWithLlm(newsResults: any[], filingsArray: any[]): Promise<{
  tickers: string[];
  reasoning: string;
  skipped: Array<{ ticker: string; reason: string }>;
}> {
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

  try {
    const parsed = await generateJson(prompt);
    return {
      tickers: parsed.tickers || [],
      reasoning: parsed.reasoning || '',
      skipped: parsed.skipped || [],
    };
  } catch (error) {
    console.error('[SelectTickers] Failed to generate/parse LLM response:', error);
    return { tickers: [], reasoning: 'Gagal menganalisis berita', skipped: [] };
  }
}

async function generateSlidesWithLlm(
  today: string,
  dataDate: string,
  ihs: any,
  candidates: any[],
  newsResults: any[],
  selection: { tickers: string[]; reasoning: string; skipped: Array<{ ticker: string; reason: string }> },
  topMovers: any
): Promise<any> {
  const candidatesData = candidates.map((c: any) => {
    const d = digestCompanyReport(c.report);

    return {
      symbol: c.symbol,
      companyName: d.companyName || c.symbol,
      newsTitle: c.newsTitle,
      tags: c.tags,
      sector: c.sector || d.sector,
      harga: d.price !== null ? d.price : 'N/A',
      marketCap: d.marketCap !== null ? d.marketCap : 'N/A',
      PER: d.PER !== null ? d.PER : 'N/A',
      avgSectorPER: d.avgPER > 0 ? d.avgPER.toFixed(1) : 'N/A',
      signalPER: d.peSignal || 'N/A',
      PBV: d.PBV !== null ? d.PBV : 'N/A',
      avgSectorPBV: d.avgPBV > 0 ? d.avgPBV.toFixed(1) : 'N/A',
      signalPBV: d.pbvSignal || 'N/A',
      ROE: d.ROE !== null ? d.ROE.toFixed(1) : 'N/A',
      avgSectorROE: d.avgROE > 0 ? d.avgROE.toFixed(1) : 'N/A',
      signalROE: d.roeSignal || 'N/A',
      DER: d.DER !== null ? d.DER.toFixed(2) : 'N/A',
      avgSectorDER: d.avgDER > 0 ? d.avgDER.toFixed(2) : 'N/A',
      signalDER: d.derSignal || 'N/A',
      revenue: d.revenue !== null ? d.revenue : 'N/A',
      netIncome: d.netIncome !== null ? d.netIncome : 'N/A',
    };
  });

  const gainers = topMovers?.top_gainers?.['1d'] || [];
  const losers = topMovers?.top_losers?.['1d'] || [];

  // Format: "harga terakhir (+nilai perubahan) (persentase%)"
  // Sectors returns price_change as decimal (0.05 = +5%); last_close_price = closing price.
  const fmtMover = (m: any): string => {
    const pct = num(m.price_change);
    const last = num(m.last_close_price);
    if (pct === null || last === null) return `${m.symbol} (${m.name}): data tidak lengkap`;
    const prev = last / (1 + pct); // perubahan nilai dihitung dari harga penutupan
    const valChange = last - prev;
    const sign = valChange >= 0 ? '+' : '';
    return `${m.symbol} (${m.name}): ${last.toLocaleString('id-ID')} (${sign}${valChange.toFixed(0)}) (${sign}${(pct * 100).toFixed(2)}%)`;
  };

  const fmtIhsChange = (c: number | null | undefined): string =>
    c === null || c === undefined ? 'N/A' : `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;

  const prompt = `Kamu adalah Content Creator ahli untuk @sahamfyp \u2014 akun edukasi saham Gen Z dengan 100K+ followers.

Tugasmu: Buat konten carousel Instagram "Market Open" yang engaging, informatif, dan actionable.

## DATA MARKET:
- Tanggal: ${today}
- Data harga: ${dataDate} (hari terakhir IDX buka)
- IHSG: ${ihs?.price ?? 'N/A'} (${fmtIhsChange(ihs?.change)})

## TOP GAINERS (1D):
${gainers.map((g: any) => `- ${fmtMover(g)}`).join('\n') || 'Tidak ada data'}

## TOP LOSERS (1D):
${losers.map((l: any) => `- ${fmtMover(l)}`).join('\n') || 'Tidak ada data'}

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

  try {
    return await generateJson(prompt);
  } catch (error) {
    console.error('[GenerateSlides] Failed to generate/parse LLM response:', error);
    throw error;
  }
}

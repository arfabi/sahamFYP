import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateApiKey } from '../_lib/auth.js';
import { generateJson } from '../_lib/llm.js';
import { fetchIndexDaily, fetchFilings, fetchNews, fetchTopMovers, fetchDaily, getYesterdayDate, getTodayDate } from '../_lib/sectorsMarket.js';
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
const TECHNICAL_CREDITS_PER_TICKER = 1; // GET /v2/daily/{symbol}/ per ticker lolos LLM

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

/** Format tanggal ke bahasa Indonesia: "Rabu, 16 September 2026" */
function formatDateIndonesian(dateStr: string): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  try {
    const d = new Date(dateStr + 'T00:00:00+07:00');
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

/** Ekstrak domain dari URL berita: "https://market.bisnis.com/..." → "market.bisnis.com" */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'sector.app';
  }
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
 * Hitung metrik teknikal dari riwayat GET /v2/daily/{symbol}/.
 * Semua angka mentah (number), formatting (+/-/%/Rp) urusan display & LLM.
 * Response diasumsikan array rows { date, close|price|last_close_price, volume }
 * urutan apapun — di-sort ascending by date dulu.
 */
interface TechnicalResult {
  last: number | null;
  ma20: number | null;
  ma50: number | null;
  ma200: number | null;
  crossSignal: string | null; // "Golden Cross 🚀" | "Death Cross ☠️" | "Bullish Trend" | "Bearish Trend" | "Neutral"
  chg1d: number | null;
  chg5d: number | null;
  chg20d: number | null;
  high52w: number | null;
  pctFromHigh52w: number | null;
  lastVolume: number | null;
  avgVol20: number | null;
  volumeSignal: 'rame' | 'sepi' | 'normal' | null;
  asOf: string | null;
  windowDays: number;
}

function pickClose(r: any): number | null {
  return num(r?.close) ?? num(r?.close_price) ?? num(r?.last_close_price) ?? num(r?.price);
}

function pickVolume(r: any): number | null {
  return num(r?.volume) ?? num(r?.total_volume) ?? num(r?.volume_traded);
}

function chgPct(last: number | null, prev: number | null): number | null {
  if (last === null || prev === null || prev === 0) return null;
  return ((last - prev) / Math.abs(prev)) * 100;
}

function computeTechnical(dailyRows: any[]): TechnicalResult {
  const empty: TechnicalResult = {
    last: null, ma20: null, ma50: null, ma200: null, crossSignal: null,
    chg1d: null, chg5d: null, chg20d: null, high52w: null, pctFromHigh52w: null,
    lastVolume: null, avgVol20: null, volumeSignal: null, asOf: null, windowDays: 0,
  };
  const rows = (Array.isArray(dailyRows) ? dailyRows : [])
    .map((r: any) => ({ date: r?.date || r?.trading_date || null, close: pickClose(r), volume: pickVolume(r) }))
    .filter((r) => r.date && r.close !== null)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (!rows.length) return empty;

  const closes = rows.map((r) => r.close as number);
  const last = closes[closes.length - 1];
  const at = (n: number) => (closes.length > n ? closes[closes.length - 1 - n] : null);
  
  const ma20 = closes.length >= 20
    ? closes.slice(-20).reduce((a, b) => a + b, 0) / 20
    : null;
  const ma50 = closes.length >= 50
    ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50
    : null;
  const ma200 = closes.length >= 200
    ? closes.slice(-200).reduce((a, b) => a + b, 0) / 200
    : null;

  // Previous MA values for Golden/Death Cross detection
  const prevCloses = closes.slice(0, -1);
  const prevMa20 = prevCloses.length >= 20
    ? prevCloses.slice(-20).reduce((a, b) => a + b, 0) / 20
    : null;
  const prevMa50 = prevCloses.length >= 50
    ? prevCloses.slice(-50).reduce((a, b) => a + b, 0) / 50
    : null;

  let crossSignal: string | null = null;
  if (ma20 !== null && ma50 !== null) {
    if (prevMa20 !== null && prevMa50 !== null && prevMa20 <= prevMa50 && ma20 > ma50) {
      crossSignal = 'Golden Cross 🚀 (Sinyal Bullish Kuat)';
    } else if (prevMa20 !== null && prevMa50 !== null && prevMa20 >= prevMa50 && ma20 < ma50) {
      crossSignal = 'Death Cross ☠️ (Sinyal Downtrend)';
    } else if (last > ma20 && ma20 > ma50) {
      crossSignal = 'Bullish Trend 🟢 (Di atas MA20 & MA50)';
    } else if (last < ma20 && ma20 < ma50) {
      crossSignal = 'Bearish Trend 🔴 (Di bawah MA20 & MA50)';
    } else {
      crossSignal = 'Konsolidasi 🟡';
    }
  }

  const windowRows = rows.slice(-252);
  const high52w = windowRows.length ? Math.max(...windowRows.map((r) => r.close as number)) : null;
  const pctFromHigh52w = last !== null && high52w !== null && high52w > 0
    ? ((last - high52w) / high52w) * 100
    : null;

  const vols = rows.map((r) => r.volume).filter((v): v is number => v !== null);
  const lastVolume = vols.length ? vols[vols.length - 1] : null;
  const avgVol20 = vols.length >= 20
    ? vols.slice(-20).reduce((a, b) => a + b, 0) / 20
    : null;
  const volumeRatio = lastVolume !== null && avgVol20 !== null && avgVol20 > 0
    ? (lastVolume / avgVol20).toFixed(1)
    : null;
  const volumeSignal: TechnicalResult['volumeSignal'] =
    lastVolume === null || avgVol20 === null || avgVol20 === 0
      ? null
      : lastVolume > avgVol20 * 1.5 ? 'rame'
      : lastVolume < avgVol20 * 0.7 ? 'sepi'
      : 'normal';

  // Auto-generate Vibe Check & Trading Trigger if not present
  const chg1dVal = chgPct(last, at(1));
  const vibeCheck = crossSignal?.includes('Golden Cross') || crossSignal?.includes('Bullish')
    ? '🔥 Sinyal Bullish! Momentum akumulasi kuat & di atas garis MA support.'
    : crossSignal?.includes('Death Cross') || crossSignal?.includes('Bearish')
    ? '⚠️ Hati-hati! Tren sedang tertekan di bawah MA20/MA50.'
    : '🟡 Konsolidasi netral. Menunggu breakout batas MA20/MA50.';

  const trigger = `Support terdekat MA20 di Rp ${ma20 ? Math.round(ma20) : '-'}, Resistance 52W High di Rp ${high52w ? Math.round(high52w) : '-'}.${volumeRatio ? ` Volume hari ini ${volumeRatio}x dari rata-rata 20 hari.` : ''}`;

  return {
    last,
    ma20: ma20 ? Number(ma20.toFixed(2)) : null,
    ma50: ma50 ? Number(ma50.toFixed(2)) : null,
    ma200: ma200 ? Number(ma200.toFixed(2)) : null,
    crossSignal,
    chg1d: chg1dVal !== null ? Number(chg1dVal.toFixed(2)) : null,
    chg5d: chgPct(last, at(5)) !== null ? Number(chgPct(last, at(5))!.toFixed(2)) : null,
    chg20d: chgPct(last, at(20)) !== null ? Number(chgPct(last, at(20))!.toFixed(2)) : null,
    high52w,
    pctFromHigh52w: pctFromHigh52w !== null ? Number(pctFromHigh52w.toFixed(2)) : null,
    lastVolume,
    avgVol20: avgVol20 ? Math.round(avgVol20) : null,
    volumeSignal,
    asOf: rows[rows.length - 1].date,
    windowDays: rows.length,
    vibeCheck,
    trigger,
  } as any;
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

  const peSignal = PER === null
    ? null
    : PER < 0
    ? '⚠️ Rugi bersih (PER tidak bermakna)'
    : sectorPE > 0
    ? (PER < sectorPE ? '✅ Lebih murah dari sektor' : PER > sectorPE * 1.5 ? '⚠️ Lebih mahal dari sektor' : '— Wajar')
    : '— Wajar';

  const pbvSignal = PBV === null
    ? null
    : PBV < 0
    ? '🔴 RED FLAG: Ekuitas Negatif (Defisit Modal)'
    : sectorPBV > 0
    ? (PBV < sectorPBV ? '✅ Lebih diskon dari sektor' : PBV > sectorPBV * 1.5 ? '⚠️ Mahal / Premium' : '— Wajar')
    : '— Wajar';

  const roeSignal = ROE === null
    ? null
    : PBV !== null && PBV < 0
    ? '⚠️ Tidak reliable (Modal Negatif)'
    : sectorROE !== null
    ? (ROE > sectorROE ? '✅ Lebih efisien dari sektor' : '⚠️ Di bawah sektor')
    : '— Netral';

  const derSignal = DER === null
    ? null
    : DER < 0 || (PBV !== null && PBV < 0)
    ? '🔴 RED FLAG: Utang Melebihi Aset'
    : sectorDER > 0
    ? (DER > sectorDER * 1.5 ? '⚠️ Beban utang tinggi' : '✅ Utang terjaga/wajar')
    : '— Wajar';

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
      fetchIndexDaily(ihsStart), // Omit end date to avoid timezone future date error
      fetchNews({ start: yesterday, limit: 15, tags: NEWS_TAGS }),
      fetchFilings({ start: yesterday }),
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
        body: (n as any).body || null,
        tags: n.tags || [],
        symbols: n.symbols || [],
        sector: n.sector || null,
        sub_sectors: (n as any).sub_sector || [],
        dimensions: (n as any).dimension || null,
        source_url: n.source || null,
        thumbnail_url: (n as any).thumbnail || null,
        timestamp: n.timestamp || null,
        published_at: n.timestamp || null,
        raw: n,
        is_selected: false
      }));

      const { error: newsError } = await supabaseServer
        .from('sector_trigger_news')
        .upsert(newsInserts, { onConflict: 'source_url', ignoreDuplicates: true });

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
        const pct = num(g.price_change); // Sectors returns decimal, e.g. 0.2483 = +24.83%
        // Sectors API top-movers may return last_close_price as previous close or current close depending on market session
        const last = num(g.close_price) ?? num(g.last_close_price) ?? num(g.price) ?? num(g.last);
        let pointChange: number | null = null;
        if (pct !== null && last !== null) {
          // If last_close_price from Sectors API was actually previous close (e.g. 372) and change is +24.83%:
          // Current price = prev * (1 + pct) = 372 * 1.2483 = 464 (or if last is current price 480, prev = 480 / 1.2483 = 384)
          // We calculate point change = Math.round(last * pct)
          pointChange = Math.round(last * pct);
        }
        moversInserts.push({
          log_id: logId,
          classification: 'top_gainers',
          symbol: g.symbol,
          company_name: g.name,
          price_change: pct !== null ? pct * 100 : null,
          last_price: last,
          point_change: pointChange,
        });
      });

      losers.forEach((l: any) => {
        const pct = num(l.price_change);
        const last = num(l.close_price) ?? num(l.last_close_price) ?? num(l.price) ?? num(l.last);
        let pointChange: number | null = null;
        if (pct !== null && last !== null) {
          pointChange = Math.round(last * pct);
        }
        moversInserts.push({
          log_id: logId,
          classification: 'top_losers',
          symbol: l.symbol,
          company_name: l.name,
          price_change: pct !== null ? pct * 100 : null,
          last_price: last,
          point_change: pointChange,
        });
      });

      if (moversInserts.length > 0) {
        const { error: moversError } = await supabaseServer
          .from('sector_trigger_movers')
          .insert(moversInserts);

        if (moversError) {
          console.error('[SectorTrigger Open] Movers insert error:', moversError);
          // Fallback if last_price or point_change columns don't exist yet in Supabase schema
          console.warn('[SectorTrigger Open] Retrying movers insert without extra point columns...');
          const fallbackMovers = moversInserts.map(({ last_price, point_change, ...rest }: any) => rest);
          const { error: retryErr } = await supabaseServer
            .from('sector_trigger_movers')
            .insert(fallbackMovers);
          if (retryErr) {
            console.error('[SectorTrigger Open] Fallback movers insert failed:', retryErr);
          } else {
            console.log('[SectorTrigger Open] Fallback movers insert succeeded!');
          }
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

    // Step 3: Fetch company reports + daily teknikal ONLY for selected tickers
    const techStart = dateNDaysAgo(400); // window ~1 thn supaya MA20 + high52w valid
    const candidates = await Promise.all(
      selectedTickers.map(async (ticker: string) => {
        const [report, dailyRaw] = await Promise.all([
          fetchCompanyReport(ticker, ['valuation', 'financials', 'peers']),
          fetchDaily(ticker, techStart).catch((e: any) => {
            console.warn(`[SectorTrigger Open] fetchDaily gagal untuk ${ticker}:`, e?.message || e);
            return [];
          }),
        ]);
        const technical = computeTechnical(Array.isArray(dailyRaw) ? dailyRaw : (dailyRaw?.data || dailyRaw?.results || []));
        const relatedNews = newsResults.filter((n: any) =>
          Array.isArray(n?.symbols) && n.symbols.some((s: string) =>
            String(s).replace(/\.JK$/i, '') === String(ticker).replace(/\.JK$/i, '')
          )
        );
        return {
          symbol: ticker,
          newsTitle: relatedNews[0]?.title || 'N/A',
          newsBody: relatedNews[0]?.body || '',
          newsSource: (relatedNews[0] as any)?.source || '',
          tags: relatedNews[0]?.tags || [],
          sector: relatedNews[0]?.sector || null,
          report,
          technical,
        };
      })
    );

    // Insert candidates to database
    if (logId && candidates.length > 0) {
      const candidatesInserts = candidates.map((c: any) => {
        const d = digestCompanyReport(c.report);

        // Sanitize signal text for DB CHECK constraints specifically per column constraint rules
        const sanitizePeSignal = (sig: string | null) => {
          if (!sig) return null;
          if (sig.includes('diskon') || sig.includes('murah')) return 'lebih murah';
          if (sig.includes('Rugi') || sig.includes('mahal') || sig.includes('RED FLAG') || sig.includes('berisiko')) return 'lebih mahal/berisiko';
          return 'netral';
        };

        const sanitizePbvSignal = (sig: string | null) => {
          if (!sig) return null;
          if (sig.includes('diskon') || sig.includes('murah')) return 'lebih murah';
          if (sig.includes('Rugi') || sig.includes('mahal') || sig.includes('RED FLAG') || sig.includes('berisiko') || sig.includes('Negatif') || sig.includes('Defisit') || sig.includes(' reliable')) return 'lebih mahal/berisiko';
          return 'netral';
        };

        const sanitizeRoeSignal = (sig: string | null) => {
          if (!sig) return null;
          if (sig.includes('efisien') || sig.includes('di atas') || sig.includes('tinggi') || sig.includes('Bagus')) return 'di atas sektor';
          if (sig.includes('bawah') || sig.includes('rendah') || sig.includes('Rugi') || sig.includes('Negatif')) return 'di bawah sektor';
          return 'netral';
        };

        const sanitizeDerSignal = (sig: string | null) => {
          if (!sig) return null;
          if (sig.includes('RED FLAG') || sig.includes('berisiko') || sig.includes('Utang Melebihi') || sig.includes('Negatif') || sig.includes('Tinggi')) return 'berisiko tinggi';
          return 'wajar';
        };

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
          pe_signal: sanitizePeSignal(d.peSignal),
          pbv_signal: sanitizePbvSignal(d.pbvSignal),
          roe_signal: sanitizeRoeSignal(d.roeSignal),
          der_signal: sanitizeDerSignal(d.derSignal),
          technical_json: c.technical || null,
          enrichment_json: c.report
        };
      });

      const { error: candidatesError } = await supabaseServer
        .from('sector_trigger_candidates')
        .insert(candidatesInserts);

      if (candidatesError) {
        console.error('[SectorTrigger Open] Candidates insert error:', candidatesError);
        // Fallback retry with basic fields only if columns fail or schema differs
        console.warn('[SectorTrigger Open] Retrying insert with sanitized candidate fields...');
        const fallbackInserts = candidatesInserts.map((item: any) => ({
          log_id: item.log_id,
          ticker: item.ticker,
          company_name: item.company_name,
          sector: item.sector,
          news_title: item.news_title,
          news_tags: item.news_tags,
          news_body: item.news_body,
          price: item.price,
          market_cap: item.market_cap,
          pe_ratio: item.pe_ratio,
          pb_ratio: item.pb_ratio,
          roe: item.roe,
          der: item.der,
          pe_signal: item.pe_signal,
          pbv_signal: item.pbv_signal,
          roe_signal: item.roe_signal,
          der_signal: item.der_signal,
        }));
        const { error: retryErr } = await supabaseServer
          .from('sector_trigger_candidates')
          .insert(fallbackInserts);
        if (retryErr) {
          console.error('[SectorTrigger Open] Fallback insert also failed:', retryErr);
        } else {
          console.log('[SectorTrigger Open] Fallback insert succeeded!');
        }
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

    const totalCredits = BASE_CREDITS + candidates.length * (REPORT_CREDITS_PER_TICKER + TECHNICAL_CREDITS_PER_TICKER);

    // Update log with final credits and naskah JSON
    if (logId) {
      await supabaseServer
        .from('sector_trigger_logs')
        .update({
          credits_used: totalCredits,
          naskah_json: naskah || null
        })
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

  const prompt = `Kamu adalah Chief Investment Officer (CIO) senior yang menyeleksi kandidat saham paling berpotensi dan edukatif untuk konten @sahamfyp.

Tugasmu: Dari daftar berita berikut, pilih 1 hingga maksimal 4 saham terbaik untuk dimasukkan ke Watchlist hari ini.

## KRITERIA SELEKSI & BOBOT KATALIS:
1. **Prioritas Utama (Skor 8-10)**: M&A / Akuisisi Pengendali Baru, Rights Issue / Private Placement Besar, Turnaround Kinerja Laba, atau Isu Hukum/Manajemen Krusial.
2. **Prioritas Kedua (Skor 5-7)**: Dividen Jumbo di luar perkiraan, Kontrak/Ekspansi Baru Signifikan.
3. **Penyaringan Kualitatif (Hard Filter)**:
   - JANGAN pilih saham gocap / penny stock / emiten tidur (harga di bawah Rp 50 / Notasi Khusus FCA tanpa likuiditas).
   - JANGAN pilih saham yang beritanya hanya klaim sentimen tanpa katalis aksi korporasi konkret.
   - Jangan pilih emiten yang beritanya hanya laporan keuangan rutin tanpa kejutan (surprise).
   - Usahakan DIVERSIFIKASI (maksimal 1-2 emiten per sektor).

## KOMBINASI WATCHLIST YANG IDEAL:
- 2 Saham Katalis Positif (Bullish/Growth/M&A)
- 1 Saham Katalis Risk / Warning (seperti isu KPK/manajemen) sebagai edukasi kewaspadaan pembaca
- 1 Saham Value / Dividend / Turnaround

## DAFTAR BERITA (total: ${newsResults.length}):
${JSON.stringify(newsSummary, null, 2)}

## FORMAT OUTPUT (JSON VALID):
{
  "tickers": ["TICKER1", "TICKER2"],
  "reasoning": "Alasan singkat mengapa memilih saham-saham ini (maks 50 kata)",
  "skipped": [
    { "ticker": "XXX", "reason": "Alasan spesifik kenapa di-skip" }
  ]
}

Output HANYA JSON, tanpa markdown.`;

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
    const tech = c.technical || {};

    return {
      symbol: c.symbol,
      companyName: d.companyName || c.symbol,
      newsTitle: c.newsTitle,
      newsBody: c.newsBody,
      sumberBeritaDomain: extractDomain((c as any).newsSource || ''),
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
      technicalData: {
        last: tech.last || d.price,
        ma20: tech.ma20 ? Math.round(tech.ma20) : 'N/A',
        ma50: tech.ma50 ? Math.round(tech.ma50) : 'N/A',
        ma200: tech.ma200 ? Math.round(tech.ma200) : 'N/A',
        crossSignal: tech.crossSignal || 'N/A',
        chg1d: tech.chg1d !== null && tech.chg1d !== undefined ? `${tech.chg1d >= 0 ? '+' : ''}${tech.chg1d.toFixed(1)}%` : 'N/A',
        chg5d: tech.chg5d !== null && tech.chg5d !== undefined ? `${tech.chg5d >= 0 ? '+' : ''}${tech.chg5d.toFixed(1)}%` : 'N/A',
        chg20d: tech.chg20d !== null && tech.chg20d !== undefined ? `${tech.chg20d >= 0 ? '+' : ''}${tech.chg20d.toFixed(1)}%` : 'N/A',
        pctFromHigh52w: tech.pctFromHigh52w !== null && tech.pctFromHigh52w !== undefined ? `${tech.pctFromHigh52w >= 0 ? '+' : ''}${tech.pctFromHigh52w.toFixed(1)}%` : 'N/A',
        volumeSignal: tech.volumeSignal || 'normal',
      }
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

  const todayIndonesian = formatDateIndonesian(today);
  const dataDateIndonesian = formatDateIndonesian(dataDate);

  // Pre-format top movers untuk slide market
  const gainersData = gainers.slice(0, 5).map((g: any) => {
    const pct = num(g.price_change);
    const last = num(g.close_price) ?? num(g.last_close_price) ?? num(g.price) ?? num(g.last);
    return { symbol: g.symbol, name: g.name || g.company_name || g.symbol, price: last, changePct: pct !== null ? Number((pct * 100).toFixed(2)) : null };
  });
  const losersData = losers.slice(0, 5).map((l: any) => {
    const pct = num(l.price_change);
    const last = num(l.close_price) ?? num(l.last_close_price) ?? num(l.price) ?? num(l.last);
    return { symbol: l.symbol, name: l.name || l.company_name || l.symbol, price: last, changePct: pct !== null ? Number((pct * 100).toFixed(2)) : null };
  });

  const prompt = `Kamu adalah Content Creator & Analyst ahli untuk @sahamfyp — akun edukasi saham Gen Z dengan 100K+ followers.

Tugasmu: Buat konten carousel Instagram "Market Open" yang engaging, informatif, dan mudah dipahami Gen Z yang BELUM TENTU paham semua istilah saham.
ATURAN UTAMA: Gunakan analogi sehari-hari, bahasa santai, penjelasan tidak menggurui. Pembaca adalah anak muda yang baru belajar investasi.

## DATA MARKET:
- Tanggal hari ini: ${today} (${todayIndonesian})
- Data harga (hari terakhir IDX buka): ${dataDate} (${dataDateIndonesian})
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

## FORMAT OUTPUT (JSON VALID - TANPA MARKDOWN):
{
  "handle": "@sahamfyp",
  "badgeText": "OPEN",
  "date": "${today}",
  "dateIndonesia": "${todayIndonesian}",
  "caption": {
    "instagram": "Caption Instagram menarik (emoji + ringkasan katalis + CTA + hashtag)",
    "tiktok": "Caption TikTok singkat & catchy, maks 3 kalimat"
  },
  "slides": [
    {
      "template": "cover",
      "handle": "@sahamfyp",
      "date": "${today}",
      "dateIndonesia": "${todayIndonesian}",
      "newsCount": ${newsResults.length},
      "watchlistCount": ${candidatesData.length}
    },
    {
      "template": "tldr",
      "handle": "@sahamfyp",
      "date": "${today}",
      "dateIndonesia": "${todayIndonesian}",
      "title": "TL;DR Market Hari Ini",
      "tldrCards": [
        { "icon": "TrendingUp", "text": "IHSG ${ihs?.price ?? 'N/A'} (${fmtIhsChange(ihs?.change)}) — [kondisi singkat 5 kata]" },
        { "icon": "Flame", "text": "Gainer: [TICKER] ([Nama]) +XX.XX%" },
        { "icon": "TrendingDown", "text": "Loser: [TICKER] ([Nama]) -XX.XX%" },
        { "icon": "Newspaper", "text": "[Headline singkat berita saham #1, maks 8 kata]" },
        { "icon": "Newspaper", "text": "[Headline singkat berita saham #2, maks 8 kata]" },
        { "icon": "Newspaper", "text": "[Headline singkat berita saham #3, maks 8 kata]" },
        { "icon": "Newspaper", "text": "[Headline singkat berita saham #4, maks 8 kata]" },
        { "icon": "Eye", "text": "Watchlist: ${candidatesData.map((c: any) => c.symbol).join(', ')}" }
      ]
    },
    {
      "template": "market",
      "handle": "@sahamfyp",
      "date": "${today}",
      "dateIndonesia": "${todayIndonesian}",
      "dataDate": "${dataDate}",
      "dataDateIndonesia": "${dataDateIndonesian}",
      "title": "Kondisi Market Kemarin",
      "ihsg": { "price": ${ihs?.price ?? null}, "changePct": ${ihs?.change ?? null} },
      "topGainers": ${JSON.stringify(gainersData)},
      "topLosers": ${JSON.stringify(losersData)}
    },
    {{STOCK_SLIDES}},
    {
      "template": "matrix",
      "handle": "@sahamfyp",
      "date": "${today}",
      "dateIndonesia": "${todayIndonesian}",
      "title": "Kesimpulan Watchlist Hari Ini",
      "subtitle": "Framework: Matrix Fundamental × Teknikal",
      "stocks": [
        { "ticker": "[TICKER1]", "quadrant": "q1" },
        { "ticker": "[TICKER2]", "quadrant": "q2" }
      ],
      "note": "Ini framework analisis, bukan saran beli/jual. DYOR & konsultasi financial advisor!"
    },
    {
      "template": "kamus",
      "handle": "@sahamfyp",
      "date": "${today}",
      "dateIndonesia": "${todayIndonesian}",
      "title": "Kamus Ala Gen Z",
      "subtitle": "Biar lo ngerti istilah di slide sebelumnya 👆",
      "items": ${JSON.stringify(FIXED_KAMUS)}
    },
    {
      "template": "cta",
      "handle": "@sahamfyp",
      "date": "${today}",
      "dateIndonesia": "${todayIndonesian}",
      "title": "Gimana Menurutmu?",
      "description": "Dari ${candidatesData.length} katalis hari ini, mana yang paling bikin lo penasaran? Drop di komen! 👇",
      "disclaimer": "DYOR — Konten ini murni edukasi, bukan ajakan jual/beli saham.",
      "visualIcon": "MessageCircle"
    }
  ]
}

## ATURAN TAMBAHAN:
1. {{STOCK_SLIDES}} wajib di-replace dengan array slide saham (1 slide JSON per kandidat, urutan sesuai watchlist)
2. Format tiap stock slide PERSIS sebagai berikut:
   {
     "template": "stock",
     "handle": "@sahamfyp",
     "date": "${today}",
     "dateIndonesia": "${todayIndonesian}",
     "ticker": "SYMBOL.JK",
     "companyName": "PT Nama Tbk",
     "sector": "Nama Sektor",
     "tags": ["tag"],
     "newsTitle": "Judul berita asli",
     "newsDescription": "Ceritakan isi berita dalam 2-3 kalimat Bahasa Indonesia santai, kayak ngobrol sama temen",
     "apa": "1 kalimat: fakta apa yang terjadi (tanpa jargon)",
     "kenapa": "1 kalimat: kenapa ini penting untuk investor",
     "dampak": "1 kalimat: dampak konkret event ini untuk bisnis/investor ke depan (positif atau negatif)",
     "sumberBerita": "[domain] (via Sector.app News)",
     "hargaTerakhir": 13750,
     "fundamentals": {
       "sector": "Nama Sektor",
       "per": "7.71x", "perSector": "9.80x",
       "perSignal": "✅ Lebih murah dari rata-rata sektor / ⚠️ Lebih mahal / ⚠️ Rugi bersih",
       "pbv": "0.46x", "pbvSector": "0.80x",
       "pbvSignal": "✅ Lebih diskon / ⚠️ Mahal/Premium / 🔴 RED FLAG (Ekuitas Negatif)",
       "roe": "5.01%", "roeSector": "13.40%",
       "roeSignal": "✅ Di atas sektor (efisien) / ⚠️ Di bawah sektor",
       "der": "4.86x", "derSector": "5.65x",
       "derSignal": "✅ Utang wajar / ⚠️ Beban utang tinggi / 🔴 RED FLAG",
       "narasiFundamental": "Narasi 2 kalimat Gen Z-friendly: jelaskan fundamental vs sektor pakai analogi/perbandingan konkret. Contoh: 'BNII ini kayak beli barang branded dengan harga diskon \u2014 PER 7.71x lebih murah dari rata-rata bank (9.80x). Tapi efisiensinya (ROE 5.01%) masih di bawah rata-rata peer, artinya modalnya belum diputar seoptimal bank lain.'"
     },
     "technical": {
       "last": 13750,
       "ma20": 11120,
       "ma50": 10500,
       "narasiMa20": "1 kalimat penjelasan awam MA20 dengan angka Rp konkret. Contoh: 'MA 20 Rp 11.120 = rata-rata harga 20 hari terakhir \u2014 ini batas support pendek.'",
       "narasiMa50": "1 kalimat penjelasan awam MA50 dengan angka Rp konkret. Contoh: 'MA 50 Rp 10.500 = rata-rata 50 hari, bantal lebih kuat \u2014 kalau jebol ini, tren bisa berbalik.'",
       "crossSignal": "Isi sesuai data: Golden Cross \ud83d\ude80 / Death Cross \u2620\ufe0f / Bullish Trend \ud83d\udfe2 / Bearish Trend \ud83d\udd34 / Konsolidasi \ud83d\udfe1",
       "narasiVibe": "1-2 kalimat: jelaskan arti sinyal ini dalam bahasa awam + analogi. Contoh Konsolidasi: 'Konsolidasi = harga lagi jalan di tempat kayak motor nunggu lampu hijau. Belum ada arah yang jelas, bisa naik atau turun tergantung siapa yang gerak duluan.'",
       "narasiHargaAksi": "2-3 kalimat: posisi harga vs MA20/MA50, kapan ideal beli, kapan wait & see, kapan waspada. Pakai angka Rp konkret.",
       "chg1d": "+5.0%", "chg5d": "-8.8%", "chg20d": "+96.4%",
       "pctFromHigh52w": "-8.8%",
       "volumeSignal": "rame/sepi/normal",
       "vibeCheck": "1 kalimat vibe check catchy + emoji",
       "trigger": "1 kalimat: key support & resistance level"
     },
     "tldrSaham": {
       "dayTrading": "1 kalimat rekomendasi untuk day trader, dengan angka entry ideal jika memungkinkan",
       "swing": "1 kalimat untuk swing trader (2-4 minggu)",
       "investasi": "1 kalimat untuk investor jangka panjang (6+ bulan)"
     },
     "warning": "1 kalimat risiko kritis (string kosong jika tidak ada)"
   }
3. Kuadran Matrix untuk setiap saham di slide matrix:
   - q1 (🟢) = Fund Bagus + Tech Bagus = kandidat kuat semua horizon
   - q2 (🟡) = Fund Bagus + Tech Jelek = long term/value, jangan day trade dulu
   - q3 (🟠) = Fund Jelek + Tech Bagus = spekulatif/momentum jangka pendek only
   - q4 (🔴) = Fund Jelek + Tech Jelek = hindari / extra hati-hati
   Fund Bagus: minimal 2 dari 3 kondisi (PER < sektor, PBV < sektor, ROE > sektor)
   Tech Bagus: crossSignal mengandung 'Golden Cross' atau 'Bullish'
4. Format sumberBerita: "[domain dari URL berita] (via Sector.app News)"
5. Bahasa: Indonesia informal Gen Z, analogikan semua istilah teknis, TIDAK menggurui
6. JANGAN prediksi arah harga \u2014 deskriptif & analitik saja
7. Output HANYA JSON valid, tanpa markdown, tanpa komentar`;


  try {
    return await generateJson(prompt, { maxTokens: 8192 });
  } catch (error) {
    console.error('[GenerateSlides] Failed to generate/parse LLM response:', error);
    throw error;
  }
}

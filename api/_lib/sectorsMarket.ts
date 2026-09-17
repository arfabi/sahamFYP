// Server-side Sectors.app API client for SectorTrigger
// Fokus ke market-wide data (IHSG, top movers, filings, brokers)

const SECTORS_API_KEY = process.env.SECTORS_API_KEY || '';
const SECTORS_BASE = 'https://api.sectors.app/v2';
const SECTORS_BASE_V1 = 'https://api.sectors.app/v1';

async function fetchSectors(endpoint: string, params?: Record<string, any>) {
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

// ─── Index Daily (IHSG) — 1 credit ────────────────────────────────────────────
export async function fetchIndexDaily(start?: string, end?: string) {
  const p: Record<string, string> = {};
  if (start) p.start = start;
  if (end) p.end = end;
  return fetchSectors('/index-daily/ihsg/', p);
}

// ─── Top Company Movers — 1 credit per classification+period combo ─────────────
export async function fetchTopMovers(opts?: {
  classifications?: ('top_gainers' | 'top_losers')[];
  periods?: ('1d' | '7d' | '14d' | '30d' | '365d')[];
  nStock?: number;
  minMcapBillion?: number;
}) {
  const p: Record<string, string | number | undefined> = {};
  if (opts?.classifications?.length) p.classifications = opts.classifications.join(',');
  if (opts?.periods?.length) p.periods = opts.periods.join(',');
  if (opts?.nStock) p.n_stock = opts.nStock;
  if (opts?.minMcapBillion !== undefined && opts.minMcapBillion >= 1) { p.min_mcap_billion = Math.floor(opts.minMcapBillion); }
  return fetchSectors('/companies/top-changes/', p);
}

// ─── Insider Filings — 1 credit ──────────────────────────────────────────────
export async function fetchFilings(opts?: {
  start?: string;
  end?: string;
  symbol?: string;
}) {
  const p: Record<string, string> = {};
  if (opts?.start) p.start = opts.start;
  if (opts?.end) p.end = opts.end;
  if (opts?.symbol) p.symbol = opts.symbol;
  return fetchSectors('/filings/', p);
}

// ─── Daily Transaction (per stock) — 1 credit ─────────────────────────────────
// GET /v2/daily/{symbol}/ — riwayat harga harian. Butuh window ~365d ke belakang
// supaya MA20 + high52w valid. Response: array rows { date, close, volume, ... }.
export async function fetchDaily(symbol: string, start?: string, end?: string) {
  const p: Record<string, string> = {};
  if (start) p.start = start;
  if (end) p.end = end;
  return fetchSectors(`/daily/${symbol}/`, p);
}

// ─── Foreign Flow Top — 2 credits ──────────────────────────────────────────────
export async function fetchForeignFlowTop(opts?: {
  start?: string;
  end?: string;
  nStock?: number;
}) {
  const p: Record<string, string | number | undefined> = {};
  if (opts?.start) p.start = opts.start;
  if (opts?.end) p.end = opts.end;
  if (opts?.nStock) p.n_stock = opts.nStock;
  return fetchSectors('/foreign-flow/top/', p);
}

// ─── Foreign Net Transactions Top — 2 credits ─────────────────────────────────
export async function fetchForeignNetTop(opts?: {
  start?: string;
  end?: string;
  nStock?: number;
}) {
  const p: Record<string, string | number | undefined> = {};
  if (opts?.start) p.start = opts.start;
  if (opts?.end) p.end = opts.end;
  if (opts?.nStock) p.n_stock = opts.nStock;
  return fetchSectors('/foreign-net-transactions/top/', p);
}

// ─── Top Brokers — 2 credits ─────────────────────────────────────────────────
export async function fetchTopBrokers(opts?: {
  start?: string;
  end?: string;
  origin?: 'domestic' | 'foreign';
  metric?: 'net' | 'buy' | 'sell';
}) {
  const p: Record<string, string> = {};
  if (opts?.start) p.start = opts.start;
  if (opts?.end) p.end = opts.end;
  if (opts?.origin) p.origin = opts.origin;
  if (opts?.metric) p.metric = opts.metric;
  return fetchSectors('/top-brokers/', p);
}

// ─── Broker Foreign Flow Summary (v1) — 1 credit ─────────────────────────────
// Ambil data foreign broker, lalu hitung net total, net buy, net sell
// Return: { netTotal, netBuy, netSell, isInflow, formatted: { net, buy, sell } }
export async function fetchBrokersForeignFlowSummary(date: string): Promise<{
  netTotal: number;
  netBuy: number;
  netSell: number;
  isInflow: boolean;
  formatted: { net: string; buy: string; sell: string };
} | null> {
  if (!SECTORS_API_KEY) throw new Error('Sectors API key not configured');

  try {
    const url = new URL(`${SECTORS_BASE}/brokers/top/`);
    url.searchParams.set('origin', 'foreign');
    url.searchParams.set('metric', 'net');
    url.searchParams.set('date', date);

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': SECTORS_API_KEY },
    });

    if (!response.ok) {
      console.warn(`[fetchBrokersForeignFlowSummary] API ${response.status} for date ${date}`);
      return null;
    }

    const data = await response.json();
    const results: Array<{ net: number; gross: number; broker_code: string }> = data?.results || [];
    if (!results.length) return null;

    const netTotal = results.reduce((sum, b) => sum + (b.net || 0), 0);
    const netBuy   = results.filter(b => b.net > 0).reduce((sum, b) => sum + b.net, 0);
    const netSell  = results.filter(b => b.net < 0).reduce((sum, b) => sum + b.net, 0);

    const fmt = (val: number): string => {
      const abs = Math.abs(val);
      const sign = val >= 0 ? '+' : '-';
      if (abs >= 1e12) return `${sign}Rp ${(abs / 1e12).toFixed(2)}T`;
      return `${sign}Rp ${(abs / 1e9).toFixed(2)}M`;
    };

    return {
      netTotal, netBuy, netSell,
      isInflow: netTotal > 0,
      formatted: {
        net:  fmt(netTotal),
        buy:  fmt(netBuy),
        sell: fmt(netSell),
      },
    };
  } catch (e) {
    console.warn('[fetchBrokersForeignFlowSummary] Failed:', e);
    return null;
  }
}

// ─── Broker Activity Top — 1 credit ──────────────────────────────────────────
export async function fetchBrokerActivityTop(opts?: {
  start?: string;
  end?: string;
  symbol?: string;
  nStock?: number;
}) {
  const p: Record<string, string | number | undefined> = {};
  if (opts?.start) p.start = opts.start;
  if (opts?.end) p.end = opts.end;
  if (opts?.symbol) p.symbol = opts.symbol;
  if (opts?.nStock) p.n_stock = opts.nStock;
  return fetchSectors('/broker-activity/top/', p);
}

// ─── Helper: Get yesterday's date (WIB) ──────────────────────────────────────
export function getYesterdayDate(): string {
  const now = new Date();
  // Convert to WIB (UTC+7)
  const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  // Go back 1 day
  wib.setDate(wib.getDate() - 1);
  return wib.toISOString().split('T')[0];
}

// ─── News Articles — 1 credit ──────────────────────────────────────────────
export async function fetchNews(opts?: {
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
  tags?: string;
  symbols?: string;
  sector?: string;
  sub_sector?: string;
  keyword?: string;
  extension?: 'idx' | 'mining';
}) {
  const p: Record<string, string | number | undefined> = {};
  if (opts?.start) p.start = opts.start;
  if (opts?.end) p.end = opts.end;
  if (opts?.limit) p.limit = opts.limit;
  if (opts?.offset !== undefined) p.offset = opts.offset;
  if (opts?.tags) p.tags = opts.tags;
  if (opts?.symbols) p.symbols = opts.symbols;
  if (opts?.sector) p.sector = opts.sector;
  if (opts?.sub_sector) p.sub_sector = opts.sub_sector;
  if (opts?.keyword) p.keyword = opts.keyword;
  if (opts?.extension) p.extension = opts.extension;
  return fetchSectors('/news/', p);
}

// ─── Helper: Get today's date (WIB) ──────────────────────────────────────────
export function getTodayDate(): string {
  const now = new Date();
  const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return wib.toISOString().split('T')[0];
}

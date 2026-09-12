// Server-side Sectors.app API client for SectorTrigger
// Fokus ke market-wide data (IHSG, top movers, filings, brokers)

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

// ─── Helper: Get today's date (WIB) ──────────────────────────────────────────
export function getTodayDate(): string {
  const now = new Date();
  const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return wib.toISOString().split('T')[0];
}

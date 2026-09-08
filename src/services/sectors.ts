/**
 * Sectors.app Financial API v2 — IDX Market Data
 * https://docs.sectors.app
 *
 * Auth: Authorization header = raw API key (no "Bearer" prefix)
 * Base URL: https://api.sectors.app/v2
 */

const SECTORS_API_KEY = import.meta.env.VITE_SECTORS_API_KEY;
const SECTORS_BASE_URL = 'https://api.sectors.app/v2';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompanyReportSection =
  | 'overview' | 'valuation' | 'financials' | 'future'
  | 'dividend' | 'ownership' | 'management' | 'peers';

export interface CompanyReport {
  symbol: string;
  company_name: string;
  overview?: Record<string, any>;
  valuation?: Record<string, any>;
  financials?: Record<string, any>;
  future?: Record<string, any>;
  dividend?: Record<string, any>;
  ownership?: Record<string, any>;
  management?: Record<string, any>;
  peers?: Record<string, any>[];
}

export interface IndexDaily { index_code: string; date: string; price: number; }

export interface TopMoverStock {
  name: string; symbol: string; price_change: number;
  last_close_price: number; latest_close_date: string;
}

export interface TopMovers {
  top_gainers?: Record<string, TopMoverStock[]>;
  top_losers?: Record<string, TopMoverStock[]>;
}

export interface MostTradedStock {
  symbol: string; company_name: string; volume: number; price: number;
}

export interface CorporateActions {
  symbol: string;
  corporate_actions: {
    agm?: any[]; bonus?: any[]; warrant?: any[]; dividend?: any[];
    right_issue?: any[]; stock_split?: any[]; upcoming_dividend?: any;
  };
}

export interface ShareholdersComposition {
  symbol: string; year: number; data: Record<string, any>[];
}

export interface FreeFloatEntry {
  symbol: string; company_name: string; free_float: number;
}

export interface SubsectorReport {
  sub_sector: string; sector: string; [section: string]: any;
}

export interface IdxMarketCap { date: string; market_cap: number; }

// ─── Core Fetch ───────────────────────────────────────────────────────────────

async function sectorsFetch<T = any>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  if (!SECTORS_API_KEY) {
    throw new Error('Sectors.app API key not configured (VITE_SECTORS_API_KEY)');
  }
  const url = new URL(`${SECTORS_BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }
  const response = await fetch(url.toString(), {
    headers: { Authorization: SECTORS_API_KEY },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sectors.app API ${response.status}: ${body}`);
  }
  return response.json() as Promise<T>;
}

// ─── Company Report ───────────────────────────────────────────────────────────
// GET /v2/company/report/{symbol}/ — 1 credit/section

export async function fetchCompanyReport(
  symbol: string, sections?: CompanyReportSection[],
): Promise<CompanyReport> {
  const params: Record<string, string> = {};
  if (sections?.length) params.sections = sections.join(',');
  return sectorsFetch<CompanyReport>(`/company/report/${symbol}/`, params);
}

// ─── Index Daily ──────────────────────────────────────────────────────────────
// GET /v2/index-daily/{index_code}/ — 1 credit

export async function fetchIndexDaily(
  indexCode: string, start?: string, end?: string,
): Promise<IndexDaily[]> {
  const p: Record<string, string> = {};
  if (start) p.start = start;
  if (end) p.end = end;
  return sectorsFetch<IndexDaily[]>(`/index-daily/${indexCode}/`, p);
}

// ─── Top Company Movers ───────────────────────────────────────────────────────
// GET /v2/companies/top-changes/ — 1 credit × (classification × period)

export async function fetchTopMovers(opts?: {
  classifications?: ('top_gainers' | 'top_losers')[];
  periods?: ('1d' | '7d' | '14d' | '30d' | '365d')[];
  subSector?: string; nStock?: number; minMcapBillion?: number;
}): Promise<TopMovers> {
  const p: Record<string, string | number | undefined> = {};
  if (opts?.classifications?.length) p.classifications = opts.classifications.join(',');
  if (opts?.periods?.length) p.periods = opts.periods.join(',');
  if (opts?.subSector) p.sub_sector = opts.subSector;
  if (opts?.nStock) p.n_stock = opts.nStock;
  if (opts?.minMcapBillion !== undefined) p.min_mcap_billion = opts.minMcapBillion;
  return sectorsFetch<TopMovers>('/companies/top-changes/', p);
}

// ─── Most Traded Stocks ───────────────────────────────────────────────────────
// GET /v2/most-traded/ — 2 credits

export async function fetchMostTraded(opts?: {
  start?: string; end?: string; subSector?: string;
  nStock?: number; adjusted?: boolean;
}): Promise<Record<string, MostTradedStock[]>> {
  const p: Record<string, string | number | boolean | undefined> = {};
  if (opts?.start) p.start = opts.start;
  if (opts?.end) p.end = opts.end;
  if (opts?.subSector) p.sub_sector = opts.subSector;
  if (opts?.nStock) p.n_stock = opts.nStock;
  if (opts?.adjusted !== undefined) p.adjusted = opts.adjusted;
  return sectorsFetch('/most-traded/', p);
}

// ─── Corporate Actions ────────────────────────────────────────────────────────
// GET /v2/company/corporate-actions/{symbol}/ — 1 credit

export async function fetchCorporateActions(symbol: string): Promise<CorporateActions> {
  return sectorsFetch<CorporateActions>(`/company/corporate-actions/${symbol}/`);
}

// ─── Shareholders Composition ─────────────────────────────────────────────────
// GET /v2/company/shareholders-composition/{symbol}/ — 1 credit

export async function fetchShareholdersComposition(
  symbol: string, year?: number,
): Promise<ShareholdersComposition> {
  const p: Record<string, number | undefined> = {};
  if (year) p.year = year;
  return sectorsFetch<ShareholdersComposition>(
    `/company/shareholders-composition/${symbol}/`, p,
  );
}

// ─── Free Float ───────────────────────────────────────────────────────────────
// GET /v2/free-float/ — 1 credit per 100 companies

export async function fetchFreeFloat(opts?: {
  sector?: string; subSector?: string; industry?: string; subIndustry?: string;
}): Promise<FreeFloatEntry[]> {
  const p: Record<string, string | undefined> = {};
  if (opts?.sector) p.sector = opts.sector;
  if (opts?.subSector) p.sub_sector = opts.subSector;
  if (opts?.industry) p.industry = opts.industry;
  if (opts?.subIndustry) p.sub_industry = opts.subIndustry;
  return sectorsFetch<FreeFloatEntry[]>('/free-float/', p);
}

// ─── Subsector Report ─────────────────────────────────────────────────────────
// GET /v2/subsector/report/{sub_sector}/ — 1 credit/section

export async function fetchSubsectorReport(
  subSector: string, sections?: string[],
): Promise<SubsectorReport> {
  const p: Record<string, string> = {};
  if (sections?.length) p.sections = sections.join(',');
  return sectorsFetch<SubsectorReport>(`/subsector/report/${subSector}/`, p);
}

// ─── IDX Total Market Cap ─────────────────────────────────────────────────────
// GET /v2/idx-total/ — 1 credit

export async function fetchIdxMarketCap(start?: string, end?: string): Promise<IdxMarketCap[]> {
  const p: Record<string, string> = {};
  if (start) p.start = start;
  if (end) p.end = end;
  return sectorsFetch<IdxMarketCap[]>('/idx-total/', p);
}

// ─── Daily Transaction (per stock) ────────────────────────────────────────────
// GET /v2/daily/{symbol}/ — 1 credit

export async function fetchDailyTransaction(
  symbol: string, start?: string, end?: string,
): Promise<Record<string, any>[]> {
  const p: Record<string, string> = {};
  if (start) p.start = start;
  if (end) p.end = end;
  return sectorsFetch(`/daily/${symbol}/`, p);
}

// ─── Foreign Flow (per stock) ─────────────────────────────────────────────────
// GET /v2/foreign-flow/{symbol}/ — 1 credit

export async function fetchForeignFlow(
  symbol: string, start?: string, end?: string,
): Promise<Record<string, any>[]> {
  const p: Record<string, string> = {};
  if (start) p.start = start;
  if (end) p.end = end;
  return sectorsFetch(`/foreign-flow/${symbol}/`, p);
}

// ─── Companies Screener ───────────────────────────────────────────────────────
// GET /v2/companies/ — 1 credit (structured), 3 credits (NL)

export async function fetchCompanies(opts?: {
  where?: string; orderBy?: string; q?: string;
  page?: number; pageSize?: number;
}): Promise<Record<string, any>> {
  const p: Record<string, string | number | undefined> = {};
  if (opts?.where) p.where = opts.where;
  if (opts?.orderBy) p.order_by = opts.orderBy;
  if (opts?.q) p.q = opts.q;
  if (opts?.page) p.page = opts.page;
  if (opts?.pageSize) p.page_size = opts.pageSize;
  return sectorsFetch('/companies/', p);
}

// ─── Companies by Subsector ───────────────────────────────────────────────────
// GET /v2/companies/?where=sub_sector={slug} — 1 credit
// Convenience wrapper untuk fetchCompanies dengan filter subsector

export async function fetchCompaniesBySubsector(
  subSector: string,
  opts?: { orderBy?: string; limit?: number }
): Promise<Record<string, any>[]> {
  const result = await fetchCompanies({
    where: `sub_sector='${subSector}'`,
    orderBy: opts?.orderBy || '-market_cap',
    pageSize: opts?.limit || 50,
  });
  return result.results || [];
}

// ─── Suspensions ──────────────────────────────────────────────────────────────
// GET /v2/suspensions/ — 1 credit

export async function fetchSuspensions(opts?: {
  symbol?: string; start?: string; end?: string;
}): Promise<Record<string, any>[]> {
  const p: Record<string, string | undefined> = {};
  if (opts?.symbol) p.symbol = opts.symbol;
  if (opts?.start) p.start = opts.start;
  if (opts?.end) p.end = opts.end;
  return sectorsFetch('/suspensions/', p);
}

// ─── IPO Listing Performance ──────────────────────────────────────────────────
// GET /v2/ipo-performance/{symbol}/ — 1 credit

export async function fetchIpoPerformance(symbol: string): Promise<Record<string, any>> {
  return sectorsFetch(`/ipo-performance/${symbol}/`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function fetchSubsectors(): Promise<Record<string, string>[]> {
  return sectorsFetch('/helper/subsectors/');
}

export async function fetchIndustries(): Promise<Record<string, string>[]> {
  return sectorsFetch('/helper/industries/');
}

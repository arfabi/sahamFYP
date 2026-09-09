// Server-side Sectors.app API client
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

export async function fetchCompanyReport(symbol: string, sections: string[] = ['overview', 'valuation', 'financials']) {
  const results: Record<string, any> = {};

  await Promise.all(
    sections.map(async (section) => {
      try {
        const data = await fetchSectors(`/stocks/${symbol}/company-report`, { section });
        results[section] = data;
      } catch (error) {
        console.warn(`Failed to fetch ${section} for ${symbol}:`, error);
        results[section] = null;
      }
    })
  );

  return results;
}

export async function fetchForeignFlow(symbol: string) {
  try {
    return await fetchSectors(`/foreign-flow/${symbol}`);
  } catch (error) {
    console.warn(`Failed to fetch foreign flow for ${symbol}:`, error);
    return null;
  }
}

export async function enrichByCategory(category: string, ticker: string | null) {
  if (!ticker) {
    return { category, ticker: null, data: null };
  }

  const enrichmentMap: Record<string, () => Promise<any>> = {
    SINGLE_STOCK: async () => {
      const [report, foreignFlow] = await Promise.all([
        fetchCompanyReport(ticker, ['overview', 'valuation', 'financials', 'dividend', 'ownership']),
        fetchForeignFlow(ticker),
      ]);
      return { report, foreignFlow };
    },
    MACRO_ECONOMY: async () => {
      return { note: 'Macro economy uses general market data, not ticker-specific' };
    },
    SECTOR_ANALYSIS: async () => {
      const report = await fetchCompanyReport(ticker, ['overview', 'valuation']);
      return { report };
    },
    CORPORATE_ACTION: async () => {
      const report = await fetchCompanyReport(ticker, ['overview', 'financials']);
      return { report };
    },
    IPO_RIGHTS_ISSUE: async () => {
      const report = await fetchCompanyReport(ticker, ['overview', 'valuation', 'financials']);
      return { report };
    },
    SUSPENSION_DELISTING: async () => {
      const report = await fetchCompanyReport(ticker, ['overview']);
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
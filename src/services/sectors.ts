const SECTORS_API_KEY = import.meta.env.VITE_SECTORS_API_KEY;
const SECTORS_API_URL = 'https://api.sectors.app/v1';

export interface SectorsCompany {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  marketCap?: number;
  pe?: number;
  pbv?: number;
  roe?: number;
  dividendYield?: number;
  [key: string]: any;
}

async function sectorsFetch(endpoint: string): Promise<any> {
  if (!SECTORS_API_KEY) {
    throw new Error('Sectors.app API key not configured');
  }

  const response = await fetch(`${SECTORS_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${SECTORS_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sectors.app API error: ${error}`);
  }

  return response.json();
}

// Get company overview
export async function getCompanyOverview(ticker: string): Promise<SectorsCompany> {
  return sectorsFetch(`/companies/${ticker}`);
}

// Get company financials
export async function getCompanyFinancials(ticker: string): Promise<any> {
  return sectorsFetch(`/companies/${ticker}/financials`);
}

// Get company valuation
export async function getCompanyValuation(ticker: string): Promise<any> {
  return sectorsFetch(`/companies/${ticker}/valuation`);
}

// Get sector performance
export async function getSectorPerformance(): Promise<any> {
  return sectorsFetch('/sectors/performance');
}

// Get daily market summary
export async function getDailySummary(): Promise<any> {
  return sectorsFetch('/market/summary');
}

// Get top gainers
export async function getTopGainers(limit = 10): Promise<any> {
  return sectorsFetch(`/market/gainers?limit=${limit}`);
}

// Get top losers
export async function getTopLosers(limit = 10): Promise<any> {
  return sectorsFetch(`/market/losers?limit=${limit}`);
}

// Get most active stocks
export async function getMostActive(limit = 10): Promise<any> {
  return sectorsFetch(`/market/most-active?limit=${limit}`);
}

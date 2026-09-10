import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateApiKey, parseBody } from './_lib/auth.js';

// --- Sectors.app API client (self-contained) ---
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

async function fetchCompanyReport(symbol: string, sections: string[] = ['overview', 'valuation', 'financials']) {
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

async function fetchForeignFlow(symbol: string) {
  try {
    return await fetchSectors(`/foreign-flow/${symbol}`);
  } catch (error) {
    console.warn(`Failed to fetch foreign flow for ${symbol}:`, error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!validateApiKey(req)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, ticker } = parseBody(req);

  if (!category) {
    return res.status(400).json({ error: 'category is required' });
  }

  try {
    const result = await enrichByCategory(category, ticker);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Enrich error:', error);
    return res.status(500).json({
      error: 'Failed to enrich data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function enrichByCategory(category: string, ticker: string | null) {
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
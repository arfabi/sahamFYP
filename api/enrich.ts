import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateApiKey, parseBody } from './_lib/auth.js';
import { supabaseServer } from './_lib/supabase.js';

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

// Fetch company report - returns all sections in one call
async function fetchCompanyReport(symbol: string) {
  try {
    return await fetchSectors(`/company/report/${symbol}/`);
  } catch (error) {
    console.warn(`Failed to fetch company report for ${symbol}:`, error);
    return { 
      error: true, 
      message: error instanceof Error ? error.message : 'Unknown error',
      note: 'Sectors.app API endpoint may have changed. Check https://docs.sectors.app/'
    };
  }
}

// Fetch foreign flow data
async function fetchForeignFlow(symbol: string) {
  try {
    return await fetchSectors(`/foreign-flow/${symbol}/`);
  } catch (error) {
    console.warn(`Failed to fetch foreign flow for ${symbol}:`, error);
    return { 
      error: true, 
      message: error instanceof Error ? error.message : 'Unknown error',
      note: 'Sectors.app API endpoint may have changed. Check https://docs.sectors.app/'
    };
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

  const { category, ticker, url, source_url } = parseBody(req);
  const targetUrl = url || source_url;

  if (!category) {
    return res.status(400).json({ error: 'category is required' });
  }

  try {
    const result = await enrichByCategory(category, ticker);

    // Update field sector di tabel sector_trigger_news (Supabase) jika targetUrl disediakan
    if (targetUrl && result) {
      try {
        const report = (result as any)?.data?.report || (result as any)?.report;
        const detectedSector = report?.overview?.sector || report?.sector || null;
        const detectedSubSector = report?.overview?.sub_sector || report?.sub_sector || null;

        if (detectedSector) {
          const updatePayload: Record<string, any> = {
            sector: detectedSector,
            updated_at: new Date().toISOString(),
          };
          if (detectedSubSector) {
            updatePayload.sub_sectors = [detectedSubSector];
          }
          if (ticker) {
            const cleanTicker = String(ticker).trim().toUpperCase().replace(/\.JK$/i, '');
            if (cleanTicker && cleanTicker !== 'NULL' && cleanTicker !== 'NONE') {
              updatePayload.symbols = [`${cleanTicker}.JK`];
            }
          }

          await supabaseServer
            .from('sector_trigger_news')
            .update(updatePayload)
            .eq('source_url', targetUrl);
        }
      } catch (dbErr) {
        console.warn('[Enrich] Error updating sector in Supabase:', dbErr);
      }
    }

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
        fetchCompanyReport(ticker),
        fetchForeignFlow(ticker),
      ]);
      return { report, foreignFlow };
    },
    MACRO_ECONOMY: async () => {
      return { note: 'Macro economy uses general market data, not ticker-specific' };
    },
    SECTOR_ANALYSIS: async () => {
      const report = await fetchCompanyReport(ticker);
      return { report };
    },
    CORPORATE_ACTION: async () => {
      const report = await fetchCompanyReport(ticker);
      return { report };
    },
    IPO_RIGHTS_ISSUE: async () => {
      const report = await fetchCompanyReport(ticker);
      return { report };
    },
    SUSPENSION_DELISTING: async () => {
      const report = await fetchCompanyReport(ticker);
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
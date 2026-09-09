/**
 * Data Enrichment Orchestrator
 * Routes through Vercel API proxy to avoid CORS issues
 *
 * Browser TIDAK BOLEH call Sectors.app langsung (CORS block).
 * Semua request di-proxy melalui /api/enrich (Vercel serverless).
 */

import { enrichData } from './api';
import type { ClassificationResult } from './gemini';

export interface EnrichmentResult {
  category: ClassificationResult['category'];
  ticker: string | null;
  sector: string | null;
  data: Record<string, any>;
  creditsUsed: number;
  errors: string[];
  fetchedAt: string;
  error?: string;
}

export async function enrichClassification(
  classification: ClassificationResult
): Promise<EnrichmentResult> {
  const { category, ticker } = classification;

  // Call Vercel API proxy (which calls Sectors.app server-side, no CORS)
  const result = await enrichData(category, ticker);

  return {
    category,
    ticker,
    sector: null,
    data: result.data || {},
    error: result.error,
    fetchedAt: new Date().toISOString(),
    creditsUsed: 0, // Credits tracked server-side
    errors: result.error ? [result.error] : [],
  };
}

// Re-export for backward compatibility
export { enrichData as enrichByCategory };

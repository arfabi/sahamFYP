/**
 * Data Enrichment Orchestrator
 * Takes a ClassificationResult and fetches appropriate Sectors.app data per category.
 * Based on Data_Mapping_Spec_SahamFYP.md
 */

import type { ClassificationResult } from './gemini';
import {
  fetchCompanyReport, fetchIndexDaily, fetchTopMovers, fetchMostTraded,
  fetchCorporateActions, fetchShareholdersComposition, fetchFreeFloat,
  fetchSubsectorReport, fetchIdxMarketCap, fetchForeignFlow,
  fetchSuspensions, fetchIpoPerformance,
} from './sectors';

export interface EnrichmentResult {
  category: ClassificationResult['category'];
  ticker: string | null;
  sector: string | null;
  data: Record<string, any>;
  creditsUsed: number;
  errors: string[];
  fetchedAt: string;
}

// ─── SINGLE_STOCK ─────────────────────────────────────────────────────────────

async function enrichSingleStock(ticker: string) {
  const data: Record<string, any> = {};
  const errors: string[] = [];
  let credits = 0;

  try {
    data.companyReport = await fetchCompanyReport(ticker, [
      'overview', 'valuation', 'financials', 'future', 'dividend', 'ownership',
    ]);
    credits += 6;
  } catch (e: any) { errors.push(`companyReport: ${e.message}`); }

  try {
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    data.foreignFlow = await fetchForeignFlow(ticker, start, end);
    credits += 1;
  } catch (e: any) { errors.push(`foreignFlow: ${e.message}`); }

  return { data, credits, errors };
}

// ─── MACRO_ECONOMY ────────────────────────────────────────────────────────────

async function enrichMacroEconomy() {
  const data: Record<string, any> = {};
  const errors: string[] = [];
  let credits = 0;
  const end = new Date().toISOString().slice(0, 10);
  const start7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  try { data.ihsgDaily = await fetchIndexDaily('ihsg', start7, end); credits += 1; }
  catch (e: any) { errors.push(`ihsgDaily: ${e.message}`); }

  try { data.idxMarketCap = await fetchIdxMarketCap(start7, end); credits += 1; }
  catch (e: any) { errors.push(`idxMarketCap: ${e.message}`); }

  try {
    data.topMovers = await fetchTopMovers({
      classifications: ['top_gainers', 'top_losers'], periods: ['1d'], nStock: 5,
    });
    credits += 2;
  } catch (e: any) { errors.push(`topMovers: ${e.message}`); }

  try { data.mostTraded = await fetchMostTraded({ nStock: 5 }); credits += 2; }
  catch (e: any) { errors.push(`mostTraded: ${e.message}`); }

  return { data, credits, errors };
}

// ─── SECTOR_ANALYSIS ──────────────────────────────────────────────────────────

async function enrichSectorAnalysis(sectorSlug: string) {
  const data: Record<string, any> = {};
  const errors: string[] = [];
  let credits = 0;

  try {
    data.subsectorReport = await fetchSubsectorReport(sectorSlug, ['companies']);
    credits += 1;
  } catch (e: any) { errors.push(`subsectorReport: ${e.message}`); }

  try {
    data.topMovers = await fetchTopMovers({
      classifications: ['top_gainers', 'top_losers'],
      periods: ['1d', '7d'], subSector: sectorSlug, nStock: 5,
    });
    credits += 4;
  } catch (e: any) { errors.push(`topMovers: ${e.message}`); }

  try {
    data.mostTraded = await fetchMostTraded({ subSector: sectorSlug, nStock: 5 });
    credits += 2;
  } catch (e: any) { errors.push(`mostTraded: ${e.message}`); }

  return { data, credits, errors };
}

// ─── CORPORATE_ACTION ─────────────────────────────────────────────────────────

async function enrichCorporateAction(ticker: string) {
  const data: Record<string, any> = {};
  const errors: string[] = [];
  let credits = 0;

  try {
    data.corporateActions = await fetchCorporateActions(ticker);
    credits += 1;
  } catch (e: any) { errors.push(`corporateActions: ${e.message}`); }

  try {
    data.companyReport = await fetchCompanyReport(ticker, ['dividend', 'overview']);
    credits += 2;
  } catch (e: any) { errors.push(`companyReport: ${e.message}`); }

  return { data, credits, errors };
}

// ─── IPO_RIGHTS_ISSUE ─────────────────────────────────────────────────────────

async function enrichIpoRightsIssue(ticker: string | null) {
  const data: Record<string, any> = {};
  const errors: string[] = [];
  let credits = 0;

  if (!ticker) return { data, credits: 0, errors: [] };

  try { data.ipoPerformance = await fetchIpoPerformance(ticker); credits += 1; }
  catch (e: any) { errors.push(`ipoPerformance: ${e.message}`); }

  try { data.corporateActions = await fetchCorporateActions(ticker); credits += 1; }
  catch (e: any) { errors.push(`corporateActions: ${e.message}`); }

  try {
    data.shareholdersComposition = await fetchShareholdersComposition(ticker);
    credits += 1;
  } catch (e: any) { errors.push(`shareholdersComposition: ${e.message}`); }

  return { data, credits, errors };
}

// ─── SUSPENSION_DELISTING ─────────────────────────────────────────────────────

async function enrichSuspensionDelisting(ticker: string) {
  const data: Record<string, any> = {};
  const errors: string[] = [];
  let credits = 0;

  try { data.suspensions = await fetchSuspensions({ symbol: ticker }); credits += 1; }
  catch (e: any) { errors.push(`suspensions: ${e.message}`); }

  try {
    data.companyOverview = await fetchCompanyReport(ticker, ['overview']);
    credits += 1;
  } catch (e: any) { errors.push(`companyOverview: ${e.message}`); }

  return { data, credits, errors };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export async function enrichClassification(
  classification: ClassificationResult,
): Promise<EnrichmentResult> {
  const { category, ticker, sector } = classification;
  const result: EnrichmentResult = {
    category, ticker, sector,
    data: {}, creditsUsed: 0, errors: [],
    fetchedAt: new Date().toISOString(),
  };

  if (category === 'SKIP') return result;

  let e: { data: Record<string, any>; credits: number; errors: string[] };

  switch (category) {
    case 'SINGLE_STOCK':
      if (!ticker) throw new Error('SINGLE_STOCK requires a ticker');
      e = await enrichSingleStock(ticker); break;
    case 'MACRO_ECONOMY':
      e = await enrichMacroEconomy(); break;
    case 'SECTOR_ANALYSIS':
      if (!sector) throw new Error('SECTOR_ANALYSIS requires a sector slug');
      e = await enrichSectorAnalysis(sector); break;
    case 'CORPORATE_ACTION':
      if (!ticker) throw new Error('CORPORATE_ACTION requires a ticker');
      e = await enrichCorporateAction(ticker); break;
    case 'IPO_RIGHTS_ISSUE':
      e = await enrichIpoRightsIssue(ticker); break;
    case 'SUSPENSION_DELISTING':
      if (!ticker) throw new Error('SUSPENSION_DELISTING requires a ticker');
      e = await enrichSuspensionDelisting(ticker); break;
    default:
      throw new Error(`Unknown category: ${category}`);
  }

  result.data = e.data;
  result.creditsUsed = e.credits;
  result.errors = e.errors;
  return result;
}
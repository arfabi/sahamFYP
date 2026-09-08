import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SECTORS_API_KEY = process.env.VITE_SECTORS_API_KEY;
const SECTORS_BASE_URL = 'https://api.sectors.app/v2';

async function sf(path: string, params?: Record<string, string>) {
  const url = new URL(`${SECTORS_BASE_URL}${path}`);
  if (params) for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: { Authorization: SECTORS_API_KEY! } });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function testCompanyReport() {
  console.log('\n── Test: Company Report (BBCA) ──');
  const d = await sf('/company/report/BBCA/', { sections: 'overview,valuation,financials' });
  const latestVal = d.valuation?.historical_valuation?.at(-1);
  console.log(`✅ ${d.symbol} | ${d.company_name}`);
  console.log(`   mcap: Rp${(d.overview?.market_cap / 1e12).toFixed(0)}T | PER: ${latestVal?.pe?.toFixed(1)} | PBV: ${latestVal?.pb?.toFixed(2)}`);
}

async function testIndexDaily() {
  console.log('\n── Test: Index Daily (IHSG 7d) ──');
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const d = await sf(`/index-daily/ihsg/`, { start, end });
  console.log(`✅ ${d.length} days`);
  d.forEach((x: any) => console.log(`   ${x.date}: ${x.price}`));
}

async function testTopMovers() {
  console.log('\n── Test: Top Movers (1d) ──');
  const d = await sf('/companies/top-changes/', {
    classifications: 'top_gainers,top_losers', periods: '1d', n_stock: '3',
  });
  console.log(`✅ gainers: ${d.top_gainers?.['1d']?.length} | losers: ${d.top_losers?.['1d']?.length}`);
  d.top_gainers?.['1d']?.slice(0, 2).forEach((s: any) =>
    console.log(`   ↑ ${s.symbol} +${(s.price_change * 100).toFixed(1)}%`));
}

async function testCorporateActions() {
  console.log('\n── Test: Corporate Actions (BBCA) ──');
  const d = await sf('/company/corporate-actions/BBCA/');
  const ca = d.corporate_actions;
  console.log(`✅ div: ${ca.dividend?.length || 0} | split: ${ca.stock_split?.length || 0} | RI: ${ca.right_issue ? 'yes' : 'none'}`);
}

async function testSubsector() {
  console.log('\n── Test: Subsector Report (banks) ──');
  const d = await sf('/subsector/report/banks/');
  console.log(`✅ ${d.sub_sector} | ${d.sector} | keys: ${Object.keys(d).join(', ')}`);
}

async function testIdxMC() {
  console.log('\n── Test: IDX Total Market Cap (7d) ──');
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const d = await sf('/idx-total/', { start, end });
  console.log(`✅ ${d.length} days`);
  d.slice(-3).forEach((x: any) => console.log(`   ${x.date}: Rp${(x.idx_total_market_cap / 1e15).toFixed(1)}T`));
}

async function testForeignFlow() {
  console.log('\n── Test: Foreign Flow (BBCA) ──');
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const d = await sf('/foreign-flow/BBCA/', { start, end });
  console.log(`✅ ${Array.isArray(d) ? d.length + ' entries' : JSON.stringify(d).slice(0, 100)}`);
}

async function testSuspensions() {
  console.log('\n── Test: Suspensions ──');
  const d = await sf('/suspensions/');
  console.log(`✅ ${Array.isArray(d) ? d.length + ' entries' : JSON.stringify(d).slice(0, 100)}`);
}

async function testEnrichment() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 Full Enrichment: SINGLE_STOCK (BBCA)');
  console.log('═'.repeat(60));

  const t0 = Date.now();
  const errors: string[] = [];
  const data: Record<string, any> = {};
  let credits = 0;

  try {
    data.report = await sf('/company/report/BBCA/', {
      sections: 'overview,valuation,financials,future,dividend,ownership',
    });
    credits += 6;
    console.log('✅ Company Report (6 sections)');
  } catch (e: any) { errors.push(e.message); }

  try {
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    data.ff = await sf('/foreign-flow/BBCA/', { start, end });
    credits += 1;
    console.log(`✅ Foreign Flow (${Array.isArray(data.ff) ? data.ff.length : '?'} days)`);
  } catch (e: any) { errors.push(e.message); }

  const ms = Date.now() - t0;
  console.log(`\n📊 Credits: ~${credits} | Time: ${ms}ms | Errors: ${errors.length}`);

  if (data.report) {
    const r = data.report;
    const latestVal = r.valuation?.historical_valuation?.at(-1);
    console.log(`\n📈 BBCA Key Metrics:`);
    console.log(`   Market Cap: Rp${(r.overview?.market_cap / 1e12).toFixed(0)}T`);
    console.log(`   PER: ${latestVal?.pe?.toFixed(1)} | PBV: ${latestVal?.pb?.toFixed(2)}`);
    console.log(`   PER peer avg: ${latestVal?.pe_peer_avg?.toFixed(1)} | PBV peer avg: ${latestVal?.pb_peer_avg?.toFixed(2)}`);
    console.log(`   EPS: ${r.financials?.eps}`);
    console.log(`   Div Yield: ${r.dividend?.yield_ttm ? (r.dividend.yield_ttm * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`   Analyst: ${JSON.stringify(r.future?.analyst_rating_breakdown)}`);
    console.log(`   Group: ${r.ownership?.conglomerates_group?.join(', ') || 'N/A'}`);
    console.log(`   Fwd PE: ${r.valuation?.forward_pe}`);
    console.log(`   Intrinsic Val: ${r.valuation?.intrinsic_value}`);
  }
}

async function main() {
  console.log('🧪 Sectors.app API v2 — Phase 4 Test');
  console.log(`   Key: ${SECTORS_API_KEY?.slice(0, 8)}...`);

  if (!SECTORS_API_KEY) {
    console.error('❌ VITE_SECTORS_API_KEY not set');
    process.exit(1);
  }

  try {
    await testCompanyReport();
    await testIndexDaily();
    await testTopMovers();
    await testCorporateActions();
    await testSubsector();
    await testIdxMC();
    await testForeignFlow();
    await testSuspensions();
    await testEnrichment();
  } catch (e) {
    console.error(`\n❌ ${e instanceof Error ? e.message : e}`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🏁 All tests completed');
  console.log('═'.repeat(60));
}

main();
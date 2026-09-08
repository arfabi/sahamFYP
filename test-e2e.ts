import dotenv from 'dotenv';
import path from 'path';
import handler from './api/scrape';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Mock Vercel request/response
function createMockReq(body: any) {
  return { method: 'POST', body } as any;
}

function createMockRes() {
  const res: any = {
    statusCode: 200,
    headers: {},
    data: null,
    setHeader(key: string, value: string) { res.headers[key] = value; },
    status(code: number) { res.statusCode = code; return res; },
    json(data: any) { res.data = data; return res; },
    end() { return res; },
  };
  return res;
}

async function classifyContent(title: string, content: string) {
  const prompt = `
Kamu adalah AI News Classifier untuk sistem otomasi konten @sahamfyp. 
Tugasmu adalah membaca judul + isi berita, lalu menentukan SATU kategori paling tepat dari 6 kategori resmi: 
[SINGLE_STOCK, MACRO_ECONOMY, SECTOR_ANALYSIS, CORPORATE_ACTION, IPO_RIGHTS_ISSUE, SUSPENSION_DELISTING, SKIP].
Berikan output Wajib JSON valid, tanpa markdown tambahan.

Format JSON yang diminta:
{
  "category": "KATEGORI",
  "ticker": "KODE / null",
  "sector": "SEKTOR / null",
  "confidence": 0.0,
  "reason": "Alasan singkat 1-2 kalimat."
}

---
DATA BERITA YANG HARUS DIKLASIFIKASIKAN:
- Judul: ${title}
- Isi: ${content}
`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${await response.text()}`);
  }

  const data = await response.json();
  const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawOutput) {
    throw new Error('No response from Gemini');
  }

  return JSON.parse(rawOutput);
}

async function scrapeAndClassify(url: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📍 ${url}`);
  console.log('='.repeat(60));

  try {
    // Step 1: Scrape
    console.log('\n🔍 Step 1: Scraping...');
    const req = createMockReq({ url });
    const res = createMockRes();
    const scrapeStart = Date.now();
    await handler(req, res);
    const scrapeDuration = Date.now() - scrapeStart;

    if (res.statusCode !== 200 || !res.data) {
      console.log(`❌ Scraping failed: ${res.statusCode}`);
      return;
    }

    console.log(`✅ Scraped in ${scrapeDuration}ms`);
    console.log(`   Title: ${res.data.title}`);
    console.log(`   Content: ${res.data.content?.length || 0} chars`);

    // Step 2: Classify
    console.log('\n🤖 Step 2: Classifying with Gemini...');
    const classifyStart = Date.now();
    const classification = await classifyContent(
      res.data.title,
      res.data.content
    );
    const classifyDuration = Date.now() - classifyStart;

    console.log(`✅ Classified in ${classifyDuration}ms`);
    console.log('\n📊 Classification Result:');
    console.log(JSON.stringify(classification, null, 2));

    console.log(`\n⏱️  Total time: ${scrapeDuration + classifyDuration}ms`);
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : error}`);
  }
}

async function main() {
  console.log('🧪 End-to-End Test: Scrape + Classify\n');
  console.log(`Model: ${GEMINI_MODEL}`);

  // Test dengan halaman market CNBC Indonesia
  await scrapeAndClassify('https://www.cnbcindonesia.com/market');

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test completed');
  console.log('='.repeat(60));
}

main();


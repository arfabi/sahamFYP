import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const MODELS_TO_TEST = [
  'gemini-3.5-flash-lite',  // Recommended by Google
  'gemini-3.1-flash-lite',  // Used in PHP version
  'gemini-2.0-flash',       // Standard model
];

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const testPrompt = `
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
- Judul: Bank OCBC Caplok 20% Saham GE Life Indonesia, Rogoh Duit Segini
- Isi: PT Bank OCBC Indonesia Tbk (NISP) membeli 20% saham PT Great Eastern Life Indonesia (GELI) senilai Rp 201,98 Miliar menggunakan kas internal untuk membentuk Perusahaan Induk Konglomerasi Keuangan (PIKK) sesuai POJK No. 30/2024.
`;

async function testModel(model: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing Model: ${model}`);
  console.log('='.repeat(60));

  const url = `${API_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: testPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      }),
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️  ${duration}ms | Status: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ Failed: ${error.substring(0, 200)}`);
      return false;
    }

    const data = await response.json();
    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawOutput) {
      console.log('❌ No output from model');
      return false;
    }

    console.log('\n✅ SUCCESS!');
    console.log(`\n📝 Output:\n${rawOutput}`);

    try {
      const parsed = JSON.parse(rawOutput);
      console.log('\n📊 Parsed:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('\n❌ Failed to parse JSON');
    }

    if (data.usageMetadata) {
      console.log(`\n📈 Tokens: ${data.usageMetadata.totalTokenCount} total`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : error}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Gemini API - Multiple Models\n');
  console.log(`API Key: ${GEMINI_API_KEY?.substring(0, 10)}...`);

  for (const model of MODELS_TO_TEST) {
    const success = await testModel(model);
    if (success) {
      console.log(`\n✅ Model ${model} works! Using this model.`);
      break;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test completed');
  console.log('='.repeat(60));
}

main();


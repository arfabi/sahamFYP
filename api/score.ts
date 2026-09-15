import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseBody } from './_lib/auth.js';
import { generateJson, isLlmConfigured } from './_lib/llm.js';

// --- Scoring Prompt ---
function buildScoringPrompt(
  title: string,
  content: string,
  category: string,
  ticker: string | null,
  reason: string
): string {
  return `
Kamu adalah AI News Scorer untuk sistem otomasi konten @sahamfyp.
Tugasmu adalah memberikan SCORE 0-10 apakah sebuah berita saham layak dijadikan konten carousel Instagram.

## KRITERIA SCORING (OBJECTIVE, JANGAN HALUSINASI)

### BOOSTER (Tambah Score):
- **Catalyst jelas** (dividen, rights issue, IPO, akuisisi, merger, contract win, earnings beat): +2
- **Data kuantitatif ada** (angka spesifik, persentase, nilai transaksi): +1
- **Ticker saham jelas** (bukan vague/sector-only): +1
- **Berita fresh** (hari ini/ kemarin, bukan news lama): +1
- **Dampak langsung ke harga saham** (bukan fluff macro): +2

### PENALTI (Kurang Score):
- **Fluff tanpa angka** ("IHSH konsolidate", "pasar mixed"): -2
- **Rumor / belum terkonfirmasi**: -2
- **News lama / sudah priced in**: -2
- **Tidak ada ticker spesifik**: -1
- **Macro vague tanpa dampak langsung ke saham**: -1

## ATURAN KETAT:
1. Score 9-10 = GENERATE (berita berefek langsung + ada data + fresh)
2. Score 7-8 = PASS (relevant tapi kurang catalyst/data)
3. Score 0-6 = PASS (fluff, rumor, atau tidak actionable)

## INPUT BERITA:
- Judul: ${title}
- Isi: ${content}
- Kategori: ${category}
- Ticker: ${ticker || 'null'}
- Alasan Klasifikasi: ${reason}

## OUTPUT FORMAT (JSON VALID, TANPA MARKDOWN):
{
  "score": 0,
  "decision": "PASS",
  "reason": "Alasan singkat 1-2 kalimat berdasarkan kriteria di atas.",
  "catalyst": "jenis catalyst yang terdeteksi / null",
  "dataQuality": "high|medium|low"
}

## PENTING:
- JANGAN halusinasi data. Jika tidak ada angka, tulis "tidak ada data kuantitatif".
- Score harus sesuai kriteria objective di atas, bukan feeling.
- Reason harus spesifik sebutkan catalyst/penalti yang terdeteksi.
`;
}

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = parseBody<{
      title?: string;
      content?: string;
      category?: string;
      ticker?: string | null;
      reason?: string;
    }>(req);

    const { title, content, category, ticker, reason } = body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields: title, content',
      });
    }

    if (!isLlmConfigured()) {
      return res.status(500).json({ error: 'LLM not configured (SUMOPOD_API_KEY missing)' });
    }

    const prompt = buildScoringPrompt(
      title,
      content,
      category || 'UNKNOWN',
      ticker || null,
      reason || 'Tidak ada alasan'
    );

    const parsed = await generateJson(prompt, { temperature: 0.2 });

    return res.status(200).json({
      score: parsed.score ?? 0,
      decision: parsed.decision ?? 'PASS',
      reason: parsed.reason ?? 'Tidak ada alasan',
      catalyst: parsed.catalyst ?? null,
      dataQuality: parsed.dataQuality ?? 'low',
    });
  } catch (error) {
    console.error('[Score] Error:', error);
    return res.status(500).json({
      error: 'Failed to score news',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

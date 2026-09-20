import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseBody } from './_lib/auth.js';
import { generateJson, isLlmConfigured } from './_lib/llm.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content } = parseBody(req);

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  if (!isLlmConfigured()) {
    return res.status(500).json({ error: 'LLM not configured (SUMOPOD_API_KEY missing)' });
  }

  const prompt = `
Kamu adalah AI News Classifier dan Tag Analyzer untuk sistem otomasi konten @sahamfyp.
Tugasmu adalah:
1. Membaca judul + isi berita, lalu menentukan SATU kategori paling tepat dari 6 kategori resmi:
[SINGLE_STOCK, MACRO_ECONOMY, SECTOR_ANALYSIS, CORPORATE_ACTION, IPO_RIGHTS_ISSUE, SUSPENSION_DELISTING, SKIP].
2. Tentukan kode emiten (ticker) saham Indonesia terkait (misal BBCA, TOWR, DRMA, dsb atau null jika tidak ada).
3. Buat 2 - 5 tags relevan dalam bentuk array string:
   - Tag topik / catalyst aksi korporasi (misal: "Joint Venture", "Business Expansion", "Dividen", "Rights Issue", "Akuisisi", "Kinerja Keuangan", "Belanja Modal", dsb).
   - Wajib sertakan SATU tag sentimen pasar di akhir: "Bullish", "Bearish", atau "Neutral".

Berikan output Wajib JSON valid, tanpa markdown tambahan.

Format JSON yang diminta:
{
  "category": "KATEGORI",
  "ticker": "KODE / null",
  "tags": ["Tag Topik 1", "Tag Topik 2", "Bullish"],
  "confidence": 0.0,
  "reason": "Alasan singkat 1-2 kalimat."
}

---
DATA BERITA YANG HARUS DIKLASIFIKASIKAN:
- Judul: ${title}
- Isi: ${content}
`;

  try {
    const parsed = await generateJson(prompt, { temperature: 0.2 });
    console.log('[Classify] Success:', parsed);

    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
      : (typeof parsed.tags === 'string' ? parsed.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);

    return res.status(200).json({
      ...parsed,
      tags,
    });
  } catch (error) {
    console.error('[Classify] Error:', error);
    return res.status(500).json({
      error: 'Failed to classify content',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
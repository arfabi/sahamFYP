import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseBody } from '../_lib/auth';

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

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

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    const rawOutput = result.response.text();

    // Clean JSON from markdown code blocks
    let jsonStr = rawOutput.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsed = JSON.parse(jsonStr);
    console.log('[Classify] Success:', parsed);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('[Classify] Error:', error);
    return res.status(500).json({
      error: 'Failed to classify content',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
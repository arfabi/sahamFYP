import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseBody } from './_lib/auth.js';
import { generateJson, isLlmConfigured } from './_lib/llm.js';
import { supabaseServer } from './_lib/supabase.js';

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
Tugasmu adalah memberikan SCORE 0-10 apakah sebuah berita saham layak dijadikan konten carousel Instagram untuk investor pasar modal Indonesia (IHSG).

## ATURAN MUTLAK & BATASAN PASAR SAHAM INDONESIA (IHSG):
1. Konten @sahamfyp KHUSUS untuk PASAR SAHAM INDONESIA (BEI / IDX / IHSG).
2. Jika berita adalah politik luar negeri, geopolitik internasional, diplomasi antar negara (seperti AS, China, Trump, Xi Jinping, dsb), atau teknologi global tanpa emiten saham Indonesia yang terdampak langsung, MAKA SCORE MAKSIMAL ADALAH 3 (WAJIB DECISION: "PASS").
3. Berita TANPA ticker emiten saham Indonesia spesifik TIDAK BOLEH mendapatkan score di atas 5 (Wajib PASS).
4. Score 9-10 (GENERATE) HANYA BOLEH diberikan jika memenuhi SALAH SATU dari 3 PILAR KATALIS UTAMA berikut:
   a. **LABA NAIK SIGNIFIKAN**: Lonjakan laba bersih / pendapatan (YoY / QoQ / turnaround rugi ke laba) dengan data kuantitatif persen atau nominal yang jelas.
   b. **BUYBACK SAHAM BESAR/SIGNIFIKAN**: Aksi korporasi buyback saham dengan porsi signifikan (>20% saham beredar atau alokasi dana jumbo untuk menopang valuasi emiten). Buyback kecil/MESOP karyawan maksimal score 7.
   c. **DIVIDEN**: Pengumuman resmi dividen (interim / final / cum date / yield dividen tinggi) dengan angka rupiah per saham (DPS) atau nilai dividen yang jelas.
5. Jika berita BUKAN mengenai salah satu dari 3 pilar di atas (misal: insider buy/sell kecil, klarifikasi/respons PR manajemen, operasional rutin, kerja sama biasa, atau berita makro/program pemerintah), MAKA SCORE MAKSIMAL ADALAH 7-8 (WAJIB DECISION: "PASS").

## KRITERIA SCORING (OBJECTIVE, JANGAN HALUSINASI)

### BOOSTER (Hanya jika masuk 3 Pilar Utama):
- **Laba naik drastis / Turnaround signifikan**: +3
- **Dividen resmi diumumkan (ada DPS / yield)**: +3
- **Buyback saham bernilai besar / porsi signifikan**: +3
- **Data kuantitatif sangat spesifik (rupiah, persentase nyata)**: +1
- **Berita fresh (hari ini / kemarin)**: +1

### PENALTI (Kurang Score):
- **Bukan salah satu dari 3 Pilar (Bukan Laba Naik, Bukan Buyback Besar, Bukan Dividen)**: Maksimal score 7-8 (AUTO PASS)
- **Insider trading / transaksi direksi bernilai kecil (< Rp 5 Miliar atau < 1% saham)**: Batasi score maksimal 6
- **Berita tanggapan / klarifikasi manajemen / rumor**: -3
- **Bukan berita saham Indonesia / Geopolitik luar negeri tanpa emiten BEI**: -5 (AUTO PASS)
- **Tidak ada ticker saham Indonesia spesifik**: -3
- **Fluff tanpa angka ("IHSG konsolidasi", "pasar mixed")**: -2
- **Program makro pemerintah tanpa aksi korporasi emiten langsung**: -2
- **News lama / sudah priced in**: -2

## ATURAN KETAT SCORE & DECISION:
1. **Score 9-10 = GENERATE**: Wajib ada emiten IHSG spesifik + fresh + data angka konkret + **HANYA untuk (1) LABA NAIK, (2) BUYBACK >20%/BESAR, atau (3) DIVIDEN**.
2. **Score 7-8 = PASS**: Berita emiten bagus (akuisisi, merger, kontrak baru, rights issue, insider buy) tapi BUKAN 3 pilar utama di atas.
3. **Score 0-6 = PASS**: Fluff, klarifikasi PR manajemen, insider buy receh, rumor, berita makro umum, atau berita tanpa angka.

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

    // --- AUTO PASS UNTUK PDF & KATEGORI SKIP ---
    if (title?.includes('PDF Document') || content?.includes('Dokumen PDF')) {
      console.log(`[Score] URL PDF terdeteksi. Melewati berita.`);
      return res.status(200).json({
        score: 0,
        decision: 'PASS',
        reason: 'Dokumen PDF dilewati untuk saat ini.',
        catalyst: null,
        dataQuality: 'low',
      });
    }

    if (category === 'SKIP') {
      console.log(`[Score] Kategori SKIP terdeteksi. Melewati berita.`);
      return res.status(200).json({
        score: 0,
        decision: 'PASS',
        reason: 'Kategori berita diklasifikasikan sebagai SKIP.',
        catalyst: null,
        dataQuality: 'low',
      });
    }
    // -------------------------------------------

    // --- CEK DUPLIKASI BERITA BERDASARKAN TICKER HARI INI ---
    if (ticker && ticker !== 'null') {
      try {
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

        // 1. Cek di tabel automation_posts (jika sudah benar-benar terpublish di sosmed)
        const { data: publishedPosts, error: err1 } = await supabaseServer
          .from('automation_posts')
          .select('id')
          .eq('workflow_type', 'news_monitoring')
          .gte('created_at', `${todayStr}T00:00:00+07:00`)
          .ilike('caption', `%#${ticker.toLowerCase()}%`)
          .limit(1);

        // 2. Cek di tabel sector_trigger_news (jika berita dengan ticker ini sudah mendapat score GENERATE hari ini)
        const { data: scrapedNews, error: err2 } = await supabaseServer
          .from('sector_trigger_news')
          .select('id')
          .contains('symbols', [ticker])
          .eq('decision', 'GENERATE')
          .gte('created_at', `${todayStr}T00:00:00+07:00`)
          .limit(1);

        if (
          (!err1 && publishedPosts && publishedPosts.length > 0) ||
          (!err2 && scrapedNews && scrapedNews.length > 0)
        ) {
          console.log(`[Score] Ticker ${ticker} sudah diproses/dipublish hari ini. Melewati berita.`);
          return res.status(200).json({
            score: 0,
            decision: 'PASS',
            reason: `Berita dengan emiten ${ticker} sudah pernah digenerate/dipublish hari ini. Menghindari duplikasi.`,
            catalyst: null,
            dataQuality: 'low',
          });
        }
      } catch (e) {
        console.error('[Score] Gagal mengecek duplikasi DB:', e);
      }
    }
    // ---------------------------------------------------------

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields: title, content',
      });
    }

    if (!isLlmConfigured()) {
      return res.status(500).json({ error: 'LLM not configured (GEMINI_API_KEY missing)' });
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

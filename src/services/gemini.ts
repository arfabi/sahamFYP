const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface ClassificationResult {
  category: 'SINGLE_STOCK' | 'MACRO_ECONOMY' | 'SECTOR_ANALYSIS' | 'CORPORATE_ACTION' | 'IPO_RIGHTS_ISSUE' | 'SUSPENSION_DELISTING' | 'SKIP';
  ticker: string | null;
  sector: string | null;
  confidence: number;
  reason: string;
}

export async function generateContent(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }

  return data.candidates[0].content.parts[0].text;
}

export async function classifyContent(title: string, content: string): Promise<ClassificationResult> {
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }

  const rawOutput = data.candidates[0].content.parts[0].text;
  
  try {
    const result: ClassificationResult = JSON.parse(rawOutput);
    return result;
  } catch (error) {
    console.error('Failed to parse classification result:', rawOutput);
    throw new Error('Failed to parse classification result');
  }
}

// ================= AUTO CAPTION GENERATOR =================
// Generate caption Instagram dari data carousel via Gemini

export interface CaptionContext {
  handle?: string;
  badgeText?: string;
  title: string;
  description?: string;
  source?: string;
  tldrCards?: string[];
  metrics?: { label: string; value: string }[];
  bullets?: string[];
  category?: string;
}

export async function generateInstagramCaption(context: CaptionContext): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const tldrText = (context.tldrCards || []).map(t => `• ${t}`).join('\n');
  const metricText = (context.metrics || []).map(m => `• ${m.label}: ${m.value}`).join('\n');
  const bulletText = (context.bullets || []).map(b => `• ${b}`).join('\n');

  const prompt = `
Kamu adalah Social Media Content Creator untuk akun Instagram finansial @sahamfyp. 
Tugasmu adalah membuat SATU caption Instagram menarik untuk post carousel tentang berita saham Indonesia.

STYLE GUIDELINES:
- Bahasa: Indonesia kasual (campur dengan slang muda seperti "kok bisa", "nggak", "dong", dll) — natural, bukan bahasa terlalu formal
- Atraktor: hook kuat di kalimat pertama (question, surprise, atau angka)
- Informasi: ringkasan dari data, pergerakan harga, keuntungan — informatif tapi kasual
- CTA: ajak audiens comment/share (contoh: "Lo pegang saham ini? Drop di komentar 👇")
- Disclaimer: selalu include "DYOR - Do Your Own Research" di end
- Format: maksimal 300 karakter (Instagram caption limit untuk carousel)
- Hashtags: 3-5 hashtag relevan (#saham #investasi #{ticker} #analisis #stock)

STRUCTURE:
1. Hook (1-2 kalimat)
2. Info utama (2-4 kalimat, dari data)
3. CTA (1 kalimat)  
4. Hashtags + DYOR

OUTPUT: Text saja (plain text), NO quotes, NO markdown, NO json.

---
DATA CAROUSEL:
- Kategori: ${context.category || 'N/A'}
- Judul: ${context.title}
${context.description ? `- Deskripsi: ${context.description}` : ''}
${context.source ? `- Sumber: ${context.source}` : ''}
${context.badgeText ? `- Ticker: ${context.badgeText}` : ''}
${tldrText ? `\nTLDR POINTS:\n${tldrText}` : ''}
${metricText ? `\nMETRIC DATA:\n${metricText}` : ''}
${bulletText ? `\nBULLETS:\n${bulletText}` : ''}
`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }

  return data.candidates[0].content.parts[0].text.trim();
}


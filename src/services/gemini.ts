const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

export async function classifyContent(title: string, content: string): Promise<any> {
  const prompt = `
Kamu adalah classifier konten berita keuangan untuk Instagram carousel @sahamfyp.

Klasifikasikan berita berikut ke salah satu dari 6 kategori:
1. SINGLE_STOCK - Berita spesifik tentang 1 emiten (ticker)
2. MACRO_ECONOMY - Berita ekonomi makro (BI rate, inflasi, GDP, dll)
3. SECTOR_ANALYSIS - Analisis sektor/industri (perbankan, pertambangan, dll)
4. CORPORATE_ACTION - Corporate action (dividen, stock split, rights issue, dll)
5. IPO_RIGHTS_ISSUE - IPO atau rights issue
6. SUSPENSION_DELISTING - Suspensi atau delisting saham
7. SKIP - Tidak relevan dengan keuangan/investasi

Judul: ${title}
Konten: ${content}

Response dalam format JSON:
{
  "category": "SINGLE_STOCK",
  "ticker": "BBCA",
  "sector": "Financials",
  "confidence": 0.95,
  "reason": "Berita tentang laba bersih BBCA Q1 2024"
}

Jika kategori adalah SKIP, ticker dan sector bisa null.
`;

  const response = await generateContent(prompt);
  
  // Parse JSON dari response
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response');
  } catch (error) {
    console.error('Failed to parse classifier response:', response);
    throw new Error('Failed to parse classification result');
  }
}

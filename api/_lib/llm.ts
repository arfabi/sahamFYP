// ============================================================
// Server-side LLM client — OpenAI-compatible Chat Completions API
// Multi-Key Pool & Smart Load Balancing / Failover
//
// Mendukung Google AI Studio, Sumopod, Groq, DeepSeek, OpenRouter, OpenAI, dll.
//
// Fitur Multi-Key:
//   1. Masukkan multiple API keys dipisah koma di SUMOPOD_API_KEY / OPENAI_API_KEY
//      atau via SUMOPOD_API_KEY_1, SUMOPOD_API_KEY_2, SUMOPOD_API_KEY_3 (dsb).
//   2. Smart Round-Robin: Membagi beban request secara seimbang ke seluruh key.
//   3. Auto-Failover: Jika satu key terkena Rate Limit (HTTP 429) atau Quota Exceeded (403),
//      sistem otomatis menandai key tersebut dalam cool-down 60 detik dan
//      langsung mengalihkan request ke key berikutnya tanpa error di user!
// ============================================================

const DEFAULT_BASE_URL = 'https://ai.sumopod.com/v1';
const DEFAULT_MODEL = 'gemini/gemini-3.1-flash-lite';

export interface ChatOptions {
  /** Minta output JSON valid (response_format: json_object) */
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  /** Override model untuk request ini saja */
  model?: string;
}

interface ChatPayload {
  model: string;
  messages: Array<{ role: 'user'; content: string }>;
  temperature: number;
  max_tokens: number;
  response_format?: { type: 'json_object' };
}

export interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string };
}

class LlmRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'LlmRequestError';
    this.status = status;
  }
}

// --- Multi-Key Pool & Cool-down Management ---
const keyCooldowns = new Map<string, number>();
let roundRobinIndex = 0;

/** Ambil seluruh API Key khusus News Monitoring & General (GEMINI / Free Pool) */
export function getAllApiKeys(): string[] {
  const rawList: string[] = [];

  // 1. Dari GEMINI_API_KEY atau OPENAI_API_KEY (bisa dipisah koma/titik koma)
  const mainKeys = [
    process.env.GEMINI_API_KEY,
    process.env.OPENAI_API_KEY,
  ];

  for (const raw of mainKeys) {
    if (raw) {
      const split = raw.split(/[,;\n]/).map(k => k.trim()).filter(Boolean);
      rawList.push(...split);
    }
  }

  // 2. Dari indexed env vars (GEMINI_API_KEY_1, GEMINI_API_KEY_2, dsb)
  for (let i = 1; i <= 10; i++) {
    const k1 = process.env[`GEMINI_API_KEY_${i}`]?.trim();
    if (k1) rawList.push(k1);
    const k2 = process.env[`OPENAI_API_KEY_${i}`]?.trim();
    if (k2) rawList.push(k2);
  }

  // Fallback transisi jika user belum rename SUMOPOD_API_KEY di environment lokal
  if (rawList.length === 0 && process.env.SUMOPOD_API_KEY) {
    const split = process.env.SUMOPOD_API_KEY.split(/[,;\n]/).map(k => k.trim()).filter(Boolean);
    rawList.push(...split);
  }

  // Deduplikasi
  return Array.from(new Set(rawList));
}

export function maskKey(key: string): string {
  if (!key) return '(empty)';
  if (key.length <= 8) return `${key.slice(0, 3)}...`;
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export function isLlmConfigured(): boolean {
  return getAllApiKeys().length > 0;
}

/** Ambil seluruh API Key khusus Daily Brief open.ts (SUMOPOD / Paid LLM) */
export function getBriefApiKeys(): string[] {
  const rawList: string[] = [];
  const briefKeys = [
    process.env.SUMOPOD_API_KEY,
    process.env.OPEN_LLM_API_KEY,
    process.env.BRIEF_LLM_API_KEY,
    process.env.PAID_LLM_API_KEY,
  ];

  for (const raw of briefKeys) {
    if (raw) {
      const split = raw.split(/[,;\n]/).map(k => k.trim()).filter(Boolean);
      rawList.push(...split);
    }
  }

  for (let i = 1; i <= 5; i++) {
    const k1 = process.env[`SUMOPOD_API_KEY_${i}`]?.trim();
    if (k1) rawList.push(k1);
    const k2 = process.env[`OPEN_LLM_API_KEY_${i}`]?.trim();
    if (k2) rawList.push(k2);
  }

  return Array.from(new Set(rawList));
}

export function isBriefLlmConfigured(): boolean {
  return getBriefApiKeys().length > 0;
}

export function getLlmConfig(): {
  configured: boolean;
  baseUrl: string;
  model: string;
  totalKeys: number;
  activeKeys: number;
} {
  const keys = getAllApiKeys();
  const now = Date.now();
  const activeKeys = keys.filter(k => (keyCooldowns.get(k) || 0) <= now).length;

  return {
    configured: keys.length > 0,
    baseUrl: (
      process.env.GEMINI_BASE_URL ||
      process.env.OPENAI_BASE_URL ||
      'https://generativelanguage.googleapis.com/v1beta/openai'
    ).replace(/\/+$/, ''),
    model: process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || 'gemini-3.1-flash-lite',
    totalKeys: keys.length,
    activeKeys,
  };
}

/** Urutkan key pool: round-robin awal, dahulukan yang tidak sedang cool-down */
function getOrderedCandidateKeys(): string[] {
  const keys = getAllApiKeys();
  if (keys.length === 0) return [];

  const now = Date.now();
  const n = keys.length;

  // Dapatkan urutan round-robin
  const start = (roundRobinIndex++) % n;
  const rotated: string[] = [];
  for (let i = 0; i < n; i++) {
    rotated.push(keys[(start + i) % n]);
  }

  // Pisahkan yang aktif vs yang dalam cool-down
  const active = rotated.filter(k => (keyCooldowns.get(k) || 0) <= now);
  const cooling = rotated.filter(k => (keyCooldowns.get(k) || 0) > now);

  // Jalankan yang aktif dulu, jika semua cooling, pakai urutan waktu cool-down tercepat
  cooling.sort((a, b) => (keyCooldowns.get(a) || 0) - (keyCooldowns.get(b) || 0));

  return [...active, ...cooling];
}

function buildPayload(prompt: string, options: ChatOptions): ChatPayload {
  const model = options.model || process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || 'gemini-3.1-flash-lite';
  const payload: ChatPayload = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  };

  if (options.json) {
    payload.response_format = { type: 'json_object' };
  }

  return payload;
}

async function requestWithKey(baseUrl: string, apiKey: string, payload: ChatPayload): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new LlmRequestError(response.status, `LLM API error: ${response.status} - ${raw}`);
  }

  let data: ChatCompletionResponse;
  try {
    data = JSON.parse(raw) as ChatCompletionResponse;
  } catch {
    throw new Error(`LLM API returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response from LLM');
  }

  return content;
}

/** Kirim prompt ke LLM dengan multi-key routing, load balancing & failover (News Monitoring / GEMINI) */
export async function chatComplete(prompt: string, options: ChatOptions = {}): Promise<string> {
  const candidateKeys = getOrderedCandidateKeys();
  if (candidateKeys.length === 0) {
    throw new Error('LLM API key not configured (set GEMINI_API_KEY in environment)');
  }

  const baseUrl = (
    process.env.GEMINI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    'https://generativelanguage.googleapis.com/v1beta/openai'
  ).replace(/\/+$/, '');

  const payload = buildPayload(prompt, options);

  let lastError: any = null;

  for (let i = 0; i < candidateKeys.length; i++) {
    const currentKey = candidateKeys[i];
    const masked = maskKey(currentKey);

    try {
      try {
        const result = await requestWithKey(baseUrl, currentKey, payload);
        // Hapus status cooldown jika berhasil
        keyCooldowns.delete(currentKey);
        return result;
      } catch (err: any) {
        // Fallback untuk model yang tidak support json_object mode
        const jsonModeUnsupported =
          options.json === true &&
          err instanceof LlmRequestError &&
          err.status === 400 &&
          /response_format|json_object|json mode/i.test(err.message);

        if (jsonModeUnsupported) {
          console.warn(`[LLM Pool] json mode tidak didukung model di key ${masked}, retry tanpa response_format`);
          const fallbackPayload: ChatPayload = { ...payload };
          delete fallbackPayload.response_format;
          const result = await requestWithKey(baseUrl, currentKey, fallbackPayload);
          keyCooldowns.delete(currentKey);
          return result;
        }

        throw err;
      }
    } catch (error: any) {
      lastError = error;
      const status = error instanceof LlmRequestError ? error.status : 0;
      const errorMsg = error?.message || String(error);

      // Tangani Rate Limit (429) atau Quota Exceeded (403) atau 5xx
      const isRateLimitOrQuota =
        status === 429 ||
        status === 403 ||
        /quota|rate limit|too many requests|resource has been exhausted|blocked/i.test(errorMsg);

      const isServerError = status >= 500 && status < 600;

      if (isRateLimitOrQuota || isServerError) {
        // Beri cool-down 60 detik untuk key ini
        keyCooldowns.set(currentKey, Date.now() + 60_000);
        console.warn(
          `[LLM Pool] Key ${masked} terkendala status ${status || 'ERR'} (${isRateLimitOrQuota ? 'Rate Limit/Quota' : 'Server Error'}). ` +
          `Masuk cool-down 60s. Auto-failover ke key berikutnya (${i + 1}/${candidateKeys.length})...`
        );
        // Lanjutkan mencoba key berikutnya di loop
        continue;
      }

      // Jika error 400 atau error klien lainnya yang bukan rate limit, langsung throw
      throw error;
    }
  }

  // Jika seluruh key telah dicoba dan semuanya gagal
  throw new Error(`[LLM Pool] Seluruh API Key (${candidateKeys.length}) gagal diproses. Error terakhir: ${lastError?.message || lastError}`);
}

/** Buang markdown code fence & ambil objek JSON pertama dari response LLM */
export function extractJson(raw: string): any {
  let text = (raw || '').trim();

  // Strip code block fences
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    // lanjut ke pembersihan
  }

  // Coba ekstrak substring {...} jika ada text ekstra di luar JSON
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    const candidate = match[0];
    try {
      return JSON.parse(candidate);
    } catch {
      // Coba bersihkan trailing commas & unescaped control chars
      try {
        const sanitized = candidate
          .replace(/,\s*([\}\]])/g, '$1') // remove trailing commas
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => (c === '\n' || c === '\r' || c === '\t' ? c : ''));
        return JSON.parse(sanitized);
      } catch {
        // jatuh ke error
      }
    }
  }

  // Coba perbaiki truncated JSON jika terpotong di tengah jalan (auto-close brackets/quotes)
  let partial = text.startsWith('{') ? text : (text.match(/\{[\s\S]*/)?.[0] || text);
  if (partial.startsWith('{')) {
    // Strip unfinished trailing tokens/keys
    partial = partial.replace(/,\s*"[^"]*"?\s*:\s*([^"\{\[\s,]+)?$/, '');
    partial = partial.replace(/,\s*$/, '');

    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < partial.length; i++) {
      const char = partial[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
      }
    }

    if (inString) partial += '"';
    while (openBrackets > 0) { partial += ']'; openBrackets--; }
    while (openBraces > 0) { partial += '}'; openBraces--; }

    try {
      const parsed = JSON.parse(partial);
      console.warn('[LLM] Output JSON terpotong tetapi berhasil di-repair secara otomatis.');
      return parsed;
    } catch {
      // lanjut ke error
    }
  }

  console.error('[LLM] Failed to parse JSON response (first 1000 chars):', text.slice(0, 1000));
  throw new Error('Failed to parse LLM JSON response');
}

/** Kirim prompt ke LLM + parse hasilnya sebagai JSON */
export async function generateJson<T = any>(prompt: string, options: ChatOptions = {}): Promise<T> {
  const raw = await chatComplete(prompt, { ...options, json: true });
  return extractJson(raw) as T;
}

/** Kirim prompt ke LLM + kembalikan plain text (trimmed) */
export async function generateContent(prompt: string, options: ChatOptions = {}): Promise<string> {
  const raw = await chatComplete(prompt, options);
  return raw.trim();
}

/** Kirim prompt ke LLM khusus Daily Brief open.ts (SUMOPOD / Paid LLM) dengan failover dan auto-fallback */
export async function chatCompleteBrief(prompt: string, options: ChatOptions = {}): Promise<string> {
  const briefKeys = getBriefApiKeys();

  // Jika env SUMOPOD belum diset, otomatis fallback ke LLM GEMINI default
  if (briefKeys.length === 0) {
    console.warn('[LLM Brief] SUMOPOD_API_KEY belum diset. Fallback menggunakan GEMINI_API_KEY default.');
    return chatComplete(prompt, options);
  }

  const baseUrl = (
    process.env.SUMOPOD_BASE_URL ||
    process.env.OPEN_LLM_BASE_URL ||
    'https://ai.sumopod.com/v1'
  ).replace(/\/+$/, '');

  const model =
    options.model ||
    process.env.SUMOPOD_MODEL ||
    process.env.OPEN_LLM_MODEL ||
    'gemini/gemini-3.1-flash-lite';

  const payload: ChatPayload = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  };

  if (options.json) {
    payload.response_format = { type: 'json_object' };
  }

  let lastError: any = null;

  for (let i = 0; i < briefKeys.length; i++) {
    const currentKey = briefKeys[i];
    const masked = maskKey(currentKey);

    try {
      try {
        const result = await requestWithKey(baseUrl, currentKey, payload);
        return result;
      } catch (err: any) {
        const jsonModeUnsupported =
          options.json === true &&
          err instanceof LlmRequestError &&
          err.status === 400 &&
          /response_format|json_object|json mode/i.test(err.message);

        if (jsonModeUnsupported) {
          console.warn(`[LLM Brief] json mode tidak didukung model ${model} di key ${masked}, retry tanpa response_format`);
          const fallbackPayload: ChatPayload = { ...payload };
          delete fallbackPayload.response_format;
          return await requestWithKey(baseUrl, currentKey, fallbackPayload);
        }
        throw err;
      }
    } catch (error: any) {
      lastError = error;
      const status = error instanceof LlmRequestError ? error.status : 0;
      console.warn(`[LLM Brief] Key ${masked} gagal (status ${status}): ${error?.message || error}.`);
      continue;
    }
  }

  // Jika seluruh key berbayar gagal, fallback ke default LLM agar open.ts tetap jalan
  console.error(`[LLM Brief] Seluruh key berbayar gagal (${briefKeys.length}). Fallback ke LLM default.`);
  return chatComplete(prompt, options);
}

/** Kirim prompt ke LLM khusus Daily Brief + parse hasilnya sebagai JSON */
export async function generateBriefJson<T = any>(prompt: string, options: ChatOptions = {}): Promise<T> {
  const raw = await chatCompleteBrief(prompt, { ...options, json: true });
  return extractJson(raw) as T;
}


// ============================================================
// Server-side LLM client — OpenAI-compatible Chat Completions API
// Provider default: Sumopod (https://ai.sumopod.com)
//
//   POST {BASE_URL}/chat/completions
//   Authorization: Bearer <SUMOPOD_API_KEY>
//   body: { model, messages: [{ role: 'user', content }], temperature, max_tokens }
//
// Env vars (non-prefixed, dibaca serverless functions saja):
//   SUMOPOD_API_KEY   — wajib, dari dashboard Sumopod
//   SUMOPOD_BASE_URL  — opsional, default https://ai.sumopod.com/v1
//   SUMOPOD_MODEL     — opsional, default gemini/gemini-3.1-flash-lite
//   (OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_MODEL dipakai sebagai fallback)
// ============================================================

const DEFAULT_BASE_URL = 'https://ai.sumopod.com/v1';
const DEFAULT_MODEL = 'gemini/gemini-3.1-flash-lite';

const LLM_API_KEY = process.env.SUMOPOD_API_KEY || process.env.OPENAI_API_KEY || '';
const LLM_BASE_URL = (
  process.env.SUMOPOD_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  DEFAULT_BASE_URL
).replace(/\/+$/, '');
const LLM_MODEL = process.env.SUMOPOD_MODEL || process.env.OPENAI_MODEL || DEFAULT_MODEL;

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

export function isLlmConfigured(): boolean {
  return !!LLM_API_KEY;
}

export function getLlmConfig(): { configured: boolean; baseUrl: string; model: string } {
  return {
    configured: isLlmConfigured(),
    baseUrl: LLM_BASE_URL,
    model: LLM_MODEL,
  };
}

function buildPayload(prompt: string, options: ChatOptions): ChatPayload {
  const payload: ChatPayload = {
    model: options.model || LLM_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  };

  if (options.json) {
    payload.response_format = { type: 'json_object' };
  }

  return payload;
}

async function requestChat(payload: ChatPayload): Promise<string> {
  const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`,
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

/** Kirim prompt ke LLM, kembalikan raw text response */
export async function chatComplete(prompt: string, options: ChatOptions = {}): Promise<string> {
  if (!LLM_API_KEY) {
    throw new Error('LLM API key not configured (set SUMOPOD_API_KEY)');
  }

  const payload = buildPayload(prompt, options);

  try {
    return await requestChat(payload);
  } catch (error) {
    // Sebagian gateway/model tidak mendukung response_format: json_object
    // → retry sekali tanpa json mode
    const jsonModeUnsupported =
      options.json === true &&
      error instanceof LlmRequestError &&
      error.status === 400 &&
      /response_format|json_object|json mode/i.test(error.message);

    if (!jsonModeUnsupported) throw error;

    console.warn('[LLM] json mode tidak didukung model, retry tanpa response_format');
    const fallbackPayload: ChatPayload = { ...payload };
    delete fallbackPayload.response_format;
    return requestChat(fallbackPayload);
  }
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
      // Coba bersihkan trailing commas & unescaped control chars (e.g. raw newlines dalam string)
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

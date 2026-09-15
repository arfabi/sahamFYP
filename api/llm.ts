import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateApiKey, parseBody } from './_lib/auth.js';
import { chatComplete, generateJson, getLlmConfig, isLlmConfigured } from './_lib/llm.js';

/**
 * POST /api/llm
 * Proxy prompt dari browser ke LLM (Sumopod — OpenAI compatible), supaya
 * API key provider TIDAK pernah ter-expose ke client bundle.
 *
 * Body: { prompt: string, json?: boolean, temperature?: number, maxTokens?: number }
 * Response: { model, text }        → text mode (default)
 *           { model, data }        → json mode (json: true)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!validateApiKey(req)) return res.status(401).json({ error: 'Invalid or missing API key' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, json, temperature, maxTokens } = parseBody<{
    prompt?: string;
    json?: boolean;
    temperature?: number;
    maxTokens?: number;
  }>(req);

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (!isLlmConfigured()) {
    return res.status(500).json({ error: 'LLM not configured (SUMOPOD_API_KEY missing)' });
  }

  const { model } = getLlmConfig();
  const options = { temperature, maxTokens };

  try {
    if (json) {
      const data = await generateJson(prompt, options);
      return res.status(200).json({ model, data });
    }

    const text = await chatComplete(prompt, options);
    return res.status(200).json({ model, text: text.trim() });
  } catch (error) {
    console.error('[LLM] Error:', error);
    return res.status(500).json({
      error: 'Failed to generate LLM response',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

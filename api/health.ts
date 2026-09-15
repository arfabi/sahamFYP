import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLlmConfig } from './_lib/llm.js';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const llm = getLlmConfig();
  res.status(200).json({
    status: 'ok',
    service: 'SahamFYP',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: {
      llm: llm.configured,
      llmModel: llm.model,
      llmBaseUrl: llm.baseUrl,
      sectors: !!process.env.SECTORS_API_KEY,
      supabase: !!process.env.SUPABASE_URL,
      supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      repliz: !!process.env.REPLIZ_ACCESS_KEY,
    },
  });
}
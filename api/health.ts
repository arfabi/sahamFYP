import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    service: 'SahamFYP',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: {
      gemini: !!process.env.GEMINI_API_KEY,
      sectors: !!process.env.SECTORS_API_KEY,
      supabase: !!process.env.SUPABASE_URL,
      supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      repliz: !!process.env.REPLIZ_ACCESS_KEY,
    },
  });
}
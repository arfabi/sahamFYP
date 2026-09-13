import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from '../_lib/supabase.js';

// --- Types ---
interface UpdateFields {
  title?: string | null;
  category?: string | null;
  ticker?: string | null;
  content?: string | null;
  description?: string | null;
  image?: string | null;
  siteName?: string | null;
  score?: number | null;
  decision?: string | null;
  reason?: string | null;
}

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as UpdateFields & { url: string };

    if (!body.url) {
      return res.status(400).json({ error: 'url is required' });
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    const fields: (keyof UpdateFields)[] = [
      'title', 'category', 'ticker', 'content',
      'description', 'image', 'siteName', 'score', 'decision', 'reason'
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        // Parse score to integer if provided
        if (field === 'score' && body[field] !== null && body[field] !== undefined) {
          updateData[field] = typeof body[field] === 'string' 
            ? parseInt(body[field] as string, 10) || 0 
            : body[field];
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const { data, error } = await supabaseServer
      .from('news_scrape')
      .update(updateData)
      .eq('url', body.url)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'URL not found in news_scrape' });
      }
      throw error;
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error('[news-scrape:update] Error:', error);
    return res.status(500).json({
      error: 'Failed to update record',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

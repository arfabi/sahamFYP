import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from '../_lib/supabase.js';

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ error: 'url query parameter is required' });
    }

    const { data, error } = await supabaseServer
      .from('news_scrape')
      .select('id, url, title, time_scrape')
      .eq('url', url)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine
      throw error;
    }

    return res.status(200).json({
      exists: !!data,
      data: data || null,
    });
  } catch (error) {
    console.error('[news-scrape:check] Error:', error);
    return res.status(500).json({
      error: 'Failed to check URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

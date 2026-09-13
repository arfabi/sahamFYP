import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from '../_lib/supabase.js';

// --- Types ---
interface NewsScrapeRecord {
  id?: number;
  url: string;
  time_scrape?: string;
  title?: string;
  category?: string;
  ticker?: string;
  content?: string;
  description?: string;
  image?: string;
  siteName?: string;
  score?: number;
  decision?: string;
  reason?: string;
  created_at?: string;
  updated_at?: string;
}

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - List all records
    if (req.method === 'GET') {
      const limit = parseInt(req.query.limit as string) || 50;

      const { data, error } = await supabaseServer
        .from('news_scrape')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return res.status(200).json({ data, count: data?.length || 0 });
    }

    // POST - Create new record
    if (req.method === 'POST') {
      const body = req.body as NewsScrapeRecord;

      if (!body.url) {
        return res.status(400).json({ error: 'url is required' });
      }

      const record: NewsScrapeRecord = {
        url: body.url,
        time_scrape: body.time_scrape || new Date().toISOString(),
        title: body.title || null,
        category: body.category || null,
        ticker: body.ticker || null,
        content: body.content || null,
        description: body.description || null,
        image: body.image || null,
        siteName: body.siteName || null,
        score: body.score ?? null,
        decision: body.decision || 'PASS',
        reason: body.reason || null,
      };

      const { data, error } = await supabaseServer
        .from('news_scrape')
        .insert([record])
        .select()
        .single();

      if (error) {
        // If unique violation, return existing record
        if (error.code === '23505') {
          const { data: existing } = await supabaseServer
            .from('news_scrape')
            .select('*')
            .eq('url', body.url)
            .single();
          return res.status(200).json({ data: existing, exists: true });
        }
        throw error;
      }

      return res.status(201).json({ data, exists: false });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[news-scrape] Error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

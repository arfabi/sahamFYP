import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from '../_lib/supabase.js';

// --- Types ---
interface NewsScrapeRecord {
  id?: number;
  url: string;
  time_scrape?: string;
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
  created_at?: string;
  updated_at?: string;
}

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ─── GET: List all records ───
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

    // ─── POST: Create, Check, or Update ───
    if (req.method === 'POST') {
      const body = req.body as NewsScrapeRecord & { action?: string };
      const action = body.action || 'create';

      // ── Check existence ──
      if (action === 'check') {
        if (!body.url) {
          return res.status(400).json({ error: 'url is required' });
        }
        const { data, error } = await supabaseServer
          .from('news_scrape')
          .select('id, url, title, time_scrape')
          .eq('url', body.url)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return res.status(200).json({ exists: !!data, data: data || null, url: body.url });
      }

      // ── Update by URL ──
      if (action === 'update') {
        if (!body.url) {
          return res.status(400).json({ error: 'url is required' });
        }

        const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
        const fields = ['title', 'category', 'ticker', 'content', 'description', 'image', 'siteName', 'score', 'decision', 'reason'];

        for (const field of fields) {
          const val = (body as any)[field];
          if (val !== undefined) {
            if (field === 'score' && val !== null) {
              updateData[field] = typeof val === 'string' ? parseInt(val, 10) || 0 : val;
            } else {
              updateData[field] = val;
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
          if (error.code === 'PGRST116') return res.status(404).json({ error: 'URL not found' });
          throw error;
        }
        return res.status(200).json({ data });
      }

      // ── Create new record (default) ──
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

    // ─── DELETE ───
    if (req.method === 'DELETE') {
      const id = req.query.id ? parseInt(req.query.id as string) : null;
      if (!id) {
        return res.status(400).json({ error: 'id query parameter is required' });
      }
      const { error } = await supabaseServer.from('news_scrape').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
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


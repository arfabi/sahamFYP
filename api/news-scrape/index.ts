import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from '../_lib/supabase.js';

// --- Types ---
interface NewsScrapeRecord {
  id?: number | string;
  url: string;
  time_scrape?: string;
  timestamp?: string;
  published_at?: string;
  title?: string | null;
  category?: string | null;
  ticker?: string | null;
  symbols?: string[] | string | null;
  tags?: string[] | string | null;
  sector?: string | null;
  content?: string | null;
  description?: string | null;
  image?: string | null;
  sitename?: string | null;
  score?: number | null;
  decision?: string | null;
  reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

// --- Helpers ---
function formatSymbol(sym: string): string {
  if (!sym) return '';
  let clean = sym.trim().toUpperCase();
  clean = clean.replace(/\.JK$/i, '');
  if (!clean || clean === 'NULL' || clean === 'NONE') return '';
  return `${clean}.JK`;
}

function parseSymbols(symbolsInput?: any, tickerInput?: any): string[] | null {
  const list: string[] = [];

  const add = (val: string) => {
    const formatted = formatSymbol(val);
    if (formatted && !list.includes(formatted)) list.push(formatted);
  };

  if (Array.isArray(symbolsInput)) {
    for (const s of symbolsInput) {
      if (typeof s === 'string') add(s);
    }
  } else if (typeof symbolsInput === 'string' && symbolsInput.trim()) {
    try {
      const parsed = JSON.parse(symbolsInput);
      if (Array.isArray(parsed)) {
        for (const s of parsed) if (typeof s === 'string') add(s);
      } else {
        add(symbolsInput);
      }
    } catch {
      symbolsInput.split(',').forEach(add);
    }
  }

  if (tickerInput && typeof tickerInput === 'string') {
    add(tickerInput);
  }

  return list.length > 0 ? list : null;
}

function parseTags(tagsInput?: any): string[] | null {
  if (!tagsInput) return null;
  if (Array.isArray(tagsInput)) {
    const cleaned = tagsInput.map((t) => String(t).trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned : null;
  }
  if (typeof tagsInput === 'string' && tagsInput.trim()) {
    try {
      const parsed = JSON.parse(tagsInput);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map((t) => String(t).trim()).filter(Boolean);
        return cleaned.length > 0 ? cleaned : null;
      }
    } catch {
      const cleaned = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      return cleaned.length > 0 ? cleaned : null;
    }
  }
  return null;
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
        .from('sector_trigger_news')
        .select('*, url:source_url, time_scrape:timestamp, content:body, image:thumbnail_url')
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
          .from('sector_trigger_news')
          .select('id, url:source_url, title, time_scrape:timestamp, published_at')
          .eq('source_url', body.url)
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
        const fields = [
          'title', 'category', 'ticker', 'symbols', 'tags', 'content',
          'description', 'image', 'sitename', 'score', 'decision', 'reason',
          'published_at', 'timestamp', 'time_scrape', 'sector'
        ];

        for (const field of fields) {
          const val = (body as any)[field];
          if (val !== undefined) {
            if (field === 'content') {
              updateData.body = val;
            } else if (field === 'image') {
              updateData.thumbnail_url = val;
            } else if (field === 'ticker' || field === 'symbols') {
              const formattedSymbols = parseSymbols(body.symbols, body.ticker);
              if (formattedSymbols) updateData.symbols = formattedSymbols;
            } else if (field === 'tags') {
              const formattedTags = parseTags(val);
              if (formattedTags) updateData.tags = formattedTags;
            } else if (field === 'score' && val !== null) {
              updateData.score = typeof val === 'string' ? parseInt(val, 10) || 0 : val;
            } else if (field === 'published_at' || field === 'timestamp' || field === 'time_scrape') {
              updateData.published_at = val;
              updateData.timestamp = val;
            } else {
              updateData[field] = val;
            }
          }
        }

        const { data, error } = await supabaseServer
          .from('sector_trigger_news')
          .update(updateData)
          .eq('source_url', body.url)
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

      const now = new Date().toISOString();
      const newsTime = body.published_at || body.timestamp || body.time_scrape || now;
      const formattedSymbols = parseSymbols(body.symbols, body.ticker);
      const formattedTags = parseTags(body.tags);

      const record: any = {
        source_url: body.url,
        timestamp: newsTime,
        published_at: newsTime,
        title: body.title || null,
        category: body.category || null,
        symbols: formattedSymbols,
        tags: formattedTags,
        sector: body.sector || null,
        body: body.content || null,
        description: body.description || null,
        thumbnail_url: body.image || null,
        sitename: body.sitename || null,
        score: body.score ?? null,
        decision: body.decision || 'PASS',
        reason: body.reason || null,
      };

      const { data, error } = await supabaseServer
        .from('sector_trigger_news')
        .insert([record])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          const { data: existing } = await supabaseServer
            .from('sector_trigger_news')
            .select('*')
            .eq('source_url', body.url)
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
      const { error } = await supabaseServer.from('sector_trigger_news').delete().eq('id', id);
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


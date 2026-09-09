import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const N8N_API_KEY = process.env.N8N_API_KEY || '';

function validateApiKey(req: VercelRequest): boolean {
  if (!N8N_API_KEY) return true; // Skip validation if not configured
  return req.headers['x-api-key'] === N8N_API_KEY;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!validateApiKey(req)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseKey = supabaseServiceKey || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabaseServer = createClient(supabaseUrl, supabaseKey);

  try {
    if (req.method === 'GET') {
      const { status, limit = '50', offset = '0' } = req.query;

      let query = supabaseServer
        .from('generated_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit as string))
        .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

      if (status) {
        query = query.eq('instagram_status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return res.status(200).json({ posts: data, count: data?.length || 0 });
    }

    if (req.method === 'POST') {
      // Save generated content to Supabase
      const { category, ticker, title, content, naskah, classification, enrichment, image, siteName } = req.body;

      const { data, error } = await supabaseServer
        .from('generated_posts')
        .insert([{
          log_id: ticker || category || 'manual',
          handle: naskah?.handle || '@sahamfyp',
          badge_text: naskah?.badgeText || ticker || category,
          slides_json: naskah?.slides || naskah,
          total_slides: naskah?.slides?.length || 8,
          permalink: '',
          instagram_status: 'generated',
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ post: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Posts error:', error);
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    return res.status(500).json({
      error: 'Failed to process request',
      message,
    });
  }
}
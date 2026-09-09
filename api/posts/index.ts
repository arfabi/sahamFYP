import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from './_lib/supabase';
import { validateApiKey, isScrapeEndpoint, isHealthEndpoint } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isScrapeEndpoint(req.url) && !isHealthEndpoint(req.url)) {
    if (!validateApiKey(req)) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
  }

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
    return res.status(500).json({
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
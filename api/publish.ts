import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { validateApiKey, parseBody } from './_lib/auth.js';

const REPLIZ_API_BASE = 'https://api.repliz.com';
const REPLIZ_ACCESS_KEY = process.env.REPLIZ_ACCESS_KEY || '';
const REPLIZ_SECRET_KEY = process.env.REPLIZ_SECRET_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Skip API key validation for same-origin requests (from frontend)
  // API key is only required for external requests (e.g., from n8n)
  const isSameOrigin = req.headers['origin']?.includes('saham-fyp.vercel.app') || 
                       req.headers['referer']?.includes('saham-fyp.vercel.app') ||
                       !req.headers['origin']; // No origin = same-origin request
  
  if (!isSameOrigin && !validateApiKey(req)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postId, cloudinaryUrls, caption, platform = 'instagram', scheduleAt } = parseBody(req);

  if (!cloudinaryUrls || cloudinaryUrls.length === 0) {
    return res.status(400).json({ error: 'cloudinaryUrls are required' });
  }
  if (!caption) {
    return res.status(400).json({ error: 'caption is required' });
  }

  try {
    // Get account ID for platform
    const accountId = platform === 'tiktok'
      ? process.env.REPLIZ_TIKTOK_ACCOUNT_ID || process.env.REPLIZ_ACCOUNT_ID || ''
      : process.env.REPLIZ_ACCOUNT_ID || '';

    if (!accountId) {
      return res.status(400).json({ error: `No account ID configured for platform: ${platform}` });
    }

    // Build medias array
    const medias = cloudinaryUrls.map((url: string) => ({
      type: 'image',
      url,
      thumbnail: url,
      alt: '',
      customThumbnail: false,
    }));

              // Call Repliz (uses HTTP Basic Auth)
    const basicAuth = Buffer.from(`${REPLIZ_ACCESS_KEY}:${REPLIZ_SECRET_KEY}`).toString('base64');
    const response = await fetch(`${REPLIZ_API_BASE}/public/schedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: caption.slice(0, 50),
        description: caption,
        topic: '',
        type: cloudinaryUrls.length === 1 ? 'image' : 'album',
        medias,
        meta: { title: '', description: '', url: '' },
        additionalInfo: {
          isAiGenerated: false,
          isDraft: false,
          isAutoAddMusic: false,
          collaborators: [],
          music: { id: '', artist: '', name: '', thumbnail: '' },
          products: [],
          tags: [],
          mentions: [],
          link: '',
          targetCountries: [],
        },
        replies: [],
        accountId,
        // Immediate posting by default; scheduleAt only if valid future time provided
        scheduleAt: scheduleAt && new Date(scheduleAt) > new Date()
          ? scheduleAt
          : new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error: `Repliz API error: ${error}` });
    }

    const data = await response.json();
    const scheduleId = data.scheduleId || data.id;

    // Update Supabase if postId provided
    if (postId) {
      const supabaseUrl = process.env.SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      const supabaseKey = supabaseServiceKey || process.env.SUPABASE_ANON_KEY || '';

      if (supabaseUrl && supabaseKey) {
        const supabaseServer = createClient(supabaseUrl, supabaseKey);
        const updateField = platform === 'tiktok' ? 'tiktok_schedule_id' : 'schedule_id';
        const statusField = platform === 'tiktok' ? 'tiktok_status' : 'instagram_status';
        await supabaseServer
          .from('generated_posts')
          .update({
            [updateField]: scheduleId,
            [statusField]: 'scheduled',
          })
          .eq('id', postId);
      }
    }

    return res.status(200).json({
      success: true,
      scheduleId,
      platform,
      status: 'scheduled',
    });
  } catch (error) {
    console.error('Publish error:', error);
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    return res.status(500).json({
      error: 'Failed to publish',
      message,
    });
  }
}
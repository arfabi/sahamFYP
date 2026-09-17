import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseServer } from './_lib/supabase.js';
import { validateApiKey, parseBody } from './_lib/auth.js';

const REPLIZ_API_BASE = 'https://api.repliz.com';
const REPLIZ_ACCESS_KEY = process.env.REPLIZ_ACCESS_KEY || '';
const REPLIZ_SECRET_KEY = process.env.REPLIZ_SECRET_KEY || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const isSameOrigin = req.headers['origin']?.includes('saham-fyp.vercel.app') || 
                       req.headers['referer']?.includes('saham-fyp.vercel.app') ||
                       !req.headers['origin'];
  
  if (!isSameOrigin && !validateApiKey(req)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postId, cloudinaryUrls, imageUrls, caption, scheduleAt, targetAccountIds } = parseBody(req);
  
  const finalImageUrls = imageUrls || cloudinaryUrls;

  if (!finalImageUrls || finalImageUrls.length === 0) {
    return res.status(400).json({ error: 'imageUrls are required' });
  }
  if (!caption) {
    return res.status(400).json({ error: 'caption is required' });
  }

  try {
    // 1. Fetch active accounts from Supabase
    let query = supabaseServer
      .from('social_accounts')
      .select('*')
      .eq('is_active', true);
      
    if (Array.isArray(targetAccountIds) && targetAccountIds.length > 0) {
      query = query.in('id', targetAccountIds);
    }

    const { data: accounts, error: accountsError } = await query;

    if (accountsError) throw new Error(`Database error: ${accountsError.message}`);
    if (!accounts || accounts.length === 0) {
      return res.status(400).json({ error: 'No active social accounts found in database' });
    }

    const results: Array<{ platform: string; provider: string; accountName: string; status: string; scheduleId?: string; error?: string }> = [];

    // 2. Process each account in parallel
    const promises = accounts.map(async (account) => {
      try {
        if (account.provider === 'repliz') {
          // Send to Repliz API
          const basicAuth = Buffer.from(`${REPLIZ_ACCESS_KEY}:${REPLIZ_SECRET_KEY}`).toString('base64');
          
          const medias = finalImageUrls.map((url: string) => ({
            type: 'image', url, thumbnail: url, alt: '', customThumbnail: false,
          }));

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
              type: finalImageUrls.length === 1 ? 'image' : 'album',
              medias,
              meta: { title: '', description: '', url: '' },
              additionalInfo: {
                isAiGenerated: false, isDraft: false, isAutoAddMusic: false,
                collaborators: [], music: { id: '', artist: '', name: '', thumbnail: '' },
                products: [], tags: [], mentions: [], link: '', targetCountries: [],
              },
              replies: [],
              accountId: account.account_id,
              scheduleAt: scheduleAt && new Date(scheduleAt) > new Date()
                ? scheduleAt
                : new Date().toISOString(),
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Repliz error: ${errText}`);
          }
          
          const data = await response.json();
          results.push({
            platform: account.platform,
            provider: account.provider,
            accountName: account.account_name,
            status: 'success',
            scheduleId: data.scheduleId || data.id,
          });
        } 
        else if (account.provider === 'telegram') {
          // Send to Telegram Bot API (sendMediaGroup)
          if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
          
          const chatId = account.account_id;
          
          // Build media group array
          const mediaGroup = cloudinaryUrls.map((url: string, index: number) => ({
            type: 'photo',
            media: url,
            caption: index === 0 ? caption : undefined, // Attach caption only to the first image
            parse_mode: 'HTML' // Or 'MarkdownV2' depending on caption format
          }));

          const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              media: mediaGroup
            }),
          });

          if (!tgResponse.ok) {
            const errData = await tgResponse.json();
            throw new Error(`Telegram error: ${errData.description || JSON.stringify(errData)}`);
          }

          results.push({
            platform: account.platform,
            provider: account.provider,
            accountName: account.account_name,
            status: 'success',
          });
        }
        else {
          throw new Error(`Unknown provider: ${account.provider}`);
        }
      } catch (err: any) {
        console.error(`[Publish] Failed for ${account.platform} (${account.account_name}):`, err);
        results.push({
          platform: account.platform,
          provider: account.provider,
          accountName: account.account_name,
          status: 'error',
          error: err.message || JSON.stringify(err),
        });
      }
    });

    await Promise.all(promises);

    // Filter successful schedules for Repliz to update DB (optional, if we still want backward compatibility)
    const replizSuccesses = results.filter(r => r.status === 'success' && r.provider === 'repliz' && r.scheduleId);
    if (postId && replizSuccesses.length > 0) {
      // Pick the first successful scheduleId for backward compatibility
      const firstScheduleId = replizSuccesses[0].scheduleId;
      await supabaseServer
        .from('generated_posts')
        .update({
          schedule_id: firstScheduleId,
          instagram_status: 'scheduled',
        })
        .eq('id', postId);
    }

    return res.status(200).json({
      success: true,
      total_accounts: accounts.length,
      success_count: results.filter(r => r.status === 'success').length,
      error_count: results.filter(r => r.status === 'error').length,
      results,
    });
  } catch (error) {
    console.error('Publish Orchestrator error:', error);
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    return res.status(500).json({
      error: 'Failed to execute publish orchestrator',
      message,
    });
  }
}
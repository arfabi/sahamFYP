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

  const { postId, cloudinaryUrls, imageUrls, caption, scheduleAt, targetAccountIds, workflowType = 'daily_market_brief' } = parseBody(req);
  
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
          // Send to Telegram Bot API (sendPhoto or sendMediaGroup)
          if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
          
          const chatId = account.account_id;
          const tgCaption = caption ? caption.slice(0, 1024) : '';
          let tgResult: any = null;

          if (finalImageUrls.length === 1) {
            // Single image
            const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                photo: finalImageUrls[0],
                caption: tgCaption,
              }),
            });

            if (!tgResponse.ok) {
              const errData = await tgResponse.json().catch(() => ({}));
              throw new Error(`Telegram error: ${errData.description || tgResponse.statusText}`);
            }
            tgResult = await tgResponse.json();
          } else {
            // Media group (album, 2-10 photos)
            const albumImages = finalImageUrls.slice(0, 10);
            const mediaGroup = albumImages.map((url: string, index: number) => ({
              type: 'photo',
              media: url,
              caption: index === 0 ? tgCaption : undefined,
            }));

            const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                media: mediaGroup,
              }),
            });

            if (!tgResponse.ok) {
              const errData = await tgResponse.json().catch(() => ({}));
              throw new Error(`Telegram error: ${errData.description || tgResponse.statusText}`);
            }
            tgResult = await tgResponse.json();
          }

          results.push({
            platform: account.platform,
            provider: account.provider,
            accountName: account.account_name,
            status: 'success',
            scheduleId: Array.isArray(tgResult?.result)
              ? String(tgResult.result[0]?.message_id || '')
              : String(tgResult?.result?.message_id || ''),
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

    // Filter successful schedules for Repliz to update DB (backward compatibility)
    const replizSuccesses = results.filter(r => r.status === 'success' && r.provider === 'repliz' && r.scheduleId);
    if (postId && replizSuccesses.length > 0) {
      const firstScheduleId = replizSuccesses[0].scheduleId;
      await supabaseServer
        .from('generated_posts')
        .update({
          schedule_id: firstScheduleId,
          instagram_status: 'scheduled',
        })
        .eq('id', postId);
    }

    // Save to automation_posts if workflowType is provided (e.g. from n8n automations)
    const anySuccess = results.find(r => r.status === 'success');
    if (workflowType && anySuccess) {
      const cleanAccountName = anySuccess.accountName.replace('@', '');
      const postLink = anySuccess.platform === 'telegram'
        ? (anySuccess.accountName.startsWith('@') ? `https://t.me/${cleanAccountName}` : '')
        : '';

      await supabaseServer
        .from('automation_posts')
        .insert({
          workflow_type: workflowType,
          account_id: anySuccess.accountName,
          caption: caption,
          thumbnail_url: finalImageUrls[0],
          post_link: postLink,
          post_id: anySuccess.scheduleId || '',
          status: 'success',
        });
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
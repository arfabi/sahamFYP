import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { validateApiKey, parseBody } from '../_lib/auth.js';

/** Coerce nilai menjadi array (handles stringified JSON too); null jika bukan array */
function coerceArray(value: any): any[] | null {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* not JSON — ignore */
    }
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Skip API key validation for same-origin requests (from frontend)
  // API key is only required for external requests (e.g., from n8n)
  const isSameOrigin = req.headers['origin']?.includes('saham-fyp.vercel.app') || 
                       req.headers['referer']?.includes('saham-fyp.vercel.app') ||
                       req.headers['origin']?.includes('localhost') ||
                       req.headers['referer']?.includes('localhost') ||
                       req.headers['origin']?.includes('127.0.0.1') ||
                       req.headers['referer']?.includes('127.0.0.1') ||
                       !req.headers['origin']; // No origin = same-origin request
  
  if (!isSameOrigin && !validateApiKey(req)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseKey = supabaseServiceKey || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

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

      if (status && status !== 'all') {
        query = query.eq('instagram_status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return res.status(200).json({ posts: data, count: data?.length || 0 });
    }

    if (req.method === 'POST') {
      const body = parseBody<Record<string, any>>(req);

      // ── Action: Sync Status from Repliz Schedule API ─────────────
      if (body.action === 'sync-repliz' || body.action === 'get-repliz-details') {
        const scheduleId = body.scheduleId || body.schedule_id;
        const recordId = body.recordId || body.id;
        const postType = body.type || 'automation'; // 'automation' | 'manual'

        if (!scheduleId) {
          return res.status(400).json({ error: 'scheduleId is required' });
        }

        const replizAccessKey = process.env.REPLIZ_ACCESS_KEY || process.env.VITE_REPLIZ_ACCESS_KEY || '';
        const replizSecretKey = process.env.REPLIZ_SECRET_KEY || process.env.VITE_REPLIZ_SECRET_KEY || '';

        if (!replizAccessKey || !replizSecretKey) {
          return res.status(500).json({ error: 'Repliz credentials (REPLIZ_ACCESS_KEY/REPLIZ_SECRET_KEY) not configured' });
        }

        const basicAuth = Buffer.from(`${replizAccessKey}:${replizSecretKey}`).toString('base64');
        const authHeader = `Basic ${basicAuth}`;

        // Get schedule data from Repliz (/public/schedule/{scheduleId})
        const schedRes = await fetch(`https://api.repliz.com/public/schedule/${scheduleId}`, {
          headers: { 'Authorization': authHeader },
        });

        if (!schedRes.ok) {
          const errText = await schedRes.text().catch(() => '');
          return res.status(200).json({
            success: false,
            scheduleStatus: 'not_found',
            scheduleId,
            error: `Repliz schedule not found or error (${schedRes.status}): ${errText}`,
            message: `Schedule ID (${scheduleId}) tidak ditemukan di Repliz atau belum terdaftar.`,
          });
        }

        const scheduleData = await schedRes.json();
        const schedStatus = (scheduleData.status || 'pending').toLowerCase();
        const isPublished = schedStatus === 'success' || schedStatus === 'published' || schedStatus === 'completed';
        const isFailed = schedStatus === 'failed' || schedStatus === 'error' || schedStatus === 'cancelled';
        const dbStatus = isPublished ? 'success' : isFailed ? 'error' : 'pending';
        const medias = scheduleData.medias || [];

        // Update status di Supabase
        try {
          if (postType === 'automation') {
            if (recordId) {
              await supabaseServer
                .from('automation_posts')
                .update({
                  status: dbStatus,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', recordId);
            } else {
              await supabaseServer
                .from('automation_posts')
                .update({
                  status: dbStatus,
                  updated_at: new Date().toISOString(),
                })
                .eq('post_id', scheduleId);
            }
          } else {
            const igStatus = isPublished ? 'published' : isFailed ? 'failed' : 'scheduled';
            if (recordId) {
              await supabaseServer
                .from('generated_posts')
                .update({
                  instagram_status: igStatus,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', recordId);
            } else {
              await supabaseServer
                .from('generated_posts')
                .update({
                  instagram_status: igStatus,
                  updated_at: new Date().toISOString(),
                })
                .eq('schedule_id', scheduleId);
            }
          }
        } catch (dbErr) {
          console.error('[sync-repliz] Failed to update DB status:', dbErr);
        }

        return res.status(200).json({
          success: true,
          status: schedStatus,
          scheduleStatus: schedStatus,
          isPublished,
          scheduleId,
          medias,
          schedule: scheduleData,
          message: isPublished
            ? `Postingan terverifikasi sudah terbit (STATUS: ${schedStatus.toUpperCase()})!`
            : isFailed
            ? `Status Repliz: ${schedStatus.toUpperCase()} (Gagal publish).`
            : `Status Repliz: ${schedStatus.toUpperCase()} (Masih dalam antrean proses).`,
        });
      }

      const { category, ticker, naskah, logId, log_id } = body;

      // Support BOTH payload shapes:
      //  1) n8n wrapper:  { category, ticker, naskah: { handle, badgeText, slides, ... } }
      //  2) frontend/flat: { handle, badge_text, badge_bg_color, badge_text_color, slides_json, total_slides, schedule_id, instagram_status, permalink, ... }
      const slides = coerceArray(naskah?.slides) ?? coerceArray(body.slides_json) ?? coerceArray(naskah);

      const insertData: Record<string, any> = {
        handle: body.handle || naskah?.handle || '@sahamfyp',
        // badge_text is NOT NULL in the table — always needs a final fallback
        badge_text: body.badge_text || naskah?.badgeText || ticker || category || 'SAHAMFYP',
        slides_json: slides || [],
        total_slides: slides?.length || body.total_slides || 8,
        instagram_status: body.instagram_status || 'generated',
      };

      // Optional columns — passthrough jika diberikan (nun comment han)
      const badgeBg = body.badge_bg_color || naskah?.badgeBgColor;
      if (badgeBg) insertData.badge_bg_color = badgeBg;
      const badgeTextColor = body.badge_text_color || naskah?.badgeTextColor;
      if (badgeTextColor) insertData.badge_text_color = badgeTextColor;
      if (body.schedule_id) insertData.schedule_id = body.schedule_id;
      if (body.permalink) insertData.permalink = body.permalink;
      if (body.tiktok_status) insertData.tiktok_status = body.tiktok_status;
      if (body.tiktok_schedule_id) insertData.tiktok_schedule_id = body.tiktok_schedule_id;

      // log_id is a FK to content_logs.id (uuid) - only set if a valid content_log uuid is passed
      const resolvedLogId = logId || log_id;
      if (resolvedLogId) {
        insertData.log_id = resolvedLogId;
      }

      const { data, error } = await supabaseServer
        .from('generated_posts')
        .insert([insertData])
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
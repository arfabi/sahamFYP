// Vite Plugin: Handle /api/posts locally for development (matches api/posts/index.ts)
import type { Plugin } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local or process.env
dotenv.config({ path: '.env.local' });

function parseRequestBody<T = any>(req: any): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    req.on('data', (chunk: any) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve({} as T);
      try {
        resolve(JSON.parse(raw) as T);
      } catch {
        resolve({} as T);
      }
    });
    req.on('error', reject);
  });
}

export function postsPlugin(): Plugin {
  return {
    name: 'posts-plugin',
    configureServer(server) {
      server.middlewares.use('/api/posts', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Supabase not configured' }));
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        if (req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);

            // ── Action: Sync Status from Repliz Schedule API ─────────────
            if (body.action === 'sync-repliz' || body.action === 'get-repliz-details') {
              const scheduleId = body.scheduleId || body.schedule_id;
              const recordId = body.recordId || body.id;
              const postType = body.type || 'automation'; // 'automation' | 'manual'

              if (!scheduleId) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'scheduleId is required' }));
                return;
              }

              const replizAccessKey = process.env.REPLIZ_ACCESS_KEY || process.env.VITE_REPLIZ_ACCESS_KEY || '';
              const replizSecretKey = process.env.REPLIZ_SECRET_KEY || process.env.VITE_REPLIZ_SECRET_KEY || '';

              if (!replizAccessKey || !replizSecretKey) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Repliz credentials (REPLIZ_ACCESS_KEY/REPLIZ_SECRET_KEY) not configured' }));
                return;
              }

              const basicAuth = Buffer.from(`${replizAccessKey}:${replizSecretKey}`).toString('base64');
              const authHeader = `Basic ${basicAuth}`;

              // Get schedule data from Repliz (/public/schedule/{scheduleId})
              const schedRes = await fetch(`https://api.repliz.com/public/schedule/${scheduleId}`, {
                headers: { 'Authorization': authHeader },
              });

              if (!schedRes.ok) {
                const errText = await schedRes.text().catch(() => '');
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify({
                  success: false,
                  scheduleStatus: 'not_found',
                  scheduleId,
                  error: `Repliz schedule not found or error (${schedRes.status}): ${errText}`,
                  message: `Schedule ID (${scheduleId}) tidak ditemukan di Repliz atau belum terdaftar.`,
                }));
                return;
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
                    await supabase
                      .from('automation_posts')
                      .update({
                        status: dbStatus,
                        updated_at: new Date().toISOString(),
                      })
                      .eq('id', recordId);
                  } else {
                    await supabase
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
                    await supabase
                      .from('generated_posts')
                      .update({
                        instagram_status: igStatus,
                        updated_at: new Date().toISOString(),
                      })
                      .eq('id', recordId);
                  } else {
                    await supabase
                      .from('generated_posts')
                      .update({
                        instagram_status: igStatus,
                        updated_at: new Date().toISOString(),
                      })
                      .eq('schedule_id', scheduleId);
                  }
                }
              } catch (dbErr) {
                console.error('[postsPlugin] Failed to update DB status:', dbErr);
              }

              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200);
              res.end(JSON.stringify({
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
              }));
              return;
            }

            // Fallback for regular post creation
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
          } catch (err: any) {
            console.error('[postsPlugin] Error handling /api/posts:', err);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        }
      });
    },
  };
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateApiKey } from './_lib/auth.js';

const SECTORS_API_KEY = process.env.SECTORS_API_KEY || '';
const SECTORS_BASE = 'https://api.sectors.app/v2';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Autentikasi API Key (dari n8n)
  if (!validateApiKey(req)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { limit = '20', start, end } = req.query;

    // Jika start atau end tidak diberikan, default ke kemarin dan hari ini (GMT+7 / Asia/Jakarta)
    if (!start || !end) {
      const getJakartaDateString = (offsetDays = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        // en-CA format menghasilkan string YYYY-MM-DD
        return new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(date);
      };

      if (!start) start = getJakartaDateString(-1); // Kemarin
      if (!end) end = getJakartaDateString(0);      // Hari ini
    }

    if (!SECTORS_API_KEY) {
      throw new Error('SECTORS_API_KEY is not configured in Vercel env');
    }

    // Bangun URL ke Sectors API
    const url = new URL(`${SECTORS_BASE}/news/`);
    url.searchParams.set('limit', limit as string);
    if (start) url.searchParams.set('start', start as string);
    if (end) url.searchParams.set('end', end as string);

    // Fetch data dari Sectors
    const response = await fetch(url.toString(), {
      headers: { 'Authorization': SECTORS_API_KEY },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sectors API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Mapping 'source' menjadi 'link' agar n8n tidak perlu mengubah konfigurasi lagi
    const formattedResults = (data.results || []).map((item: any) => ({
      ...item,
      link: item.source,
    }));

    return res.status(200).json({
      success: true,
      data: formattedResults,
      pagination: data.pagination
    });
  } catch (error) {
    console.error('Fetch news error:', error);
    return res.status(500).json({
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

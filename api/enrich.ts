import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enrichByCategory } from '../_lib/sectors';
import { validateApiKey, isScrapeEndpoint, isHealthEndpoint } from '../_lib/auth';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, ticker } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'category is required' });
  }

  try {
    const result = await enrichByCategory(category, ticker);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Enrich error:', error);
    return res.status(500).json({
      error: 'Failed to enrich data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
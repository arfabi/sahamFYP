import type { VercelRequest, VercelResponse } from '@vercel/node';
import { classifyContent } from '../_lib/gemini';
import { validateApiKey, isScrapeEndpoint, isHealthEndpoint } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check (skip for scrape and health)
  if (!isScrapeEndpoint(req.url) && !isHealthEndpoint(req.url)) {
    if (!validateApiKey(req)) {
      return res.status(401).json({ error: 'Invalid or missing API key' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  try {
    const result = await classifyContent(title, content);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Classify error:', error);
    return res.status(500).json({
      error: 'Failed to classify content',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
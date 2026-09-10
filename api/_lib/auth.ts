// API Key authentication helper
import type { VercelRequest } from '@vercel/node';

const N8N_API_KEY = process.env.N8N_API_KEY || '';

export function validateApiKey(req: VercelRequest): boolean {
  if (!N8N_API_KEY) {
    return true; // Skip validation if not configured
  }
  const providedKey = req.headers['x-api-key'];
  return providedKey === N8N_API_KEY;
}

export function isScrapeEndpoint(url?: string): boolean {
  return url?.includes('/api/scrape') || false;
}

export function isHealthEndpoint(url?: string): boolean {
  return url?.includes('/api/health') || false;
}

/**
 * Parse request body - handles both pre-parsed objects and raw JSON strings.
 * Vercel serverless functions may not auto-parse JSON bodies in all cases.
 */
export function parseBody<T = Record<string, any>>(req: VercelRequest): T {
  const body = req.body;
  
  if (!body) {
    return {} as T;
  }
  
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as T;
    } catch {
      return {} as T;
    }
  }
  
  // Handle Buffer/Uint8Array (Vercel sometimes sends raw body)
  if (body instanceof Uint8Array || Buffer.isBuffer(body)) {
    try {
      const str = Buffer.from(body).toString('utf-8');
      return JSON.parse(str) as T;
    } catch {
      return {} as T;
    }
  }
  
  return body as T;
}

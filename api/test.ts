import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: 'Test endpoint works',
    method: req.method,
    body: req.body,
    bodyType: typeof req.body,
    headers: req.headers,
  });
}

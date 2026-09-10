import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import { parseBody } from './_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = parseBody(req);

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    console.log(`[Scraper] Fetching: ${url}`);
    const startTime = Date.now();

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text().trim() || 
                  $('h1').first().text().trim() || 
                  'Untitled';

    // Extract article content (try common selectors)
    const contentSelectors = [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '[itemprop="articleBody"]',
      '.detail__text',
      '.read__content',
      '.fck_detail',
      'main',
    ];

    let content = '';
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        // Remove script and style tags
        element.find('script, style, nav, header, footer, aside').remove();
        content = element.text().trim();
        if (content.length > 100) break; // Minimum 100 chars
      }
    }

    // Fallback: get all paragraphs
    if (!content || content.length < 100) {
      const paragraphs: string[] = [];
      $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) { // Only paragraphs with meaningful content
          paragraphs.push(text);
        }
      });
      content = paragraphs.join('\n\n');
    }

    // Clean and limit content
    content = content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n\n') // Clean empty lines
      .substring(0, 5000); // Limit to 5000 chars

    // Extract metadata
    const author = $('[itemprop="author"]').text().trim() ||
                   $('.author').text().trim() ||
                   $('[rel="author"]').text().trim() ||
                   '';

    const publishedDate = $('[itemprop="datePublished"]').attr('content') ||
                          $('time').attr('datetime') ||
                          $('[class*="date"]').text().trim() ||
                          '';

    const image = $('meta[property="og:image"]').attr('content') ||
                  $('[itemprop="image"]').attr('content') ||
                  $('article img').first().attr('src') ||
                  '';

    const siteName = $('meta[property="og:site_name"]').attr('content') ||
                     $('meta[name="application-name"]').attr('content') ||
                     '';

    const description = $('meta[property="og:description"]').attr('content') ||
                        $('meta[name="description"]').attr('content') ||
                        '';

    const duration = Date.now() - startTime;
    console.log(`[Scraper] Success in ${duration}ms, content: ${content.length} chars`);

    return res.status(200).json({
      url,
      title,
      content,
      description,
      author,
      publishedDate,
      image,
      siteName,
    });
  } catch (error) {
    console.error('[Scraper] Error:', error);
    return res.status(500).json({
      error: 'Failed to scrape URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

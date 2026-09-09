// Vite Plugin: Handle /api/scrape locally (replaces Vercel Serverless Function)
import type { Plugin, Connect } from 'vite';
import * as cheerio from 'cheerio';

interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  image?: string;
  siteName?: string;
}

async function scrapeHandler(req: any, res: any): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Read body
  const chunks: any[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString();

  let parsed: { url?: string };
  try {
    parsed = JSON.parse(body);
  } catch {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    return;
  }

  const { url } = parsed;

  if (!url || typeof url !== 'string') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'URL is required' }));
    return;
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Invalid URL format' }));
    return;
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

    // Extract article content
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
        element.find('script, style, nav, header, footer, aside').remove();
        content = element.text().trim();
        if (content.length > 100) break;
      }
    }

    // Fallback: get all paragraphs
    if (!content || content.length < 100) {
      const paragraphs: string[] = [];
      $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) {
          paragraphs.push(text);
        }
      });
      content = paragraphs.join('\n\n');
    }

    // Clean content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .substring(0, 5000);

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

    const result: ScrapedContent = {
      url,
      title,
      content,
      description,
      author,
      publishedDate,
      image,
      siteName,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(JSON.stringify(result));
  } catch (error) {
    console.error('[Scraper] Error:', error);
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(500);
    res.end(JSON.stringify({
      error: 'Failed to scrape URL',
      message: error instanceof Error ? error.message : 'Unknown error',
    }));
  }
}

export function scraperPlugin(): Plugin {
  return {
    name: 'scraper-plugin',
    configureServer(server) {
      server.middlewares.use('/api/scrape', (req, res) => {
        scrapeHandler(req, res).catch((err) => {
          console.error('[Scraper] Unhandled error:', err);
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });
    },
  };
}

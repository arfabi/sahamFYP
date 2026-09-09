// Server-side scraper (replicates client scraper for Node.js)
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  description: string;
  author: string;
  publishedDate: string;
  image: string;
  siteName: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
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

  const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

  const contentSelectors = [
    'article', '.article-content', '.post-content', '.entry-content',
    '[itemprop="articleBody"]', '.detail__text', '.read__content', '.fck_detail', 'main',
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

  if (!content || content.length < 100) {
    const paragraphs: string[] = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20) paragraphs.push(text);
    });
    content = paragraphs.join('\n\n');
  }

  content = content.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n\n').substring(0, 5000);

  const author = $('[itemprop="author"]').text().trim() || $('.author').text().trim() || $('[rel="author"]').text().trim() || '';
  const publishedDate = $('[itemprop="datePublished"]').attr('content') || $('time').attr('datetime') || $('[class*="date"]').text().trim() || '';
  const image = $('meta[property="og:image"]').attr('content') || $('[itemprop="image"]').attr('content') || $('article img').first().attr('src') || '';
  const siteName = $('meta[property="og:site_name"]').attr('content') || $('meta[name="application-name"]').attr('content') || '';
  const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';

  return { url, title, content, description, author, publishedDate, image, siteName };
}
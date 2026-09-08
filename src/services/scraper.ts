// Web scraping service
// NOTE: Untuk production, ini harus di-migrate ke Vercel Serverless Function
// karena browser tidak bisa fetch URL eksternal langsung (CORS issue)

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  author?: string;
  publishedDate?: string;
  image?: string;
  siteName?: string;
}

// Simple scraping menggunakan allorigins.win sebagai proxy (untuk development)
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    // Gunakan proxy untuk bypass CORS (development only)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const data = await response.json();
    const html = data.contents;

    // Parse HTML untuk extract content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract title
    const title = doc.querySelector('title')?.textContent || 
                  doc.querySelector('h1')?.textContent || 
                  'Untitled';

    // Extract article content (try common selectors)
    const contentSelectors = [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '[itemprop="articleBody"]',
      'main',
    ];

    let content = '';
    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        content = element.textContent || '';
        break;
      }
    }

    // Fallback: get all paragraphs
    if (!content) {
      const paragraphs = Array.from(doc.querySelectorAll('p'));
      content = paragraphs.map(p => p.textContent).join('\n\n');
    }

    // Clean content
    content = content.trim().substring(0, 5000); // Limit to 5000 chars

    // Extract meta data
    const author = doc.querySelector('[itemprop="author"]')?.textContent ||
                   doc.querySelector('.author')?.textContent ||
                   '';

    const publishedDate = doc.querySelector('[itemprop="datePublished"]')?.getAttribute('content') ||
                          doc.querySelector('time')?.getAttribute('datetime') ||
                          '';

    const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                  doc.querySelector('[itemprop="image"]')?.getAttribute('content') ||
                  '';

    const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
                     doc.querySelector('meta[name="application-name"]')?.getAttribute('content') ||
                     '';

    return {
      url,
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      publishedDate: publishedDate.trim(),
      image: image.trim(),
      siteName: siteName.trim(),
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Test if URL is accessible
export async function testUrl(url: string): Promise<boolean> {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    return response.ok;
  } catch {
    return false;
  }
}

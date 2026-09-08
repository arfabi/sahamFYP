// Web scraping service
// Menggunakan Vercel Serverless Function untuk bypass CORS

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  image?: string;
  siteName?: string;
}

// Call Vercel Serverless Function
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    // Detect environment
    const isServer = typeof window === 'undefined';
    
    let endpoint: string;
    if (isServer) {
      // Di server (Node.js testing), langsung hit API route
      endpoint = 'http://localhost:3000/api/scrape';
    } else {
      // Di browser, hit relative URL (akan di-handle oleh Vercel)
      endpoint = '/api/scrape';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data: ScrapedContent = await response.json();
    return data;
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(
      `Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Test if scraper service is available
export async function testScraperService(): Promise<boolean> {
  try {
    const isServer = typeof window === 'undefined';
    const endpoint = isServer 
      ? 'http://localhost:3000/api/scrape'
      : '/api/scrape';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    });
    return response.ok;
  } catch {
    return false;
  }
}


/**
 * Client-side API wrapper
 * Browser TIDAK BOLEH call Sectors.app/Gemini langsung (CORS block)
 * Semua request di-proxy melalui Vercel serverless functions (/api/*)
 */

const API_BASE = '/api';

async function apiCall<T>(endpoint: string, body: any, requiresAuth = true): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // Add API key for authenticated endpoints
  if (requiresAuth) {
    const apiKey = import.meta.env.VITE_N8N_API_KEY;
    if (apiKey) headers['X-API-Key'] = apiKey;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Scrape ──────────────────────────────────────────────────────────────────

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

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  return apiCall<ScrapedContent>('/scrape', { url }, false);
}

// ─── Classify ────────────────────────────────────────────────────────────────

export interface ClassificationResult {
  category: 'SINGLE_STOCK' | 'MACRO_ECONOMY' | 'SECTOR_ANALYSIS' | 'CORPORATE_ACTION' | 'IPO_RIGHTS_ISSUE' | 'SUSPENSION_DELISTING' | 'SKIP';
  ticker: string | null;
  sector: string | null;
  confidence: number;
  reason: string;
}

export async function classifyContent(title: string, content: string): Promise<ClassificationResult> {
  return apiCall<ClassificationResult>('/classify', { title, content });
}

// ─── Enrich ──────────────────────────────────────────────────────────────────

export interface EnrichmentResult {
  category: string;
  ticker: string | null;
  data: Record<string, any>;
  error?: string;
}

export async function enrichData(category: string, ticker: string | null): Promise<EnrichmentResult> {
  return apiCall<EnrichmentResult>('/enrich', { category, ticker });
}

// ─── Generate ────────────────────────────────────────────────────────────────

export interface GenerateResult {
  skipped?: boolean;
  reason?: string;
  classification: ClassificationResult;
  enrichment: EnrichmentResult;
  naskah: any;
  image: string;
  siteName: string;
}

export async function generateContent(url: string): Promise<GenerateResult> {
  return apiCall<GenerateResult>('/generate', { url });
}

// ─── Publish ─────────────────────────────────────────────────────────────────

export interface PublishResult {
  success: boolean;
  scheduleId?: string;
  platform?: string;
  status?: string;
  error?: string;
}

export async function publishContent(
  postId: string,
  cloudinaryUrls: string[],
  caption: string,
  platform: 'instagram' | 'tiktok' = 'instagram',
  scheduleAt?: string
): Promise<PublishResult> {
  return apiCall<PublishResult>('/publish', { postId, cloudinaryUrls, caption, platform, scheduleAt });
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export interface GeneratedPost {
  id: string;
  log_id: string;
  handle: string;
  badge_text: string;
  slides_json: any;
  total_slides: number;
  schedule_id?: string;
  instagram_status?: string;
  tiktok_schedule_id?: string;
  tiktok_status?: string;
  permalink?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  created_at: string;
  updated_at: string;
}

export async function getPosts(status?: string, limit = 50): Promise<{ posts: GeneratedPost[]; count: number }> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('limit', limit.toString());

  const response = await fetch(`${API_BASE}/posts?${params}`, {
    headers: { 'X-API-Key': import.meta.env.VITE_N8N_API_KEY || '' },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function savePost(data: Partial<GeneratedPost> & { naskah?: any; classification?: any; enrichment?: any }): Promise<{ post: GeneratedPost }> {
  return apiCall('/posts', data);
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
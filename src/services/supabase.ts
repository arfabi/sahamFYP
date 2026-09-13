import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type ContentCategory = 
  | 'SINGLE_STOCK'
  | 'MACRO_ECONOMY'
  | 'SECTOR_ANALYSIS'
  | 'CORPORATE_ACTION'
  | 'IPO_RIGHTS_ISSUE'
  | 'SUSPENSION_DELISTING'
  | 'SKIP';

export type ContentStatus = 
  | 'pending'
  | 'scraped'
  | 'classified'
  | 'enriched'
  | 'generated'
  | 'completed'
  | 'failed';

export interface ContentLog {
  id: string;
  url: string;
  title?: string;
  content?: string;
  scraped_at?: string;
  category?: ContentCategory;
  ticker?: string;
  sector?: string;
  confidence?: number;
  reason?: string;
  sectors_data?: any;
  status: ContentStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedPost {
  id: string;
  log_id: string;
  handle: string;
  badge_text: string;
  badge_bg_color?: string;
  badge_text_color?: string;
  slides_json: any;
  total_slides: number;
  schedule_id?: string;
  instagram_status?: 'generated' | 'scheduled' | 'published' | 'failed' | 'cancelled';
  tiktok_schedule_id?: string;
  tiktok_status?: 'generated' | 'scheduled' | 'published' | 'failed' | 'cancelled';
  permalink?: string;
  permalink_ig?: string;
  permalink_tiktok?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  created_at: string;
  updated_at: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  slide_number: number;
  template_type: string;
  cloudinary_url: string;
  cloudinary_public_id?: string;
  width: number;
  height: number;
  file_size?: number;
  created_at: string;
}

// Content Logs API
export const contentLogsApi = {
  async create(data: Partial<ContentLog>) {
    const { data: result, error } = await supabase
      .from('content_logs')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async getAll(limit = 50) {
    const { data, error } = await supabase
      .from('content_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('content_logs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<ContentLog>) {
    const { data: result, error } = await supabase
      .from('content_logs')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async updateStatus(id: string, status: ContentStatus, errorMessage?: string) {
    return this.update(id, { status, error_message: errorMessage });
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('content_logs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Generated Posts API
// Uses Vercel API proxy to bypass RLS (Row-Level Security)
export const generatedPostsApi = {
  async create(data: Partial<GeneratedPost>) {
    // Use Vercel API proxy to bypass RLS
    const proxyUrl = typeof window !== 'undefined' 
      ? '/api/posts' 
      : `${import.meta.env.VITE_SITE_URL || 'https://saham-fyp.vercel.app'}/api/posts`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create post' }));
      throw new Error(error.error || 'Failed to create post');
    }
    
    return await response.json();
  },

  async getAll(limit = 50) {
    const { data, error } = await supabase
      .from('generated_posts')
      .select('*, content_logs(url, title, category, ticker)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('generated_posts')
      .select('*, content_logs(url, title, category, ticker)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByLogId(logId: string) {
    const { data, error } = await supabase
      .from('generated_posts')
      .select('*')
      .eq('log_id', logId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<GeneratedPost>) {
    const { data: result, error } = await supabase
      .from('generated_posts')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('generated_posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Post Images API
export const postImagesApi = {
  async create(data: Partial<PostImage>) {
    const { data: result, error } = await supabase
      .from('post_images')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async createBatch(images: Partial<PostImage>[]) {
    const { data: result, error } = await supabase
      .from('post_images')
      .insert(images)
      .select();
    if (error) throw error;
    return result;
  },

  async getByPostId(postId: string) {
    const { data, error } = await supabase
      .from('post_images')
      .select('*')
      .eq('post_id', postId)
      .order('slide_number', { ascending: true });
    if (error) throw error;
    return data;
  },

  async deleteByPostId(postId: string) {
    const { error } = await supabase
      .from('post_images')
      .delete()
      .eq('post_id', postId);
    if (error) throw error;
  },
};

// ============================================================
// News Scrape — Untuk tracking berita yang sudah di-scrape
// ============================================================

export interface NewsScrapeRecord {
  id?: number;
  url: string;
  time_scrape?: string;
  title?: string | null;
  category?: string | null;
  ticker?: string | null;
  content?: string | null;
  description?: string | null;
  image?: string | null;
  sitename?: string | null;
  score?: number | null;
  decision?: string | null;
  reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const newsScrapeApi = {
  async create(data: Partial<NewsScrapeRecord>) {
    const { data: result, error } = await supabase
      .from('news_scrape')
      .insert([{
        ...data,
        time_scrape: data.time_scrape || new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async getByUrl(url: string) {
    const { data, error } = await supabase
      .from('news_scrape')
      .select('*')
      .eq('url', url)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async exists(url: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('news_scrape')
      .select('id')
      .eq('url', url)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  async check(url: string): Promise<{ exists: boolean; data: NewsScrapeRecord | null }> {
    const record = await this.getByUrl(url);
    return { exists: !!record, data: record };
  },

  async updateByUrl(url: string, data: Partial<NewsScrapeRecord>) {
    const { data: result, error } = await supabase
      .from('news_scrape')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('url', url)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async getAll(limit = 50) {
    const { data, error } = await supabase
      .from('news_scrape')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('news_scrape')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};


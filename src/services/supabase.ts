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
export const generatedPostsApi = {
  async create(data: Partial<GeneratedPost>) {
    const { data: result, error } = await supabase
      .from('generated_posts')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
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


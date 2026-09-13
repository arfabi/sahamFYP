// Server-side Supabase client (service role key)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role for server-side (bypasses RLS)
// Fallback to anon key if service role not available
const supabaseKey = supabaseServiceKey || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.warn('[supabase] SUPABASE_URL / VITE_SUPABASE_URL not configured');
}
if (!supabaseKey) {
  console.warn('[supabase] No key configured');
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey);

export type { GeneratedPost, PostImage, ContentLog } from '../../src/services/supabase';
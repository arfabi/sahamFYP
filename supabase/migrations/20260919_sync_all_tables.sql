-- ============================================================
-- Migration: Inisialisasi & Sinkronisasi Tabel Hilang (content_logs, generated_posts, post_images)
-- serta melengkapi kolom sector_trigger_movers (last_price, point_change).
-- Tanggal: 2026-09-19 / 2026-09-21
-- Idempotent: Aman dijalankan berulang kali (CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- ============================================================

-- 1. Tabel content_logs (Log analisis berita & klasifikasi naskah)
CREATE TABLE IF NOT EXISTS public.content_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  content TEXT,
  scraped_at TIMESTAMPTZ,
  category VARCHAR(50),
  ticker VARCHAR(50),
  sector VARCHAR(100),
  confidence NUMERIC,
  reason TEXT,
  sectors_data JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel generated_posts (Riwayat postingan wizard & manual editor)
CREATE TABLE IF NOT EXISTS public.generated_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID REFERENCES public.content_logs(id) ON DELETE SET NULL,
  handle VARCHAR(100) DEFAULT '@sahamfyp',
  badge_text VARCHAR(100) NOT NULL DEFAULT 'SAHAMFYP',
  badge_bg_color VARCHAR(50),
  badge_text_color VARCHAR(50),
  slides_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_slides INTEGER DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  instagram_status VARCHAR(50) DEFAULT 'generated',
  tiktok_status VARCHAR(50) DEFAULT 'generated',
  schedule_id VARCHAR(100),
  tiktok_schedule_id VARCHAR(100),
  permalink TEXT,
  permalink_ig TEXT,
  permalink_tiktok TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0
);

-- 3. Tabel post_images (Penyimpanan aset URL gambar slide per post)
CREATE TABLE IF NOT EXISTS public.post_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.generated_posts(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  template_type VARCHAR(50),
  cloudinary_url TEXT,
  cloudinary_public_id TEXT,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Sinkronisasi kolom sector_trigger_movers (menambahkan last_price & point_change dari dump rows)
ALTER TABLE public.sector_trigger_movers
  ADD COLUMN IF NOT EXISTS last_price NUMERIC,
  ADD COLUMN IF NOT EXISTS point_change NUMERIC;

-- 5. Row Level Security (RLS) & Policies
ALTER TABLE public.content_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- content_logs policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_logs' AND policyname = 'Allow anon all on content_logs') THEN
    CREATE POLICY "Allow anon all on content_logs" ON public.content_logs FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;

  -- generated_posts policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_posts' AND policyname = 'Allow anon all on generated_posts') THEN
    CREATE POLICY "Allow anon all on generated_posts" ON public.generated_posts FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;

  -- post_images policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_images' AND policyname = 'Allow anon all on post_images') THEN
    CREATE POLICY "Allow anon all on post_images" ON public.post_images FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

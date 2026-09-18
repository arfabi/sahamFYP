-- Tabel untuk menyimpan riwayat postingan dari n8n automations (News Monitoring & Daily Market Brief)
CREATE TABLE IF NOT EXISTS public.automation_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_type VARCHAR(50) NOT NULL, -- 'news_monitoring' atau 'daily_market_brief'
  account_id VARCHAR(100),
  caption TEXT,
  thumbnail_url TEXT,
  post_link TEXT,
  post_id VARCHAR(100), -- ID dari repliz / sosmed (jika tidak dapat link langsung)
  status VARCHAR(50) DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.automation_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read access on automation_posts"
  ON public.automation_posts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert access on automation_posts"
  ON public.automation_posts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update access on automation_posts"
  ON public.automation_posts FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow anon delete access on automation_posts"
  ON public.automation_posts FOR DELETE
  TO anon
  USING (true);

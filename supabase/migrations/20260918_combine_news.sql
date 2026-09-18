-- Migration to add columns from `news_scrape` to `sector_trigger_news`

-- Add new columns for n8n AI decision support
ALTER TABLE public.sector_trigger_news
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS sitename text,
  ADD COLUMN IF NOT EXISTS score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS decision text DEFAULT 'PASS'::text,
  ADD COLUMN IF NOT EXISTS reason text;

-- Add index on decision to speed up duplicate generation checks
CREATE INDEX IF NOT EXISTS idx_sector_trigger_news_decision ON public.sector_trigger_news USING btree (decision) TABLESPACE pg_default;

-- Migration: 20260916_fix_sector_trigger_news.sql
-- Tabel di production terlanjur schema #2 (tanpa log_id).
-- Fix: tambahkan kolom relasi + kolom full-data (body, thumbnail, dll).
-- Aman: semua pakai IF NOT EXISTS, tidak hapus data.

alter table sector_trigger_news
  add column if not exists log_id uuid references sector_trigger_logs(id) on delete cascade,
  add column if not exists news_index integer,
  add column if not exists published_at timestamptz,
  add column if not exists is_selected boolean default false,
  add column if not exists body text,
  add column if not exists thumbnail_url text,
  add column if not exists sub_sectors text[],
  add column if not exists dimensions jsonb,
  add column if not exists raw jsonb;

-- Backfill: timestamp (schema #2) -> published_at (schema #1) agar frontend lama tetap jalan
update sector_trigger_news set published_at = timestamp where published_at is null and timestamp is not null;

create index if not exists idx_sector_trigger_news_log on sector_trigger_news (log_id);
create index if not exists idx_sector_trigger_news_published_desc on sector_trigger_news (published_at desc);
create index if not exists idx_sector_trigger_news_log_source on sector_trigger_news (log_id, source_url);
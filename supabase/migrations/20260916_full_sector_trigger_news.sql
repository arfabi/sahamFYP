-- ============================================================================
-- FULL schema sector_trigger_news (gabungan schema #1 relasi-log + #2 full-data)
-- + ALTER idempotent untuk production yang terlanjur schema #2.
-- Jalankan seluruh file ini di Supabase SQL Editor. Aman di-run ulang.
-- ============================================================================

-- 1) Fresh create (di-skip otomatis kalau tabel sudah ada)
create table if not exists sector_trigger_news (
  id uuid primary key default gen_random_uuid(),
  log_id uuid references sector_trigger_logs(id) on delete cascade,
  news_index integer,
  title text,
  body text,
  tags text[],
  symbols text[],
  sector text,
  sub_sectors text[],
  dimensions jsonb,
  source_url text,
  thumbnail_url text,
  timestamp timestamptz,
  published_at timestamptz,
  raw jsonb,
  is_selected boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Fix tabel production yang terlanjur schema #2 (tambah kolom yang kurang)
alter table sector_trigger_news
  add column if not exists log_id uuid references sector_trigger_logs(id) on delete cascade,
  add column if not exists news_index integer,
  add column if not exists body text,
  add column if not exists thumbnail_url text,
  add column if not exists sub_sectors text[],
  add column if not exists dimensions jsonb,
  add column if not exists raw jsonb,
  add column if not exists timestamp timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists is_selected boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- 2b) Kolom timestamp tanpa timezone (kalau tabel production terlanjur pakai
-- `timestamp` polos, bukan timestamptz) — samakan ke timestamptz agar insert
-- ISO-8601 dari API tidak gagal / tidak null.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'sector_trigger_news'
      and column_name = 'timestamp'
      and data_type = 'timestamp without time zone'
  ) then
    alter table sector_trigger_news
      alter column "timestamp" type timestamptz using "timestamp" at time zone 'UTC';
  end if;
end $$;

-- 3) Sinkronisasi dua kolom tanggal agar frontend lama & baru dua-duanya jalan
update sector_trigger_news set published_at = timestamp where published_at is null and timestamp is not null;
update sector_trigger_news set timestamp = published_at where timestamp is null and published_at is not null;

-- 4) Index
create index if not exists idx_sector_trigger_news_log on sector_trigger_news (log_id);
create index if not exists idx_sector_trigger_news_published_desc on sector_trigger_news (published_at desc);
create index if not exists idx_sector_trigger_news_timestamp_desc on sector_trigger_news (timestamp desc);
create index if not exists idx_sector_trigger_news_tags on sector_trigger_news using gin (tags);
create index if not exists idx_sector_trigger_news_symbols on sector_trigger_news using gin (symbols);
create index if not exists idx_sector_trigger_news_sector on sector_trigger_news (sector);
create index if not exists idx_sector_trigger_news_source_url on sector_trigger_news (source_url);
create index if not exists idx_sector_trigger_news_log_source on sector_trigger_news (log_id, source_url);

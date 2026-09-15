-- Migration: 20260915_2_sector_trigger_news.sql
-- Create sector_trigger_news table for storing fetched news articles from sector-trigger API

create table if not exists sector_trigger_news (
    id uuid primary key default gen_random_uuid(),
    source_url text unique,
    title text,
    body text,
    thumbnail_url text,
    timestamp timestamptz,
    sector text,
    sub_sectors text[],
    symbols text[],
    tags text[],
    dimensions jsonb,
    raw jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_sector_trigger_news_source_url on sector_trigger_news (source_url);
create index if not exists idx_sector_trigger_news_timestamp_desc on sector_trigger_news (timestamp desc);
create index if not exists idx_sector_trigger_news_tags on sector_trigger_news using GIN (tags);
create index if not exists idx_sector_trigger_news_symbols on sector_trigger_news using GIN (symbols);
create index if not exists idx_sector_trigger_news_sector on sector_trigger_news (sector);
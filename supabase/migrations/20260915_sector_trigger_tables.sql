-- ============================================================
-- Sector Trigger tables — Daily Market Brief (open/close session)
-- Created: 2026-09-15
-- NOTE: add CHECK constraints match the exact signal strings produced
--       in api/sector-trigger/open.ts (digestCompanyReport).
-- ============================================================

-- 1. Main log per trigger run (one row per session open/close)
CREATE TABLE IF NOT EXISTS sector_trigger_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session TEXT NOT NULL CHECK (session IN ('open', 'close')),
  trigger_date DATE NOT NULL,
  data_date DATE NOT NULL,
  ihsg_price NUMERIC,
  ihsg_change NUMERIC,
  credits_used INTEGER DEFAULT 0,
  tickers_selected INTEGER DEFAULT 0,
  news_fetched INTEGER DEFAULT 0,
  reasoning TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'no_candidates', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. News articles fetched on each run
CREATE TABLE IF NOT EXISTS sector_trigger_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID REFERENCES sector_trigger_logs(id) ON DELETE CASCADE,
  news_index INTEGER,
  title TEXT,
  tags TEXT[],
  symbols TEXT[],
  sector TEXT,
  source_url TEXT,
  published_at TIMESTAMPTZ,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Selected candidates + enriched fundamentals vs sector
CREATE TABLE IF NOT EXISTS sector_trigger_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID REFERENCES sector_trigger_logs(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company_name TEXT,
  sector TEXT,
  news_title TEXT,
  news_tags TEXT[],
  news_body TEXT,

  -- Fundamentals
  price NUMERIC,
  market_cap NUMERIC,
  pe_ratio NUMERIC,
  pb_ratio NUMERIC,
  roe NUMERIC,
  der NUMERIC,
  revenue NUMERIC,
  net_income NUMERIC,

  -- Sector averages (from Sectors peer_avg or peers computation)
  avg_sector_pe NUMERIC,
  avg_sector_pbv NUMERIC,
  avg_sector_roe NUMERIC,
  avg_sector_der NUMERIC,

  -- Signals (must match digestCompanyReport output)
  pe_signal TEXT CHECK (pe_signal IN ('lebih murah', 'lebih mahal/berisiko', 'netral') OR pe_signal IS NULL),
  pbv_signal TEXT CHECK (pbv_signal IN ('lebih murah', 'lebih mahal/berisiko', 'netral') OR pbv_signal IS NULL),
  roe_signal TEXT CHECK (roe_signal IN ('di atas sektor', 'di bawah sektor') OR roe_signal IS NULL),
  der_signal TEXT CHECK (der_signal IN ('berisiko tinggi', 'wajar') OR der_signal IS NULL),

  -- Raw enrichment payload (full company report JSON)
  enrichment_json JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tickers skipped by Gemini selection + reason
CREATE TABLE IF NOT EXISTS sector_trigger_skipped (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID REFERENCES sector_trigger_logs(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Top gainers / losers of the run
CREATE TABLE IF NOT EXISTS sector_trigger_movers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID REFERENCES sector_trigger_logs(id) ON DELETE CASCADE,
  classification TEXT CHECK (classification IN ('top_gainers', 'top_losers')),
  symbol TEXT NOT NULL,
  company_name TEXT,
  price_change NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_trigger_logs_date ON sector_trigger_logs(trigger_date DESC);
CREATE INDEX IF NOT EXISTS idx_trigger_news_log ON sector_trigger_news(log_id);
CREATE INDEX IF NOT EXISTS idx_trigger_candidates_log ON sector_trigger_candidates(log_id);
CREATE INDEX IF NOT EXISTS idx_trigger_skipped_log ON sector_trigger_skipped(log_id);
CREATE INDEX IF NOT EXISTS idx_trigger_movers_log ON sector_trigger_movers(log_id);
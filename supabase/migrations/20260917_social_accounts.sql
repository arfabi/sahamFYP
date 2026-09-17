-- ============================================================
-- Social Accounts table for multi-platform broadcasting
-- Created: 2026-09-17
-- ============================================================

CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- e.g., 'instagram', 'twitter', 'facebook', 'telegram'
  provider TEXT NOT NULL, -- e.g., 'repliz', 'telegram'
  account_id TEXT NOT NULL, -- Repliz account ID or Telegram Chat ID
  account_name TEXT NOT NULL, -- For display purposes (e.g., '@sahamfyp')
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for the backend API and frontend to manage accounts
CREATE POLICY "Allow anonymous read access on social_accounts"
  ON social_accounts FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on social_accounts"
  ON social_accounts FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update on social_accounts"
  ON social_accounts FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete on social_accounts"
  ON social_accounts FOR DELETE USING (true);

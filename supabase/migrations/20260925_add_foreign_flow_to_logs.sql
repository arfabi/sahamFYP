-- Migration: Add foreign_flow_json to sector_trigger_logs
-- Allows storing Foreign Flow summary directly in the database per session
-- Run this in Supabase SQL Editor:

ALTER TABLE public.sector_trigger_logs 
ADD COLUMN IF NOT EXISTS foreign_flow_json JSONB;

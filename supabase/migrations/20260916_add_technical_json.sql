-- Technical per watchlist candidate (dihitung kode dari GET /v2/daily/{symbol}/).
-- Angka mentah number (bukan string "+5.0%") supaya bisa di-sort/filter.
-- LLM hanya baca ini untuk bikin vibeCheck/trigger, dilarang bikin angka sendiri.
alter table sector_trigger_candidates
  add column if not exists technical_json jsonb;

create index if not exists idx_trigger_candidates_tech_chg20
  on sector_trigger_candidates (((technical_json->>'chg20d')::float));

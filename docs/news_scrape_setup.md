# news_scrape — Setup & Implementation

## SQL: Buat Tabel di Supabase

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Buat tabel news_scrape
CREATE TABLE IF NOT EXISTS news_scrape (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  time_scrape TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  category TEXT,
  ticker TEXT,
  content TEXT,
  description TEXT,
  image TEXT,
  siteName TEXT,
  score INTEGER DEFAULT 0,
  decision TEXT DEFAULT 'PASS',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk lookup URL cepat
CREATE INDEX IF NOT EXISTS idx_news_scrape_url ON news_scrape(url);
CREATE INDEX IF NOT EXISTS idx_news_scrape_time ON news_scrape(time_scrape DESC);
CREATE INDEX IF NOT EXISTS idx_news_scrape_decision ON news_scrape(decision);

-- Enable RLS
ALTER TABLE news_scrape ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations untuk anon (karena diakses dari serverless)
-- NOTE: Sesuaikan dengan kebutuhan security Anda
CREATE POLICY "Allow all access on news_scrape" 
  ON news_scrape 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
```

## API Endpoints (Vercel Serverless)

### `GET /api/news-scrape`
List semua record. Optional: `?limit=50`

### `POST /api/news-scrape`
Buat record baru. Body: `{ url, title, content, description, image, siteName, ... }`
- Jika URL sudah ada (unique violation), return existing record dengan flag `exists: true`

### `GET /api/news-scrape/check?url={url}`
Cek apakah URL sudah di-scrape. Response: `{ exists: boolean, data: {...} }`

### `PATCH /api/news-scrape/update`
Update record berdasarkan URL. Body: `{ url, category?, ticker?, score?, decision?, reason?, ... }`

## Frontend API (`src/services/supabase.ts`)

```typescript
import { newsScrapeApi, NewsScrapeRecord } from './services/supabase';

// Cek apakah URL sudah ada
const exists = await newsScrapeApi.exists('https://...');

// Simpan data scrape
await newsScrapeApi.create({
  url: 'https://...',
  title: 'Judul Berita',
  content: 'Isi berita...',
  description: 'Deskripsi...',
  image: 'https://...',
  siteName: 'CNBC Indonesia',
});

// Update klasifikasi
await newsScrapeApi.updateByUrl('https://...', {
  category: 'SINGLE_STOCK',
  ticker: 'BBCA',
});

// Update scoring
await newsScrapeApi.updateByUrl('https://...', {
  score: 9,
  decision: 'GENERATE',
  reason: 'Catalyst: dividen besar. Data: Rp5 T. Ticker jelas.',
});

// Get by URL
const record = await newsScrapeApi.getByUrl('https://...');

// List all
const allRecords = await newsScrapeApi.getAll(50);
```

## n8n Workflow

Import file `n8n-workflows/sahamfyp-rss-trigger-news-scrape.json` ke n8n.

Flow:
```
RSS Feed Trigger (1 berita)
  → 1. Check Exists? (GET /api/news-scrape/check?url=...)
    → 2. IF Exists?
        ├─ true → SKIP
        └─ false → 3. Scrape (POST /api/scrape)
                     → 4. Save Scraped (POST /api/news-scrape)
                       → 5. Classify (POST /api/classify)
                         → 6. Update Category (POST /api/news-scrape/update)
                           → 7. Score (POST /api/score)
                             → 8. Update Score (POST /api/news-scrape/update)
                               → 9. Decision? (IF decision = GENERATE)
                                 → 10. Generate (POST /api/generate)
                                   → 11. Save Draft (POST /api/posts)
```

## Struktur Data per Node

| Node | Field yang di-save |
|------|-------------------|
| Save Scraped | `url`, `time_scrape`, `title`, `content`, `description`, `image`, `siteName` |
| Update Category | `category`, `ticker` |
| Update Score | `score`, `decision`, `reason` |

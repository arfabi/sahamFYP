# 📡 N8N Integration Plan — SahamFYP

> **Tujuan**: Deploy aplikasi ke Vercel (URL public) → Buat API endpoints → Integrasi dengan n8n
> untuk automasi end-to-end: **RSS → Scrape → Classify → Enrich → Generate → Publish Instagram + TikTok**.

---

## 🗺️ Arsitektur Target

```
┌─────────────────────────────────────────────────────────────────────┐
│                        N8N (Automation Hub)                         │
│                                                                     │
│  RRS Feed ──► Webhook ──► [SahamFYP Generate API]                  │
│                                          │                        │
│                                          ▼                        │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │           VERCEL (URL: https://sahamfyp.vercel.app)      │     │
│  │                                                          │     │
│  │  Static React App    +    Serverless API (api/*.ts)      │     │
│  │  (Dashboard UI)       (generate, publish, posts, ...)    │     │
│  └──────────────────────────────────────────────────────────┘     │
│                     │              │                             │
│                     ▼              ▼                             │
│              [Instagram]      [TikTok]                           │
│             (album carousel)  (album carousel)                   │
│                                                                  │
│    ┌───────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌────────┐│
│    │Gemini │  │Sectors   │  │Cloudinary│ │Supabase  │  │Repliz  ││
│    │(AI)   │  │.app (API)│  │(images) │ │(DB/store)│  │(IG Pub)││
│    └───────┘  └──────────┘  └─────────┘  └──────────┘  └────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 PART A — Deploy ke Vercel (URL Public)

### A.1 Pre-requisite

- [ ] Vercel account + CLI: `npm i -g vercel`
- [ ] Git repository sudah push (arfabi/sahamFYP)
- [ ] Environment variables siap di `.env.local`

### A.2 Create `vercel.json` (root)

```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_GEMINI_API_KEY": "@gemini_api_key",
    "VITE_SECTORS_API_KEY": "@sectors_api_key",
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "VITE_CLOUDINARY_CLOUD_NAME": "@cloudinary_cloud_name",
    "VITE_CLOUDINARY_UPLOAD_PRESET": "@cloudinary_preset",
    "VITE_REPLIZ_ACCESS_KEY": "@repliz_access_key",
    "VITE_REPLIZ_SECRET_KEY": "@repliz_secret_key",
    "VITE_REPLIZ_ACCOUNT_ID": "@repliz_account_id"
  }
}
```

> ⚠️ Static app pakai `VITE_*` env — tersimpan saat build. Serverless function
> (`api/*.ts`) pakai env tanpa VITE_ (server-side). Jadi dua set env diperlukan.

### A.3 Deploy Steps

```bash
# 1. Install vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Set env vars di Vercel dashboard (Project → Settings → Environment Variables)
#    - Untuk BUILD TIME: VITE_* (semua client env)
#    - Untuk SERVERLESS: GEMINI_API_KEY, SECTORS_API_KEY, SUPABASE_URL, etc

# 4. Deploy
vercel --prod
```

### A.4 Post-Deploy Check

| Check | URL | Expect |
|-------|-----|--------|
| Health | `https://sahamfyp.vercel.app/api/health` | `{ "status": "ok" }` |
| Scraper | `POST /api/scrape` | `{ title, content, image, siteName }` |
| Dashboard | `https://sahamfyp.vercel.app/` | Login page |
---

## 🛠️ PART B — Build SahamFYP API Endpoints (untuk n8n)

> Saat ini hanya ada `api/scrape.ts`. Untuk n8n perlu **content API lengkap**.
> Mari buat fungsi berikut:

### B.1 Endpoint Map

| # | Method | Endpoint | Deskripsi | Auth |
|---|--------|----------|-----------|------|
| 1 | `GET` | `/api/health` | Health check | — |
| 2 | `POST` | `/api/scrape` | Scrape URL berita | — |
| 3 | `POST` | `/api/classify` | Classify kategori (Gemini via Vercel) | API Key |
| 4 | `POST` | `/api/enrich` | Enrich data Sectors.app (+ credit tracking) | API Key |
| 5 | `POST` | `/api/generate` | **FULL PIPELINE**: scraped→classify→enrich→naskah JSON | API Key |
| 6 | `POST` | `/api/render-html` | Naskah JSON → styled HTML string | API Key |
| 7 | `POST` | `/api/publish` | Publish carousel ke IG/TikTok via Repliz (param: `platform`) | API Key |
| 8 | `GET` | `/api/posts` | List semua generated posts | API Key |
| 9 | `GET` | `/api/posts/:id` | Detail 1 post | API Key |
| 10 | `PATCH` | `/api/posts/:id` | Update post (status, likes, permalink) | API Key |
| 11 | `POST` | `/api/posts/:id/cancel` | Cancel schedule Repliz | API Key |
| 12 | `GET` | `/api/ig/stats` | Fetch engagement stats dari Repliz → save Supabase | API Key |

### B.2 `api/generate.ts` — Full Pipeline (core)

```typescript
// Input:  { url?: string, manual?: ManualNaskahInput }
// Output: { postId, category, ticker, naskah: CarouselData, cloudinaryUrls: [] }

import type { VercelRequest, VercelResponse } from '@vercel/node';
// Hypothetical pipeline service (buat di api/_lib/pipeline.ts)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url, manual } = req.body;

  // ... validate auth header (X-API-Key)
  // ... server-side services:
  //   step 1: scrape(url)                → { title, content, image, siteName }
  //   step 2: classify(title, content)   → { category, ticker, sector }
  //   step 3: enrich(category, ticker)   → Sectors.app data
  //   step 4: generateNaskah(input)      → CarouselData (8 slides JSON)
  //   step 5: save Supabase content_logs + generated_posts
  //   return { postId, naskah, category, ticker }
}
```

> ⚠️ **Image generation (PNG) server-side**
> `html-to-image` adalah client-side library. Untuk serverless ada 3 option:
> - **Option A (recommended)**: `/api/generate` return naskah JSON only.
>   n8n chiama web app di browser (Playwright) untuk render PNG → upload Cloudinary.
> - **Option B**: Vercel function dengan `playwright` + `chromium` (heavy ~50MB,
>   limite waktu 10s mungkin tight). Punya cost Vercel.
> - **Option C**: n8n sediri render via IFrame/HTML-to-image node — TBD.

### B.3 `api/publish.ts` — Publish ke Instagram + TikTok

```typescript
// Input:  { cloudinaryUrls: string[], caption: string, platform: 'instagram' | 'tiktok', scheduleAt?: string }
// Output: { scheduleId, status: 'scheduled' }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Validate API key
  // 2. Build album carousel payload (type: 'album', medias: cloudinaryUrls)
  //    → IG:  album (8 slides, swipeable)
  //    → TikTok: album (8 slides, swipeable) ← TikTok supports carousel photo mode
  // 3. POST https://api.repliz.com/public/schedule  (accountId sesuai platform)
  // 4. Save schedule_id + status ke Supabase generated_posts
  // 5. Return scheduleId
}
```

> ✅ **TikTok punya Carousel/Album mode** — langsung bisa digeser multi foto
> (max ~35 foto/post). Jadi SAMA 8 slide works untuk IG dan TikTok.
> `type: "album"` + `medias[]` payload sama untuk kedua platform.

### B.3b Dual Caption Variant (IG + TikTok)

Gemini generate **2 caption versi** per naskah:

```json
{
  "naskah": { "...8 slides..." },
  "caption": {
    "instagram": "✅ caption for IG (hashtags: #saham #investasi)",
    "tiktok": "🔥 caption for TikTok (hook agresif + #fyp #foryou)"
  }
}
```

| Platform | Caption Style |
|----------|---------------|
| **Instagram** | Aktivasi, edukasi, hashtags saham/investasi |
| **TikTok** | Lebih casual, hook agresif, #fyp #foryou #sahamindonesia |

### B.4 API Key Auth (simple)

- Di Vercel env: `N8N_API_KEY=SahamFYP-{random-token}`
- Function cek: `req.headers['x-api-key'] === process.env.N8N_API_KEY`
- n8n HTTP Request node pakai header tersebut.

### B.5 Files to Create

```
api/
├── _lib/
│   ├── auth.ts          // validateApiKey(req)
│   ├── pipeline.ts      // scrape→classify→enrich→naskah (server-side)
│   └── supabase.ts      // server-side supabase client (service role key)
├── health.ts            // GET  /api/health
├── scrape.ts            // POST /api/scrape (exists)
├── classify.ts          // POST /api/classify (Gemini)
├── enrich.ts            // POST /api/enrich (Sectors.app + credit tracking)
├── generate.ts          // POST /api/generate (naskah JSON)
├── render-html.ts       // POST /api/render-html (naskah → styled HTML)
├── publish.ts           // POST /api/publish (IG/TikTok via Repliz, param platform)
├── posts.ts             // GET  /api/posts
├── posts/[id].ts        // GET/PATCH /api/posts/:id
├── posts/[id]/cancel.ts // POST /api/posts/:id/cancel
└── ig-stats.ts          // GET  /api/ig/stats
```

> ⚠️ Server-side services harus **dupliseren** client logic (scraper, gemini,
> enrichment, naskah) — karena client services pakai `import.meta.env.VITE_*`
> yang tidak tersedia in Vercel function. Simplest: buat `api/_lib/` dengan
> copy logic + `process.env` keys.
---

## 🔄 PART C — N8N Workflow Design

### C.1 Workflow 1: RSS → Auto Content → Draft

```
[Manual/Schedule Trigger]
        │
        ▼
[Fetch RSS]  ← node "RSS Feed Read"
   cnbcindonesia.com/market/rss
        │ (loop items)
        ▼
[Filter]  ← hanya URL saham (path /market/)
        │
        ▼
[HTTP Request: POST /api/generate]
   { "url": "{{item.link}}" }
        │
        ▼
[IF: success?]
        ├── YES → [Supabase: insert content_logs]
        │         [Wait 1 min (rate limit)]
        │         └── loop next item
        └── NO  → [Log error] → continue
```

**Node list (n8n):**
1. `Schedule Trigger` — every 30 min / 1 hour
2. `RSS Feed Read` — `https://www.cnbcindonesia.com/market/rss`
3. `Item List` — loop each feed item
4. `IF` — filter: link contains `/market/`
5. `HTTP Request` — POST `https://sahamfyp.vercel.app/api/generate` (header: `x-api-key`)
6. `Set` — map response → payload
7. `Supabase Insert` — `content_logs` table
8. `Wait` — delay 30-60s (avoid Gemini rate limit)
9. `Code` — logging

### C.2 Workflow 2: Generate Carousel → Publish IG (After Review)

```
[Manual Trigger]  ← atau Webhook
        │
        ▼
[HTTP Request: GET /api/posts?status=generated]
   → list posts siap publish
        │
        ▼
[IF: user-confirm? (from Webhook / Telegram bot)]
        ├── YES → [HTTP Request: POST /api/publish]
        │         { "postId": "xxx", "caption": "...", "scheduleAt": "..." }
        │         ▼
        │         [Telegram: Notify "✅ Published! scheduleId: xxx"]
        └── NO  → [Telegram: "⏭ Skipped"]
```

### C.3 Workflow 3: Auto Publish (Fully Automated)

```
[Schedule Trigger]  ← 07:00 & 19:00 daily
        │
        ▼
[HTTP Request: GET /api/posts?status=generated&limit=1]
   → get post dengan position 0
        │
        ▼
[Branch: Publish to both platforms]
        │
        ├──► [HTTP Request: POST /api/publish]
        │     { "postId": "{{id}}", "platform": "instagram", "caption": "{{caption.instagram}}" }
        │     ↓
        │     [IF: success?]
        │        YES → [Supabase: instagram_status='scheduled']
        │        NO  → [Telegram: "❌ IG publish failed"]
        │
        └──► [HTTP Request: POST /api/publish]
              { "postId": "{{id}}", "platform": "tiktok", "caption": "{{caption.tiktok}}" }
              ↓
              [IF: success?]
                 YES → [Supabase: tiktok_status='scheduled']
                 NO  → [Telegram: "❌ TikTok publish failed"]
        │
        ▼
[Watch Repliz Status]  ← wait 30 min
   [HTTP Request: GET /api/posts/{{id}}]
        │
        ▼
[IF: status == published?]
   YES → [Supabase: update status='published']
         [Telegram: Notify + permalink IG + TikTok]
   NO  → [Retry / Log error]
```

### C.4 Workflow 4: Engagement Analytics → Daily Report

```
[Schedule Trigger]  ← 21:00 daily
        │
        ▼
[HTTP Request: GET /api/ig/stats]
   → fetch semua Repliz schedule status + engagement
        │
        ▼
[Update Supabase generated_posts]
   set likes, comments, reach, permalink
        │
        ▼
[Telegram Notify]
   "📊 Daily Report:
    Posts: 3 | Total Likes: 1.2K | ER: 4.5%
    Top: BUMI Laba Naik 24% (❤️ 430)"
```
---

## 🔐 PART D — Security & Rate Limiting

| Item | Detail |
|------|--------|
| **API Key** | `N8N_API_KEY` di Vercel env; semua `/api/*` (except scrape/health) validate |
| **Gemini rate limit** | 15 req/min → n8n `Wait` node 30-60s antara post |
| **Sectors.app credits** | ~7 credits/post → monitor kumulativ, set daily cap |
| **Repliz** | Schedule rate: 1-2 post/hour max per platform (IG + TikTok best practice) |
| **Supabase RLS** | Server-side pakai service-role key; client pakai anon key |

---

## 🧪 PART E — Testing Checklist

- [ ] Deploy Vercel → `GET /api/health` → `{status: ok}`
- [ ] `POST /api/scrape` → `{title, content, image}` berfungsi in production
- [ ] `POST /api/classify` → kategori + ticker valid
- [ ] `POST /api/enrich` → Sectors.app data (+ credit tracking)
- [ ] `POST /api/generate` → naskah JSON 8 slides valid
- [ ] `POST /api/render-html` → styled HTML string valid
- [ ] `GET /api/posts` → list dari Supabase
- [ ] `POST /api/publish` → Repliz scheduleId return (platform: instagram)
- [ ] `POST /api/publish` → Repliz scheduleId return (platform: tiktok)
- [ ] n8n Workflow 1 → RSS feed → content_logs insert
- [ ] n8n Workflow 3 → auto publish → IG + TikTok post terpublish
- [ ] n8n Workflow 4 → daily report Telegram

---

## 📅 PART F — Implementation Order

| Step | Task | Est. |
|------|------|------|
| 1 | Deploy static app + `/api/health` + `/api/scrape` ke Vercel | 1-2 h |
| 2 | Buat `api/_lib/` — server-side pipeline (scrape→classify→enrich→naskah) | 1 day |
| 3 | Buat `/api/classify`, `/api/enrich`, `/api/generate`, `/api/render-html`, `/api/publish` | 1 day |
| 4 | Test semua endpoint via Postman/curl | 2-3 h |
| 5 | Buat n8n cloud account + workflow 1 (RSS → draft) | 2-3 h |
| 6 | Buat workflow 3 (auto publish) + workflow 4 (report) | 3-4 h |
| 7 | Test end-to-end dengan berita real | 1 day |

---

## 🎯 Decision Point — Kebutuhan Konfirmasi dari Anda

Before implement, perlu konfirmasi 3 ini:

1. **Server-side image rendering**: Option A (n8n use browser), B (Playwright in Vercel),
   atau C (skip auto publish, manusia klik Publish di dashboard)?

2. **n8n hosting**: n8n.cloud (SaaS, mudah) atau self-host (Docker/VPS)?

3. **Telegram notification**: include bot untuk notifikasi status publish?
   (Repliz pannanya IG private API; untuk public API perlu Meta Graph — separate scope)
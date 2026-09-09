# 🔧 N8N Workflow Setup — SahamFYP Integration

> **n8n Instance**: https://n8n-blmoplqdbdrg.eu1.sumopod.my.id
> **SahamFYP API**: https://saham-fyp.vercel.app

---

## 📋 Prerequisites

1. ✅ n8n instance running
2. ✅ SahamFYP API deployed di Vercel (setelah redeploy + env vars)
3. ✅ `N8N_API_KEY` sudah di-set di Vercel env vars

---

## 🔑 API Key Auth

Semua endpoint (kecuali `/api/health` dan `/api/scrape`) require header:
```
X-API-Key: <N8N_API_KEY>
```

Generate key (run di terminal):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

## 📡 Endpoint Reference

| # | Endpoint | Method | Auth | Body |
|---|----------|--------|------|------|
| 1 | `/api/health` | GET | — | — |
| 2 | `/api/scrape` | POST | — | `{"url": "..."}` |
| 3 | `/api/classify` | POST | ✅ | `{"title": "...", "content": "..."}` |
| 4 | `/api/enrich` | POST | ✅ | `{"category": "...", "ticker": "..."}` |
| 5 | `/api/generate` | POST | ✅ | `{"url": "..."}` |
| 6 | `/api/publish` | POST | ✅ | `{"postId": "...", "cloudinaryUrls": [...], "caption": "...", "platform": "instagram"}` |
| 7 | `/api/posts` | GET | — | — |

---

## 🔄 Workflow 1: RSS → Generate Content (Draft)

### Node Configuration

#### Node 1: Schedule Trigger
- **Trigger**: Interval
- **Interval**: Every 30 minutes

#### Node 2: RSS Feed Read
- **URL**: `https://www.cnbcindonesia.com/market/rss`

#### Node 3: Item List (loop)
- **Field to split**: `items`

#### Node 4: Filter (only market URLs)
- **Condition**: `link` contains `/market/`

#### Node 5: HTTP Request — Generate
- **Method**: POST
- **URL**: `https://saham-fyp.vercel.app/api/generate`
- **Headers**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: `{{ $env.N8N_API_KEY }}`
- **Body (JSON)**:
```json
{
  "url": "{{ $json.link }}"
}
```

#### Node 6: IF (not skipped)
- **Condition**: `skipped` is not equal to `true`

#### Node 7: HTTP Request — Save to Supabase
- **Method**: POST
- **URL**: `https://saham-fyp.vercel.app/api/posts`
- **Headers**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: `{{ $env.N8N_API_KEY }}`
- **Body (JSON)**:
```json
{
  "category": "{{ $json.classification.category }}",
  "ticker": "{{ $json.classification.ticker }}",
  "title": "{{ $json.naskah.title }}",
  "content": "{{ $json.content }}",
  "naskah": "{{ $json.naskah }}",
  "classification": "{{ $json.classification }}",
  "enrichment": "{{ $json.enrichment }}",
  "image": "{{ $json.image }}",
  "siteName": "{{ $json.siteName }}"
}
```

#### Node 8: Wait
- **Time**: 45 seconds (avoid Gemini rate limit)

---

## 🔄 Workflow 2: Manual Publish (IG + TikTok)

### Trigger: Manual or Webhook

#### Node 1: HTTP Request — Get Posts
- **Method**: GET
- **URL**: `https://saham-fyp.vercel.app/api/posts?status=generated&limit=1`
- **Headers**: `X-API-Key: {{ $env.N8N_API_KEY }}`

#### Node 2: Function (extract data)
```javascript
const items = $input.all();
const post = items[0].json.posts[0];
return [{
  json: {
    postId: post.id,
    badgeText: post.badge_text,
    slides: post.slides_json
  }
}];
```

#### Node 3: HTTP Request — Publish Instagram
- **Method**: POST
- **URL**: `https://saham-fyp.vercel.app/api/publish`
- **Headers**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: `{{ $env.N8N_API_KEY }}`
- **Body**:
```json
{
  "postId": "{{ $json.postId }}",
  "cloudinaryUrls": ["{{ $json.slides[0].image }}"],
  "caption": "{{ $json.caption.instagram }}",
  "platform": "instagram"
}
```

#### Node 4: HTTP Request — Publish TikTok
- **Method**: POST
- **URL**: `https://saham-fyp.vercel.app/api/publish`
- **Headers**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: `{{ $env.N8N_API_KEY }}`
- **Body**:
```json
{
  "postId": "{{ $json.postId }}",
  "cloudinaryUrls": ["{{ $json.slides[0].image }}"],
  "caption": "{{ $json.caption.tiktok }}",
  "platform": "tiktok"
}
```

---

## 🧪 Test Workflow (Step by Step)

### Test 1: Health Check
```
Method: GET
URL: https://saham-fyp.vercel.app/api/health
Expected: {"status":"ok","service":"SahamFYP",...}
```

### Test 2: Scrape CNBC
```
Method: POST
URL: https://saham-fyp.vercel.app/api/scrape
Body: {"url": "https://www.cnbcindonesia.com/market/..."}
Expected: {"title": "...", "content": "...", "image": "..."}
```

### Test 3: Generate Full Content
```
Method: POST
URL: https://saham-fyp.vercel.app/api/generate
Headers: X-API-Key: <your-key>
Body: {"url": "https://www.cnbcindonesia.com/market/..."}
Expected: {"classification": {...}, "naskah": {...}, "enrichment": {...}}
```

### Test 4: Save Post
```
Method: POST
URL: https://saham-fyp.vercel.app/api/posts
Headers: X-API-Key: <your-key>
Body: {"category": "SINGLE_STOCK", "ticker": "BBCA", "naskah": {...}}
Expected: {"post": {"id": "uuid", ...}}
```

### Test 5: Publish to Instagram
```
Method: POST
URL: https://saham-fyp.vercel.app/api/publish
Headers: X-API-Key: <your-key>
Body: {"postId": "uuid", "cloudinaryUrls": ["https://res.cloudinary.com/..."], "caption": "...", "platform": "instagram"}
Expected: {"success": true, "scheduleId": "..."}
```

---

## ⚠️ Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Returns HTML instead of JSON | Vercel serving SPA fallback | Redeploy after setting env vars |
| 401 Unauthorized | Missing/invalid API key | Check `X-API-Key` header |
| 405 Method not allowed | Wrong HTTP method | Use POST for generate/publish |
| Empty content | CNBC blocked/redirect | Check response status, try different URL |
| Timeout | Vercel Hobby 10s limit | Use Vercel Pro or optimize scraper |

---

## 📁 Import Workflow JSON

Setelah API aktif, import file `n8n-workflows/sahamfyp-rss-draft.json` ke n8n:
1. Buka n8n dashboard
2. Klik "Workflows" → "Import from File"
3. Pilih file JSON
4. Update credentials/API key
5. Activate workflow
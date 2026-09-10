# Konfigurasi n8n untuk SahamFYP Backend

Dokumentasi lengkap untuk mengkonfigurasi n8n agar bisa berkomunikasi dengan backend Vercel.

## Base URL

```
https://saham-fyp.vercel.app
```

---

## API Endpoints

### 1. `/api/health` - Health Check

| Properti | Nilai |
|----------|-------|
| **Method** | `GET` |
| **API Key** | ❌ Tidak perlu |
| **Response** | Status dan konfigurasi environment |

**Contoh Request (n8n HTTP Request):**
```json
{
  "method": "GET",
  "url": "https://saham-fyp.vercel.app/api/health"
}
```

**Contoh Response:**
```json
{
  "status": "ok",
  "service": "SahamFYP",
  "version": "1.0.0",
  "timestamp": "2026-09-10T01:28:30.843Z",
  "env": {
    "gemini": true,
    "sectors": true,
    "supabase": true,
    "supabaseServiceRole": true,
    "repliz": true
  }
}
```

---

### 2. `/api/scrape` - Web Scraper

| Properti | Nilai |
|----------|-------|
| **Method** | `POST` |
| **API Key** | ❌ Tidak perlu |
| **Content-Type** | `application/json` |

**Body Parameters:**
| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `url` | string | ✅ Ya | URL artikel yang akan di-scrape |

**Contoh Request (n8n HTTP Request):**
```json
{
  "method": "POST",
  "url": "https://saham-fyp.vercel.app/api/scrape",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "url": "https://www.cnbcindonesia.com/market/20260909161002-17-766608/contoh-artikel"
  }
}
```

**Contoh Response:**
```json
{
  "url": "https://www.cnbcindonesia.com/...",
  "title": "Judul Artikel",
  "content": "Isi artikel lengkap...",
  "description": "Ringkasan artikel",
  "author": "Nama Penulis",
  "publishedDate": "2026-09-09",
  "image": "https://...",
  "siteName": "CNBC Indonesia"
}
```

**Sumber yang Didukung:**
- ✅ CNBC Indonesia (`cnbcindonesia.com`)
- ✅ Detik Finance (`detik.com`)
- ✅ Kompas (`kompas.com`)
- ✅ Liputan6 (`liputan6.com`)
- ✅ Website berita lainnya dengan struktur HTML standar

---

### 3. `/api/classify` - AI News Classifier

| Properti | Nilai |
|----------|-------|
| **Method** | `POST` |
| **API Key** | ❌ Tidak perlu |
| **Content-Type** | `application/json` |
| **AI Engine** | Google Gemini |

**Body Parameters:**
| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `title` | string | ✅ Ya | Judul berita |
| `content` | string | ✅ Ya | Isi berita |

**Contoh Request (n8n HTTP Request):**
```json
{
  "method": "POST",
  "url": "https://saham-fyp.vercel.app/api/classify",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "title": "BBCA Naik 5% Hari Ini",
    "content": "Harga saham BBCA naik 5% hari ini setelah bank sentral menurunkan suku bunga."
  }
}
```

**Contoh Response:**
```json
{
  "category": "SINGLE_STOCK",
  "ticker": "BBCA",
  "sector": "Financials",
  "confidence": 0.95,
  "reason": "Berita berfokus pada pergerakan harga saham BBCA secara spesifik."
}
```

**Kategori yang Tersedia:**
| Kategori | Deskripsi |
|----------|-----------|
| `SINGLE_STOCK` | Berita tentang saham individual |
| `MACRO_ECONOMY` | Berita ekonomi makro |
| `SECTOR_ANALYSIS` | Analisis sektor |
| `CORPORATE_ACTION` | Aksi korporasi (Right Issue, Stock Split, dll) |
| `IPO_RIGHTS_ISSUE` | IPO dan Rights Issue |
| `SUSPENSION_DELISTING` | Suspensi dan Delisting |
| `SKIP` | Berita tidak relevan, skip |
| `SKIP` | Berita tidak relevan, skip |

---

### 4. `/api/enrich` - Data Enrichment (Sectors.app)

| Properti | Nilai |
|----------|-------|
| **Method** | `POST` |
| **API Key** | ✅ Ya - Header `X-API-Key` |
| **Content-Type** | `application/json` |
| **Data Source** | Sectors.app API |

**Headers:**
| Header | Value |
|--------|-------|
| `X-API-Key` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (N8N_API_KEY dari Vercel) |

**Body Parameters:**
| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `title` | string | ✅ Ya | Judul berita |
| `content` | string | ✅ Ya | Isi berita |
| `category` | string | ✅ Ya | Kategori dari `/api/classify` |
| `ticker` | string | ❌ Ya | Kode saham (contoh: BBCA) |

**Contoh Request (n8n HTTP Request):**
```json
{
  "method": "POST",
  "url": "https://saham-fyp.vercel.app/api/enrich",
  "headers": {
    "Content-Type": "application/json",
    "X-API-Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "body": {
    "title": "BBCA Naik 5%",
    "content": "Harga saham BBCA naik 5% hari ini",
    "category": "SINGLE_STOCK",
    "ticker": "BBCA"
  }
}
```

**Contoh Response:**
```json
{
  "category": "SINGLE_STOCK",
  "ticker": "BBCA",
  "data": {
    "report": {
      "overview": { ... },
      "valuation": { ... },
      "financials": { ... },
      "dividend": { ... },
      "ownership": { ... }
    },
    "foreignFlow": { ... }
  }
}
```

---

### 5. `/api/generate` - Content Generator

| Properti | Nilai |
|----------|-------|
| **Method** | `POST` |
| **API Key** | ✅ Ya - Header `X-API-Key` |
| **Content-Type** | `application/json` |
| **AI Engine** | Google Gemini |

**Headers:**
| Header | Value |
|--------|-------|
| `X-API-Key` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (N8N_API_KEY dari Vercel) |

**Body Parameters:**
| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `title` | string | ✅ Ya | Judul berita |
| `content` | string | ✅ Ya | Isi berita |
| `category` | string | ✅ Ya | Kategori dari classify |
| `ticker` | string | ❌ Ya | Kode saham |

**Contoh Request (n8n HTTP Request):**
```json
{
  "method": "POST",
  "url": "https://saham-fyp.vercel.app/api/generate",
  "headers": {
    "Content-Type": "application/json",
    "X-API-Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "body": {
    "title": "BBCA Naik 5%",
    "content": "Harga saham BBCA naik 5% hari ini",
    "category": "SINGLE_STOCK",
    "ticker": "BBCA"
  }
}
```

**Slide Templates yang Tersedia:**
- `cover` - Slide cover/judul
- `tldr` - Ringkasan singkat
- `kronologi` - Kronologi peristiwa
- `data` - Data dan metrik
- `analisis` - Analisis
- `cta` - Call to action

---

### 6. `/api/posts` - Posts Management

| Properti | Nilai |
|----------|-------|
| **Method** | `GET` atau `POST` |
| **API Key** | ✅ Ya - Header `X-API-Key` |
| **Content-Type** | `application/json` |
| **Database** | Supabase |

**Headers:**
| Header | Value |
|--------|-------|
| `X-API-Key` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (N8N_API_KEY dari Vercel) |

#### GET - List Posts

**Query Parameters:**
| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `status` | string | ❌ | Filter berdasarkan status |
| `limit` | number | ❌ | Jumlah data (default: 50) |
| `offset` | number | ❌ | Offset pagination (default: 0) |

**Contoh Request (n8n HTTP Request):**
```json
{
  "method": "GET",
  "url": "https://saham-fyp.vercel.app/api/posts?limit=10",
  "headers": {
    "X-API-Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST - Create/Update Post

**Body Parameters:**
| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `handle` | string | ❌ | Instagram handle |
| `badge_text` | string | ❌ | Teks badge |
| `slides_json` | array | ❌ | Array slides |
| `instagram_status` | string | ❌ | Status Instagram |
| `tiktok_status` | string | ❌ | Status TikTok |

---

### 7. `/api/publish` - Publish to Social Media

| Properti | Nilai |
|----------|-------|
| **Method** | `POST` |
| **API Key** | ✅ Ya - Header `X-API-Key` |
| **Content-Type** | `application/json` |
| **Platform** | Repliz (Instagram + TikTok) |

**Headers:**
| Header | Value |
|--------|-------|
| `X-API-Key` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (N8N_API_KEY dari Vercel) |

**Body Parameters:**
| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `postId` | string | ✅ Ya | ID post dari Supabase |
| `cloudinaryUrls` | array | ✅ Ya | Array URL gambar dari Cloudinary |
| `caption` | string | ✅ Ya | Caption untuk social media |
| `platform` | string | ❌ | `instagram` atau `tiktok` (default: instagram) |
| `scheduleAt` | string | ❌ | ISO 8601 datetime untuk scheduling |

**Contoh Request (n8n HTTP Request):**
```json
{
  "method": "POST",
  "url": "https://saham-fyp.vercel.app/api/publish",
  "headers": {
    "Content-Type": "application/json",
    "X-API-Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "body": {
    "postId": "d67e215f-d650-4bf3-8244-4e2d622a82ea",
    "cloudinaryUrls": [
      "https://res.cloudinary.com/demo/image/upload/sample1.jpg"
    ],
    "caption": "Wah, BBCA terbang 5% hari ini! 🚀\n\n#saham #investasi #bbca",
    "platform": "instagram"
  }
}
```

**Contoh Response:**
```json
{
  "success": true,
  "scheduleId": "6aa20b8558ecc4717a863f28",
  "platform": "instagram",
  "status": "scheduled"
}
```
```

---

## API Key (N8N_API_KEY)

### Apa itu N8N_API_KEY?

`N8N_API_KEY` adalah token autentikasi yang digunakan untuk mengamankan endpoint-endpoint berikut:
- `/api/enrich`
- `/api/generate`
- `/api/posts`
- `/api/publish`

### Dimana Mendapatkan API Key?

1. **Vercel Dashboard** → Project Settings → Environment Variables
2. **Local** → File `.env.local` (variabel `N8N_API_KEY`)

### Format API Key

Token ini adalah JWT (JSON Web Token) yang terlihat seperti:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMzAyMDViMi1hMzY1LTQyZDUtODE0ZS0yYzRiYjJkNDQyYmIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDdmMGMwYjktMTQ1MC00NjcwLTk3ZjktZjA1ZDU2Y2EzM2ViIiwiaWF0IjoxNzg4OTM1MDA2fQ.PVtFSytgbdeoVO_86oOpYZPMmNbYOYEV9MCaUSVVGos
```

### Cara Menggunakan di n8n

Di node **HTTP Request** di n8n, tambahkan header:
```
Header Name: X-API-Key
Header Value: <N8N_API_KEY dari Vercel>
```

---

## Workflow n8n yang Direkomendasikan

### Workflow 1: Scrape → Classify → Enrich → Generate

```
[Trigger] → [HTTP: /api/scrape] → [HTTP: /api/classify] → [HTTP: /api/enrich] → [HTTP: /api/generate]
```

**Langkah:**
1. Scrape artikel dari URL CNBC/Detik/dll
2. Classify artikel untuk dapatkan category dan ticker
3. Enrich data dari Sectors.app
4. Generate naskah Instagram/TikTok

### Workflow 2: Generate → Save to Supabase → Publish

```
[HTTP: /api/generate] → [HTTP: POST /api/posts] → [HTTP: /api/publish]
```

**Langkah:**
1. Generate naskah dari artikel
2. Save post ke Supabase
3. Publish ke Instagram/TikTok via Repliz

---

## Error Handling

| HTTP Status | Artinya | Solusi |
|-------------|---------|--------|
| `200` | Sukses | - |
| `400` | Bad Request | Cek format body/parameter |
| `401` | Unauthorized | Tambahkan `X-API-Key` header yang benar |
| `405` | Method Not Allowed | Gunakan method yang benar (GET/POST) |
| `500` | Server Error | Cek logs di Vercel |

---

## Catatan Penting

1. **API Key Wajib**: Endpoint `/api/enrich`, `/api/generate`, `/api/posts`, `/api/publish` memerlukan header `X-API-Key`
2. **API Key Opsional**: Endpoint `/api/scrape`, `/api/classify`, `/api/health` tidak memerlukan API key
3. **Rate Limiting**: Tidak ada rate limiting, tapi pertimbangkan untuk menambahkan delay antar request
4. **Timeout**: Vercel serverless functions memiliki timeout 10 detik (Hobby plan) atau 60 detik (Pro plan)
5. **CORS**: Semua endpoint sudah mendukung CORS untuk akses dari browser/n8n

---

## Testing dengan n8n

Untuk testing cepat di n8n:

1. Buat node **HTTP Request**
2. Set **Method** sesuai endpoint
3. Set **URL**: `https://saham-fyp.vercel.app/api/<endpoint>`
4. Tambahkan **Header** `Content-Type: application/json`
5. Jika perlu, tambahkan **Header** `X-API-Key: <your-key>`
6. Set **Body Content Type**: `JSON`
7. Masukkan **Body** sesuai parameter endpoint



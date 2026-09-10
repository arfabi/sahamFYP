 SahamFYP — AI-Powered Financial Content Engine

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.10-cyan)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-3.5-orange)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Apa Itu SahamFYP?

**SahamFYP** adalah platform/content engine yang menghasilkan konten finansial berkualitas tinggi secara otomatis untuk diposting ke berbagai media sosial (Instagram, TikTok, dll). Fokus utama: memberikan **informasi saham yang relevan, terverifikasi, dan faktual** kepada **Gen Z investor** — pengguna akhir yang mendominasi pasar modal Indonesia saat ini.

SahamFYP bukan sekadar "berita saham", tapi **konten yang terintegrasi dengan data fundamental**: laporan keuangan, dividen, valuation, ownership, dan data lengkap lainnya dari **sector.app**, sehingga Gen Z bisa memahami **mengapa** sebuah saham trending, apakah benar-benar bagus, atau hanya sekadar hype.

---

## 🎯 Latar Belakang

### Masalah

Berdasarkan data dari **Bursa Efek Indonesia (BEI)** per Mei 2026, **54,4% investor pasar modal** berasal dari **Generasi Z** (lahir 1997–2012). Sementara itu, data **Kustodian Sentral Efek Indonesia (KSEI)** per Juni 2024 mencatat bahwa **55,38% investor individu** berusia **30 tahun ke bawah**.

Meskipun jumlah investor Gen Z mendominasi, **kontribusi aset mereka masih kecil**: hanya **Rp48,3 triliun** atau **3,2% dari total aset** di C-Best BEI (Mei 2026). Ini mengindikasikan bahwa meskipun frekuensi partisipasi tinggi, nilainya belum sebesar investor kelompok lain.

Lebih dari itu, perilaku investasi Gen Z sering didorong oleh **FOMO (Fear Of Missing Out)** dan informasi dari media sosial. Berbagai riset dan opini menunjukkan bahwa:

- Banyak Gen Z membeli saham karena **viral/trending**, bukan karena analisis fundamental
- **Tanpa verifikasi data** dan **tanpa membaca laporan keuangan**
- Terpapar **misinformasi** dan ekspektasi keuntungan yang tidak realistis
- Risiko keputusan finansial yang kurang tepat meningkat

Secara spesifik, perilaku ini tercermin dalam:

1. **Beli saham karena FOMO**, bukan karena analisis fundamental
2. **Tidak cek data** dan **tidak baca laporan keuangan** perusahaan sebelumnya
3. **Mengikuti rekomendasi tanpa verifikasi** dari media sosial, grup WhatsApp, atau influencer tanpa dasar yang jelas
4. **Ekspektasi keuntungan tidak realistis**, mengabaikan risiko

**Sumber:**

- Data KSEI: https://databoks.katadata.co.id/pasar/statistik/66bdf4a992e5b/gen-z-dan-milenial-mendominasi-investor-pasar-modal-di-indonesia
- Opini Katadata: https://katadata.co.id/indepth/opini/6a505cc400c1e/membangun-fondasi-investasi-gen-z-sejak-dini
- E-Journal Innobiz: https://ejournal.cyber-univ.ac.id/index.php/innobiz/article/view/147/123

### Solusi SahamFYP

SahamFYP hadir sebagai solusi untuk:

- Memberikan **konten yang informatif & faktual** — bukan cuma "trending", tapi disertai data lengkap
- Mengintegrasikan **data dari sector.app** (laporan keuangan, dividen, valuation, ownership, dll) sebagai **verifikasi faktual**
- **Mengontekstualisasikan tren** dengan data fundamental: apakah saham yang naik benar-benar kuat, atau hanya hype?
- **Menjadwalkan konten tepat waktu** (misal: pagi sebelum bursa buka) agar relevan & actionable
- **Mendukung literasi keuangan** & pengambilan keputusan yang lebih sehat bagi Gen Z investor

Dengan demikian, SahamFYP tidak hanya memenuhi kebutuhan konten yang dibutuhkan Gen Z, tetapi juga mendukung **verifikasi data**, **pemahaman fundamental**, dan **pengambilan keputusan yang lebih baik**.
---

## 🌟 Fitur Utama

- **Auto-Classify Berita** → Klasifikasi otomatis berita ke kategori & ticker yang relevan
- **Auto-Enrich Berita** → Data lengkap dari sector.app: laporan keuangan, dividen, valuation, ownership, dan lainnya
- **Auto-Generate Konten** → Generate slide, caption, hashtag, dan konten IG/TikTok yang siap posting
- **Auto-Publish** → Schedule posting ke Repliz (Instagram, TikTok, dan platform lainnya)
- **Manual Post / Form Wizard** → Fleksibel, user bisa pilih waktu posting sendiri (WIB)
- **n8n Workflow Automation** → Pipeline lengkap: scrape → classify → enrich → generate → publish
- **Telegram Bot** → Notifikasi & kontrol via Telegram
- **Web Dashboard (React + Vite)** → UI untuk monitoring, manual post, dan form wizard

---

## 🛠️ Tech Stack

### 1. Repliz

- **Fungsi**: Publish scheduling ke Instagram, TikTok, dan platform lainnya
- **Referensi**: https://repliz.com/ | https://api.repliz.com/public-json
- **Cara kerja**: API scheduling menerima payload berupa judul, deskripsi, media (gambar/video), dan waktu posting (`scheduleAt`). SahamFYP menggunakan **HTTP Basic Auth** dengan access key dan secret key. Waktu posting ditambahkan dalam offset **WIB (`+07:00`)** untuk manual/form wizard — fleksibel, user bisa pilih waktu posting sendiri.

### 2. sector.app

- **Fungsi**: Sumber data fundamental saham — laporan keuangan, dividen, valuation, ownership structure, dan data lengkap lainnya
- **Referensi**: https://sectors.app/
- **Cara kerja**: API sectors.app menyediakan endpoint untuk retrieve data fundamental per ticker (misal: `fetch-company-report`, `fetch-foreign-flow`, `fetch-market-overview`, `fetch-suspensions`), yang kemudian digunakan untuk enrich konten dan memberikan fakta terverifikasi terkait saham yang trending.

### 3. Gemini (Google Generative AI)

- **Fungsi**:
  - **Klasifikasi berita** → kategori & ticker yang relevan
  - **Enrichment ringkasan** → ekstrak topik, insight, dan rekomendasi ticker
  - **Generate konten** → naskah slide, caption, hashtag, konten IG/TikTok
- **Referensi**: https://ai.google.dev/ | https://github.com/google/generative-ai-docs
- **Cara kerja**: Menggunakan `@google/generative-ai` SDK untuk generate content. Model yang digunakan: `gemini-3.5-flash-lite` (sesuai ketersediaan).

### 4. Cloudinary

- **Fungsi**: CDN & penyimpanan gambar untuk slide konten
- **Referensi**: https://cloudinary.com/
- **Cara kerja**:
  - Upload gambar slide hasil generate ke Cloudinary
  - URL gambar disimpan / digunakan sebagai `cloudinaryUrls` dalam payload publish
  - Cloudinary berfungsi sebagai CDN yang reliable untuk gambar yang di-post ke Instagram/TikTok
### 5. Template Konten & Klasifikasi Berita

SahamFYP menggunakan **6 kategori utama konten** yang masing-masing memiliki struktur slide carousel **8 slide** yang konsisten.

#### a. Klasifikasi Berita Otomatis

- **Endpoint**: `POST /api/classify`
- **Fungsi**: Mengklasifikasikan berita RSS/URL ke dalam 6 kategori utama dengan menentukan kategori terbaik dan ticker yang relevan (jika ada)
- **Kategori**: `SINGLE_STOCK`, `MACRO_ECONOMY`, `SECTOR_ANALYSIS`, `CORPORATE_ACTION`, `IPO_RIGHTS_ISSUE`, `SUSPENSION_DELISTING`
- **Output**: JSON berisi `{category, ticker?, confidence}`
- **Model**: Gemini `gemini-3.5-flash-lite`

#### b. Struktur Konten per Kategori

Semua kategori menggunakan **8 slide carousel** yang konsisten:

| Slide | Fungsi | Keterangan |
|-------|--------|------------|
| 1 | **COVER** | Headline menarik + sub-judul |
| 2 | **TLDR** | Ringkasan cepat dalam poin-poin |
| 3 | **KRONOLOGI** | Konteks berita (apa, kapan, siapa) + sumber |
| 4 | **Data Enrichment** | **Beda per kategori** (lihat tabel di bawah) |
| 5 | **Point + Explanation** | **Beda per kategori** (lihat tabel di bawah) |
| 6 | **Point + Explanation** | **Beda per kategori** (lihat tabel di bawah) |
| 7 | **KESIMPULAN** | Rangkuman edukatif netral |
| 8 | **CTA_DYOR** | Diskusi + disclaimer DYOR |

#### c. 6 Kategori & Perbedaan Slide 4–6

**1. SINGLE_STOCK — Analisis Emiten Tunggal**
- Slide 4: `BEDAH_DATA` — PER, PBV, ROE, ROA, EPS TTM, Foreign Flow
- Slide 5: `PROS` — Sisi positif emiten dengan point & explanation
- Slide 6: `CONS` — Sisi risiko dengan point & explanation
- **Sectors.app endpoints**: `fetch-company-report` (sections: `overview`, `valuation`, `financials`, `future`, `dividend`, `ownership`) + `fetch-foreign-flow`

**2. MACRO_ECONOMY — Makro Ekonomi & Tren Pasar**
- Slide 4: `DAMPAK_PASAR` — Dampak kebijakan makro ke IHSG & portofolio
- Slide 5: `DIUNTUNGKAN` — Saham/sector yang diuntungkan kebijakan tersebut
- Slide 6: `PERLU_DIWASPADAI` — Risiko & hal yang perlu diwaspadai
- **Sectors.app endpoints**: `fetch-market-overview` + `fetch-company-report` (ringan)

**3. SECTOR_ANALYSIS — Tren Sektor & Emiten Terkait**
- Slide 4: `DATA_SEKTOR` — Data sektor (market cap, korelasi, top stocks)
- Slide 5: `SAHAM_JAGOAN` — Saham-saham yang mendominasi sektor
- Slide 6: `PERLU_DIWASPADAI` — Risiko & catatan khusus sektor
- **Sectors.app endpoints**: `fetch-sectors-overview` + `fetch-company-report` (untuk beberapa emiten)

**4. CORPORATE_ACTION — Aksi Korporasi**
- Slide 4: `DETAIL_AKSI` — Jadwal & detail aksi (bonus, cuan, dividend, split, dll)
- Slide 5: `UNTUNG_BUAT_INVESTOR` — Pengaruh aksi ke investor
- Slide 6: `PERLU_DIPERHATIKAN` — Hal yang perlu diperhatikan sebelum/after aksi
- **Sectors.app endpoints**: `fetch-company-report` (sections: `overview`) — ringan

**5. IPO_RIGHTS_ISSUE — IPO & Penawaran Emiten**
- **(5A) Emiten dengan prospektus & data jelas**
  - Slide 4: `SKEMA_AKSI` — Skema penawaran (harga, lot, discount, jadwal)
  - Slide 5: `UNTUNG_BUAT_INVESTOR` — Potensi keuntungan
  - Slide 6: `RISIKO` — Risiko investasi IPO
  - **Sectors.app endpoints**: `fetch-company-report` (sections: `overview`) — ringan
- **(5B) Emiten dengan info terbatas**
  - Slide 4: `DETAIL_PENAWARAN` — Detail yang tersedia (hanya yang public)
  - Slide 5: `PROFIL_PERUSAHAAN` — Profil singkat yang diketahui
  - Slide 6: `KENAPA_MENARIK` — Faktor menarik + keberadaan risiko
  - **Sectors.app endpoints**: Tidak ada — 100% dari teks berita RSS

**6. SUSPENSION_DELISTING — Suspensi & Delisting**
- Slide 4: `FAKTA_SUSPENSI` — Fakta dasar suspensi (status, ticker, kapan dimulai)
- Slide 5: `APA_ITU_SUSPENSI` — Edukasi tentang suspensi (mekanisme, tipe, cooling down vs delisting)
- Slide 6: `YANG_PERLU_DILAKUKAN` — Langkah yang bisa dilakukan investor
- **Sectors.app endpoints**: `fetch-suspensions` + `fetch-company-report` (sections: `overview`)
#### d. Data Enrichment — Sumber

- **Sectors.app**: Data fundamental emiten (keuangan, dividen, valuation, ownership, foreign flow, market overview, sectors)
- **Berita RSS / Teks berita**: Kapan data tidak tersedia dari Sectors.app (misalnya IPO 5B dengan prospektus belum rilis, atau suspensi yang belum ada data lengkap), konten 100% diambil dari teks berita RSS + konteks tambahan yang di-generate

#### e. Panduan Konten (Standar Wajib)

- Semua kategori **8 slide** — konsistensi pagination di tiap carousel
- Slide 1, 2, 7, 8 **format relatif sama** di semua kategori (bisa reuse komponen)
- Slide 3, 4, 5, 6 **berbeda per kategori** — masing-masing butuh komponen/template tersendiri
- Teks "Geser →" muncul di slide 1–5, tidak ada di slide 6–8
- Format **point + explanation** pada slide 5 & 6 adalah **standar wajib** di semua kategori
- Konten bersifat **edukatif & netral** — tidak mengajak beli/jual, melainkan memberi perspektif & data

#### f. Referensi Detail

Selengkapnya baca di: [`docs/Struktur_Konten_6_Kategori_SahamFYP.md`](docs/Struktur_Konten_6_Kategori_SahamFYP.md)

### 6. Supabase

- **Fungsi**: Database utama untuk menyimpan data posts (`generated_posts`, `post_images`), log aktivitas & status posting, konfigurasi & metadata
- **Referensi**: https://supabase.com/
- **Cara kerja**:
  - Menggunakan Supabase JS client untuk connect ke database
  - Tabel yang digunakan: `generated_posts` (status posting IG/TikTok, schedule_id, permalink, engagement data), `post_images`, dan tabel terkait lainnya
  - Storage untuk menyimpan gambar slides (jika diperlukan)

### 7. Vercel

- **Fungsi**:
  - Hosting untuk aplikasi web (frontend React + Vite)
  - Serverless functions (Vercel Functions) untuk API routes (`/api/*`)
- **Referensi**: https://vercel.com/
- **Cara kerja**:
  - Setiap file di `api/` folder di-deploy sebagai Vercel Function
  - Build command: `node scripts/sync-env.mjs && npm run build`
  - Output directory: `dist`
  - Config di `vercel.json` untuk routing & rewrites

### 8. n8n

- **Fungsi**: Workflow automation sebagai orchestrator utama — menghubungkan semua service: scrape → classify → enrich → generate → publish
- **Referensi**: https://n8n.io/
- **Cara kerja**:
  - Workflow JSON bisa diimport ke n8n instance
  - Trigger: schedule (jam tertentu), manual, atau webhook
  - Setiap step memanggil API SahamFYP atau service langsung

### 9. Telegram Bot

- **Fungsi**: Notifikasi status: berhasil / gagal / scheduled. Kontrol via perintah Telegram (opsional)
- **Referensi**: https://core.telegram.org/bots
- **Cara kerja**: Menggunakan Telegram Bot API untuk kirim notifikasi ke user/group yang diset.

### 10. React + Vite

- **Fungsi**: Web engine / dashboard / form wizard — UI untuk monitoring, manual post, dan form wizard
- **Referensi**: https://vitejs.dev/ | https://react.dev/
- **Plugin yang digunakan**:
  - `@vitejs/plugin-react` — React Fast Refresh & JSX support
  - `vite` (versi `^5.4.0`) — build tool & dev server
  - `tailwindcss` (versi `^3.4.10`) — styling & design system
- **Cara kerja**:
  - Vite sebagai build tool & dev server
  - React untuk component-based UI
  - Build output ke `dist/` folder
  - Deploy ke Vercel
---

## 📦 Cara Duplikasi / Clone Content Engine

### System Requirements

- **Node.js**: versi 18+ (direkomendasikan LTS)
- **npm**: 9+
- **Git**: untuk clone repo
- **API Dependencies**:
  - Gemini API key (Google AI Studio): https://aistudio.google.com/
  - sectors.app API key: https://sectors.app/
  - Repliz account & API key: https://repliz.com/
  - Supabase project & credentials: https://supabase.com/
  - n8n instance (self-hosted or cloud): https://n8n.io/
  - Telegram bot token (jika pakai notifikasi Telegram): https://core.telegram.org/bots
  - Cloudinary account & cloud name (untuk CDN gambar): https://cloudinary.com/
- **Vercel account**: untuk deploy backend & frontend

### Langkah Instalasi

```bash
# 1. Clone repo
git clone https://github.com/arfabi/sahamFYP.git
cd sahamFYP

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Copy .env.example ke .env.local dan isi semua variabel yang dibutuhkan
cp .env.example .env.local

# 4. Setup database Supabase
# Jalankan SQL migration di Supabase SQL Editor sesuai schema di bawah

# 5. Setup Cloudinary (opsional, untuk gambar slide)
# Jika menggunakan Cloudinary sebagai CDN gambar, set variabel:
# CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# 6. Test local development
npm run dev

# 7. Build for production
npm run build
```

### Environment Variables

Buat file `.env.local` dengan variabel berikut:

```bash
# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# sectors.app
SECTORS_API_KEY=your_sectors_api_key_here

# Repliz
REPLIZ_ACCESS_KEY=your_repliz_access_key
REPLIZ_SECRET_KEY=your_repliz_secret_key
REPLIZ_ACCOUNT_ID=your_repliz_account_id
# Opsional: TikTok account ID (jika beda dari Instagram)
# REPLIZ_TIKTOK_ACCOUNT_ID=your_repliz_tiktok_account_id
REPLIZ_TIKTOK_ACCOUNT_ID=your_repliz_tiktok_account_id_optional

# Cloudinary (CDN gambar)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# n8n
# Dipakai untuk autentikasi webhook calls dari n8n ke endpoint:
# /api/enrich, /api/generate, /api/posts, /api/publish
N8N_API_KEY=your_n8n_api_key_optional

# Telegram Bot (opsional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_optional
TELEGRAM_CHAT_ID=your_telegram_chat_id_optional
```
### Database Schema (Supabase)

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Tabel generated_posts
CREATE TABLE IF NOT EXISTS generated_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID,
  handle TEXT,
  badge_text TEXT,
  badge_bg_color TEXT,
  badge_text_color TEXT,
  slides_json JSONB,
  total_slides INTEGER,
  instagram_status TEXT DEFAULT 'generated',
  tiktok_status TEXT DEFAULT 'generated',
  schedule_id TEXT,
  tiktok_schedule_id TEXT,
  permalink TEXT,
  permalink_ig TEXT,
  permalink_tiktok TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel post_images
CREATE TABLE IF NOT EXISTS post_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES generated_posts(id),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Cloudinary Setup (Opsional)

1. Buat account di https://cloudinary.com/
2. Dapatkan credentials: `CLOUD_NAME`, `API_KEY`, `API_SECRET`
3. Tambahkan ke `.env.local`
4. Upload gambar slide ke Cloudinary sebelum publish (gunakan SDK atau API Cloudinary)
5. Gunakan URL yang dihasilkan sebagai `cloudinaryUrls` dalam payload publish

### Deploy ke Vercel

```bash
# 1. Install Vercel CLI (jika belum)
npm install -g vercel

# 2. Login ke Vercel
vercel login

# 3. Deploy
vercel

# Atau pakai Vercel dashboard: https://vercel.com/new
```

Set environment variables di Vercel dashboard (Settings > Environment Variables) sesuai variabel di atas.

> **Note**: Anda TIDAK PERLU menambahkan VITE_ keys secara manual. Build command 
ode scripts/sync-env.mjs && npm run build akan auto-generate VITE_ duplicates dari non-prefixed keys (lihat .env.example dan scripts/sync-env.mjs).

### Setup n8n Workflow

1. Buat n8n instance (self-hosted atau cloud)
2. Import workflow JSON (jika disediakan) atau buat manual
3. Setup trigger: schedule / manual / webhook
4. Hubungkan API nodes ke endpoint SahamFYP:
   - `POST /api/classify` → klasifikasi berita
   - `POST /api/enrich` → enrich dengan sector.app
   - `POST /api/generate` → generate slide & caption
   - `POST /api/publish` → publish ke Repliz
5. Setup notifikasi Telegram (jika dipakai)
---

## 📁 Struktur Project

```
sahamFYP/
├── api/
│   ├── _lib/              # Shared utilities
│   ├── classify.ts        # Klasifikasi berita endpoint
│   ├── enrich.ts          # Enrichment data sector.app endpoint
│   ├── generate.ts        # Generate konten (slide + caption) endpoint
│   ├── posts/
│   │   └── index.ts       # Posts management endpoints
│   ├── publish.ts         # Publish ke Repliz endpoint
│   ├── scrape.ts          # Scrape berita RSS endpoint
│   └── health.ts          # Health check endpoint
├── src/
│   ├── components/        # React components
│   │   ├── manualEditorData.ts
│   │   ├── templatesData.ts
│   │   └── ...
│   ├── services/          # API services (Supabase, dll)
│   │   ├── repliz.ts
│   │   └── supabase.ts
│   ├── prompts/           # Prompt templates (naskah generator)
│   │   └── naskahGenerator.ts
│   ├── Templates.tsx      # Template konten components
│   └── ...
├── docs/
│   └── Struktur_Konten_6_Kategori_SahamFYP.md  # Referensi template konten
├── base/                  # Reference documents
│   ├── Master_Prompt_SahamFYP_Classifier.md
│   └── Data_Mapping_Spec_SahamFYP.md
├── .env.example           # Template environment variables
├── package.json
├── vercel.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔌 API Reference

### Health Check

**GET** `/api/health`

- **Auth**: Tidak perlu
- **Response**: Status semua service & environment variables
- **Example**:
```json
{
  "status": "ok",
  "env": {
    "gemini": true,
    "sectors": true,
    "supabase": true,
    "repliz": true
  }
}
```

### Klassify Berita

**POST** `/api/classify`

- **Auth**: Tidak perlu (public)
- **Request body**:
```json
{
  "title": "Emas Antam Turun Rp4.000",
  "content": "Harga emas Antam turun Rp4000 per gram jadi Rp1..."
}
```
- **Response**: Kategori & ticker
```json
{
  "category": "SINGLE_STOCK",
  "ticker": "ANTM",
  "confidence": 0.95
}
```
- **Kategori yang didukung**: `SINGLE_STOCK`, `MACRO_ECONOMY`, `SECTOR_ANALYSIS`, `CORPORATE_ACTION`, `IPO_RIGHTS_ISSUE`, `SUSPENSION_DELISTING`
### Enrich Berita

**POST** `/api/enrich`

- **Auth**: `x-api-key` header (N8N_API_KEY)
- **Request body**:
```json
{
  "category": "SINGLE_STOCK",
  "ticker": "ANTM",
  "title": "...",
  "content": "..."
}
```
- **Response**: Data fundamental dari sector.app
```json
{
  "report": {
    "overview": { },
    "valuation": { },
    "financials": { },
    "dividend": { },
    "ownership": { }
  }
}
```

### Generate Konten

**POST** `/api/generate`

- **Auth**: `x-api-key` header (N8N_API_KEY)
- **Request body** (contuh full pipeline):
```json
{
  "title": "Emas Antam Turun Rp4.000",
  "content": "Harga emas Antam turun Rp4000 per gram jadi Rp1...",
  "category": "SINGLE_STOCK",
  "ticker": "ANTM"
}
```
- **Response**: Slide + caption + hashtags
```json
{
  "slides": [
    { "type": "COVER", "title": "...", "description": "..." },
    { "type": "TLDR", "points": [] }
  ],
  "caption": "...",
  "hashtags": ["#saham", "#ANTM"]
}
```

### Posts Management

**GET** `/api/posts`

- **Auth**: `x-api-key` header (N8N_API_KEY)
- **Query parameters**:
  - `limit` (default: 10)
  - `status` (optional): filter by instagram_status / tiktok_status
- **Response**:
```json
{
  "posts": [
    {
      "id": "...",
      "handle": "...",
      "slides_json": [],
      "instagram_status": "generated",
      "tiktok_status": "generated",
      "schedule_id": "...",
      "created_at": "2026-09-09T..."
    }
  ]
}
```

**POST** `/api/posts`

- **Auth**: `x-api-key` header (N8N_API_KEY)
- **Request body**:
```json
{
  "handle": "...",
  "slides_json": [],
  "instagram_status": "generated"
}
```
- **Response**:
```json
{
  "status": "saved",
  "post": {
    "id": "...",
    "handle": "...",
    "instagram_status": "generated"
  }
}
```
### Publish ke Repliz

**POST** `/api/publish`

- **Auth**: `x-api-key` header (N8N_API_KEY)
- **Request body**:
```json
{
  "postId": "...",
  "cloudinaryUrls": [
    "https://res.cloudinary.com/your-cloud/image/upload/v1/sample.jpg"
  ],
  "caption": "Harga emas Antam turun Rp4.000 per gram...",
  "platform": "instagram",
  "scheduleAt": "2026-09-10T07:45:00"
}
```
- **Response** (jika berhasil):
```json
{
  "status": "published",
  "scheduleId": "6aa155a358ecc4717a69d7d7",
  "platform": "instagram",
  "scheduleAt": "2026-09-10T07:45:00+07:00"
}
```

**Catatan publish:**
- Jika `scheduleAt` tidak diisi → posting segera (jam WIB sekarang)
- Jika `scheduleAt` diisi dengan format `YYYY-MM-DDTHH:mm:ss` (tanpa timezone) → dianggap WIB, ditambahkan offset `+07:00`
- Jika `scheduleAt` dengan timezone eksplisit (misal `+07:00` atau `Z`) → pakai apa adanya
- `cloudinaryUrls` bisa berisi 1 (single image) atau lebih (album/carousel). Jika 1 → type `image`, jika 2+ → type `album`

### Scrape Berita

**POST** `/api/scrape`

- **Auth**: Tidak perlu (public)
- **Request body**:
```json
{
  "url": "https://www.investing.com/news/stock-market-news/..."
}
```
- **Response**: Teks berita yang di-scrape (jika berhasil)

**Catatan**:
- Endpoint ini rentan terhadap blokir oleh target website (403 Forbidden). Beberapa situs mungkin memblokir scraping.
- **Saat ini**: scraping ditujukan ke **CNBC Indonesia** (https://www.cnbcindonesia.com/) sebagai sumber berita utama. Pastikan URL yang dimasukkan adalah dari domain CNBC Indonesia.

---

## 🔄 Cara Pakai (n8n Workflow)

### Flow Utama (Auto)

```
Scrape Berita → Classify → Enrich → Generate → Publish
     (CNBC)        (Gemini)  (Sectors.app)  (Gemini)   (Repliz)
```

1. **Scrape Berita** (`POST /api/scrape`) — Input: URL berita dari CNBC Indonesia → Output: teks berita
2. **Classify Berita** (`POST /api/classify`) — Input: teks berita → Output: `{category, ticker?, confidence}`
3. **Enrich Data** (`POST /api/enrich`) — Input: `{category, ticker?, title, content}` → Output: data fundamental dari sector.app
4. **Generate Konten** (`POST /api/generate`) — Input: berita utuh + kategori + ticker → Output: `{slides[], caption, hashtags}`
5. **Publish ke Repliz** (`POST /api/publish`) — Input: `{postId?, cloudinaryUrls, caption, platform, scheduleAt?}` → Output: `{status, scheduleId, platform, scheduleAt}`. Upload gambar ke Cloudinary terlebih dahulu (jika pakai Cloudinary).

### Manual / Form Wizard

Untuk pengguna yang ingin post manual:

1. Buka **Web Dashboard** (`/`) → **Form Wizard** / **Manual Post**
2. Pilih kategori berita (atau input berita manual)
3. Sesuaikan template konten (slide, caption, hashtag)
4. Upload gambar ke Cloudinary (jika pakai Cloudinary)
5. Pilih waktu posting (WIB) atau posting segera
6. Kirim → akan masuk ke Repliz sesuai schedule

### Telegram Bot (Opsional)

- Notifikasi status: berhasil / gagal / scheduled
- Perintah kontrol (jika diimplementasikan): cek status, trigger manual, dll
- Setup: set `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` di environment variables
---

## 🔗 Quick Links & Resources

- **Dashboard Web**: https://saham-fyp.vercel.app/
- **API Health**: https://saham-fyp.vercel.app/api/health
- **API Classify**: `POST /api/classify`
- **API Enrich**: `POST /api/enrich`
- **API Generate**: `POST /api/generate`
- **API Posts**: `GET/POST /api/posts`
- **API Publish**: `POST /api/publish`
- **API Scrape**: `POST /api/scrape`

### Referensi Eksternal

- **Google AI Studio**: https://aistudio.google.com/
- **Google Generative AI Docs**: https://ai.google.dev/
- **Repliz**: https://repliz.com/ | https://api.repliz.com/public-json
- **sector.app**: https://sectors.app/
- **Cloudinary**: https://cloudinary.com/
- **Supabase**: https://supabase.com/
- **Vercel**: https://vercel.com/
- **n8n**: https://n8n.io/
- **Telegram Bot API**: https://core.telegram.org/bots
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/

### Referensi Data Gen Z

- Katadata Databox: https://databoks.katadata.co.id/pasar/statistik/66bdf4a992e5b/gen-z-dan-milenial-mendominasi-investor-pasar-modal-di-indonesia
- Katadata Opini: https://katadata.co.id/indepth/opini/6a505cc400c1e/membangun-fondasi-investasi-gen-z-sejak-dini
- E-Journal Innobiz: https://ejournal.cyber-univ.ac.id/index.php/innobiz/article/view/147/123

### Struktur Konten

- [`docs/Struktur_Konten_6_Kategori_SahamFYP.md`](docs/Struktur_Konten_6_Kategori_SahamFYP.md)

---

## 🔧 Troubleshooting

### Common Issues

1. **`FUNCTION_INVOCATION_FAILED` di API routes**
   - Cek log di Vercel → Deployment → View Function Logs
   - Pastikan environment variables sudah di-set di Vercel dashboard
   - Pastikan semua import paths benar (tanpa ekstensi `.ts` jika pakai ES modules)

2. **`401 Unauthorized` saat publish ke Repliz**
   - Pastikan `REPLIZ_ACCESS_KEY` dan `REPLIZ_SECRET_KEY` benar
   - Pastikan `REPLIZ_ACCOUNT_ID` sesuai
   - Cek apakah akun Repliz sudah upgrade ke package yang mendukung fitur yang dipakai

3. **`403 Forbidden` atau gagal scrape berita**
   - Beberapa website mungkin memblokir scraping (CNBC Indonesia, dll)
   - Coba dari IP yang berbeda / gunakan proxy (jika perlu)
   - Pastikan URL yang dimasukkan valid & bisa diakses via browser

4. **Gambar tidak muncul di posting**
   - Pastikan URL gambar valid & bisa diakses publik
   - Jika pakai Cloudinary, pastikan gambar sudah di-upload & URL sudah benar
   - Hindari placeholder URL (misal `placehold.co`) yang mungkin tidak didukung

5. **Gemini API error / rate limit**
   - Cek quota & billing di Google AI Studio
   - Pastikan API key aktif & tidak kadaluarsa
   - Jika error model not found, pastikan model yang dipakai tersedia di region & tier yang dipakai

6. **npm ERESOLVE saat install / build**
   - Pastikan versi vite yang dipakai sesuai (`^5.4.0`)
   - Jika ada konflik, coba `npm install --force` atau update package.json sesuai yang direkomendasikan

7. **Data enrichment kosong / tidak lengkap**
   - Cek apakah ticker yang dimasukkan benar (format: kode saham tanpa huruf tambahan)
   - Cek apakah endpoint sector.app yang dipanggil sesuai dengan data yang tersedia

8. **Publish ke Repliz gagal dengan error "scheduleId not found"**
   - Cek kembali response dari `/api/publish` — biasanya error terjadi sebelum schedule created
   - Pastikan payload sesuai dengan format yang diharapkan Repliz (lihat API Reference)
### 💡 Tips

1. **Gunakan Cloudinary untuk gambar**: Lebih reliable daripada URL random atau placeholder
2. **Test dulu dengan single image**: Sebelah pakai carousel/album, test dengan 1 image dulu untuk memastikan flow berjalan
3. **Verifikasi scheduleAt timezone**: Kalau pakai form wizard/manual post, pastikan waktu dalam WIB. Jika pakai format tanpa timezone, sistem akan asumsikan WIB (ditambahkan `+07:00`)
4. **Monitoring via Telegram**: Aktifkan notifikasi Telegram (jika dipakai) untuk monitoring status publish
5. **Backup environment variables**: Jangan simpan API key di repo. Gunakan `.env.local` yang tidak di-commit ke git
6. **Update dependency secara berkala**: Vite, Gemini SDK, dan dependency lain mungkin ada update yang memperbaiki bug atau menambah fitur

---

## 🔮 Future Roadmap

Fitur yang sedang direncanakan atau dalam tahap pengembangan:

### Short-term
- [ ] **Multi-platform publish** — Selain Instagram & TikTok, support platform lain (misalnya Twitter/X, Facebook)
- [ ] **Custom template editor** — User bisa edit template konten sendiri (bukan cuma pakai 6 kategori default)
- [ ] **Analytics dashboard** — Monitoring performa posting (views, engagement, reach) dari Repliz & platform target
- [ ] **Batch schedule** — Schedule beberapa post sekaligus dalam satu workflow
- [ ] **Web Dashboard yang lebih lengkap** — Form wizard yang lebih interaktif & preview slide sebelum publish

### Medium-term
- [ ] **Multi-bahasa konten** — Generate konten dalam bahasa lain (Inggris, dll) untuk market yang lebih luas
- [ ] **Integrasi platform analisis teknikal** — Tambah data teknikal (indikator, chart pattern) untuk konten yang lebih komprehensif
- [ ] **Auto-respond komentar** — Bot yang bisa me-response komentar di posting (jika platform support)
- [ ] **Collaborative workflow** — Multi-user / team workflow (misalnya: editor, publisher, approver)
- [ ] **Custom branding / watermark** — Tambahkan watermark atau branding pada slide konten

### Long-term
- [ ] **Marketplace template** — Template konten dari kreator lain bisa digunakan
- [ ] **AI improvement** — Model yang lebih canggih untuk classification & generation (fine-tuned model, dsb)
- [ ] **Mobile app** — Aplikasi mobile untuk monitoring & kontrol
- [ ] **Subscription / premium features** — Untuk pengguna yang butuh fitur lebih lanjut

---

## 📝 Catatan Versi

### v1.0.0 (Current)

- Klasifikasi berita otomatis (6 kategori)
- Enrichment data fundamental (sector.app)
- Generate konten (slide + caption + hashtag)
- Publish ke Repliz (Instagram & TikTok)
- Manual post / form wizard dengan fleksibel waktu posting (WIB)
- Upload gambar ke Cloudinary (CDN)
- n8n workflow automation
- Telegram bot notifikasi (opsional)
- Web dashboard (React + Vite)
- Scrape berita (CNBC Indonesia)
- Dokumentasi lengkap (README.md + Struktur_Konten_6_Kategori_SahamFYP.md)
---

## 📊 Data Pendukung Latar Belakang (Gen Z Investor)

| Sumber | Data | Periode |
|--------|------|---------|
| BEI (Bursa Efek Indonesia) | 54,4% investor pasar modal adalah Gen Z | Mei 2026 |
| KSEI (Kustodian Sentral Efek Indonesia) | 55,38% investor individu berusia ≤30 tahun | Juni 2024 |
| BPS (SUPAS) | Gen Z = 24,9% dari total penduduk Indonesia | Mei 2026 |
| Katadata Opini | Aset Gen Z: Rp48,3 triliun / 3,2% dari total | Mei 2026 |

### Masalah FOMO & Tanpa Analisis

- Opini Katadata (Juli 2026): Maraknya misinformasi, ekspektasi keuntungan tidak realistis, risiko keputusan finansial yang kurang tepat
- Data aset Gen Z: Rp48,3 triliun / 3,2% dari total (Mei 2026) — menunjukkan kontribusi kecil meski jumlah investor dominan

---

## 🤝 Contributing

Pull requests adalah welcome. Untuk perubahan besar, harap buat issue dulu untuk diskusi apa yang ingin diubah.

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan edukasi dan riset.

---

## 🙏 Acknowledgement

- **Google AI Studio** — Gemini API untuk classification, enrichment, dan content generation
- **Repliz** — Platform scheduling & publishing ke Instagram/TikTok
- **sector.app** — Data fundamental saham
- **Cloudinary** — CDN & penyimpanan gambar
- **Supabase** — Database & Backend-as-a-Service
- **Vercel** — Hosting & Serverless Functions
- **n8n** — Workflow automation platform
- **Telegram** — Notifikasi & integrasi bot
- **React & Vite** — Web engine
- **CNBC Indonesia** — Sumber berita utama (scraping)

---

> **Disclaimer**: Aplikasi ini adalah tool untuk membuat konten edukasi saham.
> Semua konten yang dihasilkan bertanggung jawab kepada pembuat konten.
> Bukan merupakan ajakan untuk membeli/menjual saham tertentu (**DYOR** — Do Your Own Research).

---

## 👨💻 Author

**Nama**: Ahmad Ridlo Fadlli Robbi
**Email**: fadlirobbi@gmail.com
**Telegram**: @arfabi

### Request Update Fitur

Untuk request fitur, bug report, atau pertanyaan:
- Buat **GitHub Issue**: https://github.com/arfabi/sahamFYP/issues
- Email langsung ke fadlirobbi@gmail.com
- Kontak via Telegram: @arfabi

---

## 🔗 Link Repositori

- **GitHub**: https://github.com/arfabi/sahamFYP
- **Issues**: https://github.com/arfabi/sahamFYP/issues

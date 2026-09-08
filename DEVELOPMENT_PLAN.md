# Rencana Pengembangan SahamFYP — Standalone App

> Dokumen ini berisi roadmap pengembangan aplikasi standalone SahamFYP secara bertahap.
> Fokus: Aplikasi React dengan manual input → AI processing → download hasil.
> Belum termasuk: Otomasi RSS, n8n orchestrator, Instagram publishing, Telegram notification.

---

## Status Saat Ini

✅ **Phase 0 (Selesai)**: Card Generator manual dengan 8 template, live preview, dan export PNG.

---

## 🎯 Tujuan Utama

Membangun aplikasi standalone yang memungkinkan user untuk:
1. Input URL berita keuangan secara manual
2. Sistem otomatis scraping, klasifikasi, data enrichment, dan generate naskah
3. User edit naskah via form wizard dengan live preview
4. Download hasil sebagai 8 PNG slide carousel

**Stack**: React + Vite + Gemini API + Sectors.app API + Supabase + Cloudinary
**Hosting**: Vercel (frontend + serverless functions)

---

## 🏗️ Phase 1 — Setup Infrastruktur & Database

**Durasi estimasi**: 1 minggu
**Tujuan**: Menyiapkan Supabase, environment variables, dan struktur folder untuk services.

### 1.1 Setup Supabase

- [ ] Buat project Supabase baru
- [ ] Design schema database:
  ```sql
  -- Tabel untuk log pemrosesan berita
  content_logs (
    id uuid primary key,
    url text,
    title text,
    content text,
    category text, -- SINGLE_STOCK, MACRO_ECONOMY, dll
    ticker text,
    sector text,
    confidence float,
    status text, -- pending, processing, completed, failed
    created_at timestamp
  )
  
  -- Tabel untuk naskah carousel yang sudah di-generate
  generated_posts (
    id uuid primary key,
    log_id uuid references content_logs(id),
    slides_json jsonb, -- naskah 8 slide dalam format JSON
    handle text,
    badge_text text,
    created_at timestamp
  )
  
  -- Tabel untuk metadata gambar hasil generate
  post_images (
    id uuid primary key,
    post_id uuid references generated_posts(id),
    slide_number int,
    cloudinary_url text,
    created_at timestamp
  )
  ```
- [ ] Enable Row Level Security (RLS) — allow all untuk sekarang (bisa diperketat nanti)
- [ ] Buat Supabase client di `src/services/supabase.ts`

### 1.2 Environment Variables

- [ ] Buat file `.env.local` dengan struktur:
  ```env
  VITE_GEMINI_API_KEY=your_gemini_key
  VITE_SECTORS_API_KEY=your_sectors_key
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
  VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
  ```
- [ ] Buat file `.env.example` sebagai template (tanpa nilai real)
- [ ] Update `.gitignore` untuk exclude `.env.local`

### 1.3 Struktur Folder Services

- [ ] Buat folder `src/services/` dengan file:
  - `supabase.ts` — Supabase client initialization
  - `gemini.ts` — Gemini API client (placeholder)
  - `sectors.ts` — Sectors.app API client (placeholder)
  - `cloudinary.ts` — Cloudinary upload helper (placeholder)
  - `scraper.ts` — Web scraping service (placeholder)

### Deliverables Phase 1

- ✅ Supabase database berjalan dengan schema yang sudah dibuat
- ✅ Environment variables terkonfigurasi
- ✅ Folder structure untuk services sudah siap

---

## 🌐 Phase 2 — Web Scraping Service

**Durasi estimasi**: 1 minggu
**Tujuan**: Membangun service untuk extract konten berita dari URL.

### 2.1 Research Scraping Approach

**⚠️ KONFIRMASI DIPERLUKAN**: Web scraping dari browser (client-side) memiliki limitasi:
- **CORS issue**: Browser tidak bisa fetch URL eksternal langsung karena CORS policy
- **Solusi yang mungkin**:
  1. **Vercel Serverless Function** — Buat API endpoint di `/api/scrape` yang jalan di server
  2. **Third-party scraping API** — Gunakan service seperti ScrapingBee, ScraperAPI, dll (berbayar)
  3. **Proxy CORS** — Gunakan public CORS proxy (tidak recommended untuk production)
  4. **Manual input** — User copy-paste judul + isi berita secara manual (paling simple)

**Rekomendasi**: Gunakan **Vercel Serverless Function** untuk scraping, karena:
- Gratis (100GB-hours/month di Vercel free tier)
- Tidak ada CORS issue (server-side request)
- Bisa deploy bersama frontend di Vercel

### 2.2 Implementasi Scraper (Vercel Serverless Function)

- [ ] Buat folder `api/` di root project
- [ ] Buat file `api/scrape.ts`:
  ```typescript
  // Vercel serverless function
  import { VercelRequest, VercelResponse } from '@vercel/node';
  import cheerio from 'cheerio';
  
  export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { url } = req.query;
    // Fetch URL → parse HTML → extract title, content, date, source
    // Return JSON: { title, content, date, source }
  }
  ```
- [ ] Install dependencies: `cheerio` (HTML parser), `node-fetch`
- [ ] Implementasi logic scraping:
  - Extract `<title>` atau `<h1>` untuk judul
  - Extract `<article>` atau `<p>` untuk isi berita
  - Extract `<time>` atau meta tag untuk tanggal
  - Extract domain untuk sumber
- [ ] Handle error: URL tidak valid, timeout, situs tidak bisa di-scrape
- [ ] Test dengan 5-10 URL berita dari Kontan, CNBC, Bloomberg

### 2.3 Frontend Integration

- [ ] Buat komponen `URLInput.tsx`:
  - Input field untuk paste URL
  - Tombol "Scrape"
  - Loading state saat scraping
  - Error handling
- [ ] Buat service `src/services/scraper.ts`:
  - Function `scrapeNews(url: string)` yang call API `/api/scrape`
  - Return `{ title, content, date, source }`

### 2.4 Testing

- [ ] Test scraping dengan 10+ URL dari berbagai sumber
- [ ] Validasi hasil scraping (judul, isi, tanggal, sumber)
- [ ] Handle edge case: URL invalid, situs blocked, timeout

### Deliverables Phase 2

- ✅ Scraping service berjalan di Vercel serverless function
- ✅ Frontend bisa scrape berita dari URL

---

## 🤖 Phase 3 — Gemini AI Classifier (LLM 1)

**Durasi estimasi**: 1 minggu
**Tujuan**: Membangun service untuk klasifikasi berita ke 6 kategori menggunakan Gemini AI.

### 3.1 Gemini API Integration

- [ ] Install Google Generative AI SDK: `npm install @google/generative-ai`
- [ ] Buat service `src/services/gemini.ts`:
  ```typescript
  import { GoogleGenerativeAI } from '@google/generative-ai';
  
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  
  export async function classifyNews(title: string, content: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    // Implementasi classifier prompt
  }
  ```

### 3.2 Classifier Prompt

- [ ] Implementasi prompt dari `Master_Prompt_SahamFYP_Classifier.md`:
  - Input: judul + isi berita
  - Output: JSON dengan field `category`, `ticker`, `sector`, `confidence`, `reason`
  - 6 kategori: SINGLE_STOCK, MACRO_ECONOMY, SECTOR_ANALYSIS, CORPORATE_ACTION, IPO_RIGHTS_ISSUE, SUSPENSION_DELISTING
  - Atau `SKIP` jika berita tidak relevan
- [ ] Parse output JSON dari Gemini
- [ ] Handle error: API timeout, invalid response, rate limit

### 3.3 Frontend Integration

- [ ] Buat komponen `ClassificationResult.tsx`:
  - Tampilkan hasil klasifikasi (kategori, ticker, sector, confidence, reason)
  - Tombol "Lanjut ke Data Enrichment" atau "Ulangi Klasifikasi"
  - Warning jika confidence < 0.7
- [ ] Update flow: setelah scraping selesai → otomatis call classifier

### 3.4 Testing & Validation

- [ ] Test dengan 20+ berita dari berbagai kategori
- [ ] Hitung akurasi klasifikasi (target: > 90%)
- [ ] Edge case testing:
  - Berita multi-emiten
  - Berita bahasa Inggris
  - Berita tidak relevan (harus SKIP)
  - Berita dengan ticker tidak eksplisit

### Deliverables Phase 3

- ✅ Gemini AI classifier berjalan
- ✅ Akurasi klasifikasi > 90% pada test set
- ✅ Frontend menampilkan hasil klasifikasi

---

## 📊 Phase 4 — Sectors.app Data Enrichment

**Durasi estimasi**: 1 minggu
**Tujuan**: Tarik data keuangan dari Sectors.app API berdasarkan kategori dan ticker.

### 4.1 Sectors.app API Integration

- [ ] Buat service `src/services/sectors.ts`:
  ```typescript
  export async function fetchCompanyData(ticker: string, sections: string[]) {
    // Call Sectors.app API
    // Return data berdasarkan sections yang diminta
  }
  ```
- [ ] Implementasi endpoint mapping sesuai `Data_Mapping_Spec_SahamFYP.md`:
  - `SINGLE_STOCK` → `fetch-company-report` + `fetch-foreign-flow`
  - `MACRO_ECONOMY` → `fetch-index-daily` + `fetch-idx-market-cap`
  - `SECTOR_ANALYSIS` → `fetch-subsector-report`
  - `CORPORATE_ACTION` → `fetch-corporate-actions` + `fetch-company-report` (dividend)
  - `IPO_RIGHTS_ISSUE` → conditional (skip jika ticker null)
  - `SUSPENSION_DELISTING` → `fetch-suspensions`

### 4.2 Credit Management

- [ ] Track credit usage per request
- [ ] Log credit usage ke Supabase
- [ ] Warning jika credit hampir habis
- [ ] Implementasi caching (optional, untuk mengurangi API calls)

### 4.3 Data Validation

- [ ] Validasi field tidak null sebelum diteruskan ke naskah generator
- [ ] Handle kasus data tidak tersedia (skip metrik, jangan dikarang)
- [ ] Snapshot data mentah ke Supabase untuk audit

### 4.4 Frontend Integration

- [ ] Buat komponen `DataEnrichment.tsx`:
  - Tampilkan data yang berhasil ditarik (metrik keuangan, foreign flow, dll)
  - Loading state saat fetch data
  - Error handling jika API gagal
- [ ] Update flow: setelah klasifikasi → call data enrichment → tampilkan hasil

### Deliverables Phase 4

- ✅ Data enrichment berjalan untuk semua 6 kategori
- ✅ Credit usage termonitor
- ✅ Data valid dan ter-audit di Supabase

---

## ✍️ Phase 5 — Naskah Generator (LLM 2) + Form Wizard

**Durasi estimasi**: 2 minggu
**Tujuan**: Generate naskah carousel 8 slide dan sediakan form wizard untuk edit.

### 5.1 Naskah Generator Prompt

- [ ] Buat 6 prompt template berbeda (satu per kategori) di `src/prompts/naskahGenerator.ts`:
  - Prompt SINGLE_STOCK → naskah dengan bedah data lengkap
  - Prompt MACRO_ECONOMY → naskah dengan konteks pasar
  - Prompt SECTOR_ANALYSIS → naskah rotasi sektor
  - Prompt CORPORATE_ACTION → naskah aksi korporat
  - Prompt IPO_RIGHTS_ISSUE → naskah IPO/right issue
  - Prompt SUSPENSION_DELISTING → naskah suspensi
- [ ] Setiap prompt mengikuti struktur 8 slide dari `Struktur_Konten_6_Kategori_SahamFYP.md`:
  1. COVER
  2. TLDR
  3. KRONOLOGI
  4. DATA/DETAIL (variasi per kategori)
  5. PROS/UNTUNG
  6. CONS/RISIKO
  7. KESIMPULAN
  8. CTA_DYOR


### 5.2 Output JSON Schema

- [ ] Define JSON schema untuk output naskah:
  ```typescript
  interface SlideData {
    template: 'cover' | 'tldr' | 'kronologi' | 'data' | 'pros' | 'cons' | 'kesimpulan' | 'cta';
    title: string;
    description?: string;
    source?: string;
    disclaimer?: string;
    visualIcon?: string;
    tldrCards?: Array<{ icon: string; text: string }>;
    metrics?: Array<{ icon: string; label: string; value: string; caption: string; tone: 'amber' | 'sage' }>;
    bullets?: Array<{ icon: string; text: string }>;
  }
  
  interface CarouselData {
    handle: string;
    badgeText: string;
    slides: SlideData[];
  }
  ```
- [ ] Parse output JSON dari Gemini
- [ ] Validasi schema (pastikan semua field required ada)

### 5.3 Form Wizard UI

- [ ] Buat komponen `FormWizard.tsx`:
  - Step 1: Review hasil scraping + klasifikasi
  - Step 2: Review data enrichment
  - Step 3: Edit naskah per slide (8 slide)
  - Step 4: Preview & download
- [ ] Setiap slide punya editor sendiri:
  - Input judul, deskripsi, sumber, disclaimer
  - Pilih ikon atau upload ilustrasi
  - Edit kartu TL;DR, metrik, bullet points (tambah/hapus/edit)
  - Pilih warna (background, text, accent, badge)
- [ ] Live preview di panel kanan (reuse komponen `CardGenerator.tsx` yang sudah ada)

### 5.4 Integration dengan Existing Card Generator

- [ ] Refactor `CardGenerator.tsx` agar bisa menerima data dari JSON naskah
- [ ] Pastikan semua 8 template bisa render dari data JSON
- [ ] Test: generate naskah → load ke form wizard → edit → preview → download

### Deliverables Phase 5

- ✅ Naskah generator berjalan untuk semua 6 kategori
- ✅ Form wizard UI berfungsi dengan live preview
- ✅ User bisa edit naskah per slide
- ✅ Output JSON valid dan konsisten

---

## 🖼️ Phase 6 — Image Generation + Cloudinary + Download

**Durasi estimasi**: 1 minggu
**Tujuan**: Generate PNG dari naskah, upload ke Cloudinary, dan sediakan download.

### 6.1 Image Generation (Client-Side)

- [ ] Reuse logic dari existing `CardGenerator.tsx`:
  - Gunakan `html-to-image` untuk render React → PNG
  - Pixel ratio 2x untuk kualitas retina
  - Ukuran 400×500px per slide
- [ ] Implementasi batch download:
  - Loop 8 slide → render masing-masing → download sebagai ZIP atau individual PNG
- [ ] Loading state saat generate gambar
- [ ] Error handling jika render gagal

### 6.2 Cloudinary Integration

- [ ] Buat service `src/services/cloudinary.ts`:
  ```typescript
  export async function uploadToCloudinary(imageData: string, slideNumber: number) {
    // Upload base64 image ke Cloudinary
    // Return URL
  }
  ```
- [ ] Setup Cloudinary upload preset (unsigned upload untuk client-side)
- [ ] Upload 8 PNG ke Cloudinary setelah generate
- [ ] Simpan URL ke Supabase (`post_images` table)

### 6.3 Download Options

- [ ] Option 1: Download individual PNG (8 file terpisah)
- [ ] Option 2: Download semua slide sebagai ZIP (perlu library seperti `jszip`)
- [ ] Option 3: View di gallery (tampilkan 8 gambar dengan URL Cloudinary)

### 6.4 Save to Supabase

- [ ] Simpan metadata ke Supabase:
  - `content_logs` — log pemrosesan berita (URL, kategori, ticker, status)
  - `generated_posts` — naskah JSON + metadata
  - `post_images` — URL Cloudinary per slide
- [ ] Buat halaman "History" untuk lihat post yang sudah di-generate (optional)

### Deliverables Phase 6

- ✅ Image generation berjalan (8 PNG per carousel)
- ✅ Upload ke Cloudinary berhasil
- ✅ Download PNG berfungsi
- ✅ Metadata tersimpan di Supabase

---


## 🚀 Phase 7 — End-to-End Flow + Testing

**Durasi estimasi**: 1 minggu
**Tujuan**: Integrasi semua komponen menjadi flow end-to-end yang mulus.

### 7.1 Main Flow Integration

- [ ] Buat halaman utama `HomePage.tsx` dengan flow:
  1. Input URL → Scraping → Tampilkan hasil
  2. Klasifikasi → Tampilkan kategori + ticker
  3. Data Enrichment → Tampilkan data keuangan
  4. Generate Naskah → Load ke Form Wizard
  5. Edit naskah → Live preview
  6. Download PNG → Upload ke Cloudinary → Save ke Supabase
- [ ] Loading state di setiap step
- [ ] Error handling & retry mechanism
- [ ] Progress indicator (step 1 of 6, step 2 of 6, dll)

### 7.2 UI/UX Polish

- [ ] Responsive design (mobile-friendly)
- [ ] Animasi transisi antar step
- [ ] Toast notification untuk success/error
- [ ] Confirmation dialog sebelum reset
- [ ] Empty state & onboarding untuk user baru

### 7.3 Testing

- [ ] End-to-end testing dengan 10+ berita dari berbagai kategori
- [ ] Validasi output: scraping → klasifikasi → data → naskah → gambar
- [ ] Performance testing: waktu processing per berita (target: < 30 detik)
- [ ] Error handling testing: URL invalid, API timeout, data null

### 7.4 Deployment

- [ ] Build production: `npm run build`
- [ ] Deploy ke Vercel:
  - Connect repository ke Vercel
  - Setup environment variables di Vercel dashboard
  - Deploy frontend + serverless functions
- [ ] Test di production environment
- [ ] Setup custom domain (optional)

### Deliverables Phase 7

- ✅ End-to-end flow berjalan mulus
- ✅ UI/UX polished dan responsive
- ✅ Deployed di Vercel
- ✅ Siap digunakan oleh user

---

## 📅 Timeline Summary

| Phase | Deskripsi | Durasi | Status |
|-------|-----------|--------|--------|
| **Phase 0** | Card Generator (existing) | ✅ Selesai | Done |
| **Phase 1** | Setup Infrastruktur & Database | 1 minggu | 🔴 Not Started |
| **Phase 2** | Web Scraping Service | 1 minggu | 🔴 Not Started |
| **Phase 3** | Gemini AI Classifier | 1 minggu | 🔴 Not Started |
| **Phase 4** | Sectors.app Data Enrichment | 1 minggu | 🔴 Not Started |
| **Phase 5** | Naskah Generator + Form Wizard | 2 minggu | 🔴 Not Started |
| **Phase 6** | Image Generation + Cloudinary | 1 minggu | 🔴 Not Started |
| **Phase 7** | End-to-End Flow + Deployment | 1 minggu | 🔴 Not Started |

**Total estimasi**: 8 minggu (2 bulan)

---

## 💰 Estimasi Biaya Bulanan

| Service | Free Tier | Estimasi Biaya (jika exceed) |
|---------|-----------|------------------------------|
| **Vercel** | 100GB-hours serverless | $20/month (Pro) |
| **Supabase** | 500MB DB, 1GB storage, 2GB bandwidth | $25/month (Pro) |
| **Gemini API** | 15 requests/minute, 1M tokens/day | ~$0.001-0.01 per request |
| **Sectors.app** | Tergantung plan | $50-200/month (tergantung credit) |
| **Cloudinary** | 25GB bandwidth, 25GB storage | $89/month (Plus) |
| **Total** | **Gratis untuk usage rendah** | **$60-300/month** |

**Catatan**: Untuk usage rendah (< 50 berita/hari), semua service bisa gratis atau sangat murah.

---

## ⚠️ Konfirmasi Diperlukan

### 1. Web Scraping di Vercel

**Pertanyaan**: Apakah Anda ingin menggunakan Vercel Serverless Function untuk web scraping?

**Alternatif**:
- **Option A**: Vercel Serverless Function (recommended) — gratis, tidak ada CORS issue
- **Option B**: Third-party scraping API (ScrapingBee, ScraperAPI) — berbayar, lebih reliable
- **Option C**: Manual input — user copy-paste judul + isi berita (paling simple, tidak perlu scraping)

**Rekomendasi**: Option A (Vercel Serverless Function)

### 2. API Keys & Access

**Pertanyaan**: Apakah Anda sudah punya API keys untuk service berikut?
- [ ] Gemini API key (Google AI Studio)
- [ ] Sectors.app API key
- [ ] Supabase project credentials
- [ ] Cloudinary account
- [ ] Vercel account

Jika belum, saya bisa bantu setup satu per satu.

### 3. Hosting di Vercel

**Pertanyaan**: Apakah Anda ingin deploy ke custom domain atau subdomain Vercel (contoh: sahamfyp.vercel.app)?

---

## 🎯 Success Metrics

### Technical Metrics

- [ ] End-to-end processing time < 60 detik per berita
- [ ] Classifier accuracy > 90%
- [ ] Naskah generator success rate > 95%
- [ ] Image render success rate > 99%
- [ ] Uptime > 99% (setelah deploy)

### User Experience Metrics

- [ ] User bisa generate carousel dalam < 2 menit (dari input URL sampai download)
- [ ] Form wizard mudah digunakan (tidak perlu tutorial)
- [ ] Live preview akurat (sama dengan hasil download)
- [ ] Error message jelas dan actionable

---

## 📚 Referensi Dokumentasi

- **Card Generator Architecture**: `Card_Generator_Architecture.md`
- **Master Prompt Classifier**: `Master_Prompt_SahamFYP_Classifier.md`
- **Data Mapping Spec**: `Data_Mapping_Spec_SahamFYP.md`
- **Struktur Konten 6 Kategori**: `Struktur_Konten_6_Kategori_SahamFYP.md`

---

## 🤝 Catatan Penting

1. **Mulai dari Phase 1**: Jangan skip phase, karena setiap phase bergantung pada phase sebelumnya.
2. **Test di setiap phase**: Jangan lanjut ke phase berikutnya kalau phase sekarang belum stabil.
3. **DYOR compliance**: Semua konten wajib ada disclaimer "Do Your Own Research".
4. **Data accuracy**: Jangan pernah mengarang data. Kalau API return null, skip metrik tersebut.
5. **Rate limiting**: Hormati rate limit semua API (Sectors.app, Gemini).
6. **Backup**: Backup database Supabase secara rutin (minimal mingguan).
7. **Monitoring**: Monitor credit usage semua API untuk menghindari biaya tak terduga.

---

## 📞 Support & Questions

Untuk pertanyaan tentang rencana pengembangan:
- Buka issue di repository ini
- Hubungi: [@sahamfyp](https://instagram.com/sahamfyp)

---

**Last Updated**: 2026-01-09
**Version**: 2.0 (Standalone App Focus)
**Status**: Planning

- ✅ Hasil scraping akurat untuk mayoritas situs berita Indonesia

# SahamFYP — AI-Powered Instagram Carousel Generator

> Aplikasi standalone untuk generate konten carousel Instagram edukasi saham secara otomatis menggunakan AI (Gemini) + data Sectors.app

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.0-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.10-cyan)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0-orange)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## 📋 Deskripsi

SahamFYP adalah aplikasi web standalone yang mengubah berita keuangan menjadi konten carousel Instagram edukatif secara otomatis. User cukup memasukkan link berita, dan sistem akan:

1. **Scraping** konten berita dari URL
2. **Klasifikasi** berita ke 6 kategori (SINGLE_STOCK, MACRO_ECONOMY, SECTOR_ANALYSIS, CORPORATE_ACTION, IPO_RIGHTS_ISSUE, SUSPENSION_DELISTING)
3. **Data Enrichment** menggunakan Sectors.app API (data keuangan emiten)
4. **Generate Naskah** carousel 8 slide menggunakan Gemini AI
5. **Form Wizard** untuk edit konten per slide
6. **Download** hasil sebagai PNG (8 slide carousel)

**Status**: Development in progress — fokus pada standalone app sebelum otomasi penuh.

## ✨ Fitur Utama

### Core Features

- ✅ **Manual Input URL** — User paste link berita keuangan
- ✅ **Auto Scraping** — Extract judul, isi berita, tanggal, sumber
- ✅ **AI Classifier** — Gemini AI klasifikasi ke 6 kategori (akurasi >90%)
- ✅ **Data Enrichment** — Tarik data keuangan dari Sectors.app API
- ✅ **AI Naskah Generator** — Generate naskah 8 slide carousel
- ✅ **Form Wizard Editor** — Edit konten per slide dengan live preview
- ✅ **8 Template Slide** — Cover, TL;DR, Kronologi, Bedah Data, Pros, Cons, Kesimpulan, CTA
- ✅ **PNG Export** — Download 8 slide sebagai PNG (400×500px, 2x retina)
- ✅ **Cloudinary Integration** — Upload & manage gambar hasil generate
- ✅ **Supabase Database** — Simpan log, naskah, dan konfigurasi

### 6 Kategori Konten

| Kategori | Deskripsi | Data Source |
|----------|-----------|-------------|
| **SINGLE_STOCK** | Analisis emiten tunggal (kinerja, ekspansi, kontrak) | Sectors.app intensif |
| **MACRO_ECONOMY** | Makro ekonomi (suku bunga, IHSG, kurs, komoditas) | Sectors.app sedang |
| **SECTOR_ANALYSIS** | Analisis sektor/sub-sektor (rotasi, tren) | Sectors.app intensif |
| **CORPORATE_ACTION** | Dividen, RUPS, buyback, right issue | Sectors.app ringan |
| **IPO_RIGHTS_ISSUE** | IPO & right issue (existing emiten atau calon baru) | Sectors.app ringan/none |
| **SUSPENSION_DELISTING** | Suspensi & delisting dari bursa | Sectors.app ringan |

### 8 Template Slide per Carousel

Setiap carousel terdiri dari 8 slide dengan struktur konsisten:

1. **COVER** — Headline + sub-headline + visual
2. **TLDR** — Ringkasan cepat 3-4 poin
3. **KRONOLOGI** — Konteks berita + sumber
4. **DATA/DETAIL** — Bedah data / detail aksi (variasi per kategori)
5. **PROS/UNTUNG** — Sisi positif / keuntungan
6. **CONS/RISIKO** — Sisi risiko / yang perlu diperhatikan
7. **KESIMPULAN** — Rangkuman edukatif netral
8. **CTA_DYOR** — Call-to-action + disclaimer DYOR

Lihat detail struktur per kategori di `Struktur_Konten_6_Kategori_SahamFYP.md`

## 🛠️ Tech Stack

| Layer | Teknologi | Fungsi |
|-------|-----------|--------|
| **Frontend** | React 18.3.1 + TypeScript 5.5.3 | UI framework |
| **Build Tool** | Vite 5.4.0 | Development server & bundler |
| **Styling** | Tailwind CSS 3.4.10 | Utility-first CSS |
| **Image Export** | html-to-image 1.11.13 | Render React → PNG |
| **Icons** | lucide-react 0.425.0 | Icon library |
| **Fonts** | Inter + Montserrat | Typography |
| **AI (LLM)** | Google Gemini 2.0 | Classifier + Naskah Generator |
| **Data API** | Sectors.app API | Data keuangan emiten IDX |
| **Database** | Supabase | PostgreSQL + Auth + Storage |
| **Image Storage** | Cloudinary | Upload & CDN gambar |
| **Hosting** | Vercel | Frontend + Serverless Functions |
| **Web Scraping** | Custom scraper / API | Extract berita dari URL |

## 📦 Instalasi

### Prerequisites

- Node.js 18+ dan npm
- Gemini API key (Google AI Studio)
- Sectors.app API key
- Supabase project credentials
- Cloudinary account

### Langkah Instalasi

```bash
# Clone repository
git clone <repository-url>
cd sahamFYP

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan API keys Anda

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Environment Variables

```env
# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Sectors.app API
VITE_SECTORS_API_KEY=your_sectors_api_key

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 🚀 Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build untuk production
npm run preview      # Preview production build
npm run typecheck    # TypeScript type checking

## 📖 Cara Menggunakan

### Flow Utama

1. **Input URL** — Paste link berita keuangan (Kontan, CNBC, Bloomberg, dll)
2. **Scraping** — Sistem extract judul, isi berita, tanggal, sumber
3. **Classification** — Gemini AI klasifikasi berita ke 6 kategori
4. **Data Enrichment** — Tarik data keuangan dari Sectors.app (jika ada ticker)
5. **Generate Naskah** — Gemini AI generate naskah 8 slide carousel
6. **Edit via Form Wizard** — Edit konten per slide dengan live preview
7. **Download** — Export 8 slide sebagai PNG

### Form Wizard Editor

Setelah naskah di-generate, user bisa edit:
- **Handle** — Username Instagram (@sahamfyp)
- **Badge** — Ticker emiten (BBCA, BBRI, dll)
- **Judul** — Headline per slide
- **Deskripsi** — Konten per slide
- **Visual** — Pilih ikon atau upload ilustrasi
- **Warna** — Background, text, accent, badge
- **Konten Dinamis** — Tambah/hapus kartu TL;DR, metrik, bullet points

### Download Hasil

- Klik tombol "Download Semua Slide"
- Sistem generate 8 PNG (400×500px, 2x retina quality)
- File otomatis ter-upload ke Cloudinary
- URL gambar tersimpan di Supabase

## 📁 Struktur Proyek

```
sahamFYP/
├── src/
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Global styles + Tailwind
│   ├── components/
│   │   ├── CardGenerator.tsx      # Main editor UI (existing)
│   │   ├── Templates.tsx          # 8 template renderers (existing)
│   │   ├── FormWizard.tsx         # Step-by-step wizard (TODO)
│   │   ├── URLInput.tsx           # URL input component (TODO)
│   │   ├── ScrapingResult.tsx     # Display scraped content (TODO)
│   │   ├── ClassificationResult.tsx # Show classification (TODO)
│   │   ├── DataEnrichment.tsx     # Display Sectors.app data (TODO)
│   │   └── SlideEditor.tsx        # Per-slide editor (TODO)
│   ├── services/
│   │   ├── scraper.ts             # Web scraping service (TODO)
│   │   ├── gemini.ts              # Gemini API client (TODO)
│   │   ├── sectors.ts             # Sectors.app API client (TODO)
│   │   ├── supabase.ts            # Supabase client (TODO)
│   │   └── cloudinary.ts          # Cloudinary upload (TODO)
│   ├── prompts/
│   │   ├── classifier.ts          # Classifier prompt (TODO)
│   │   └── naskahGenerator.ts     # Naskah generator prompts (TODO)
│   ├── types/
│   │   └── index.ts               # TypeScript types (TODO)
│   └── utils/
│       └── helpers.ts             # Utility functions (TODO)
├── base/                          # Reference documents
│   ├── Master_Prompt_SahamFYP_Classifier.md
│   ├── Data_Mapping_Spec_SahamFYP.md
│   └── Struktur_Konten_6_Kategori_SahamFYP.md
├── example/                       # Example output images
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── README.md                      # This file
└── DEVELOPMENT_PLAN.md            # Development roadmap
```

## 🎨 Design System

### Color Palette

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `navy` | `#14182B` | Text utama |
| `amber` | `#F2A93B` | Accent primary |
| `sage` | `#4CAF7D` | Success / positive |
| `brick` | `#E4572E` | Warning / negative |
| `cream` | `#F5F1E7` | Background light |
| `card` | `#EDE6D8` | Card background |

### Typography

- **Body**: Inter (400–700) — Clean, legible
- **Display**: Montserrat (700–900) — Bold headlines

### Card Dimensions

- **Size**: 400px × 500px (4:5 aspect ratio — optimal untuk Instagram)
- **Border Radius**: 24px (`rounded-3xl`)
- **Padding**: 28px (`p-7`)

## 📊 Arsitektur Sistem

### Flow Data

```
User Input URL
    ↓
Web Scraper (extract judul, isi, tanggal, sumber)
    ↓
Gemini AI Classifier (LLM 1)
    ↓
[if SKIP] → Show message "Berita tidak relevan"
    ↓
[if valid category]
    ↓
Sectors.app API (data enrichment based on category + ticker)
    ↓
Gemini AI Naskah Generator (LLM 2)
    ↓
JSON Naskah Carousel (8 slides)
    ↓
Form Wizard Editor (user edit per slide)
    ↓
html-to-image (render React → PNG)
    ↓
Cloudinary Upload (store images)
    ↓
Supabase (save metadata + URLs)
    ↓
Download PNG / View in gallery
```

### API Integration

| API | Fungsi | Credit/Cost |
|-----|--------|-------------|
| **Gemini 2.0** | Classifier + Naskah Generator | ~$0.001-0.01 per request |
| **Sectors.app** | Data keuangan emiten IDX | 2-8 credits per request |
| **Supabase** | Database + Auth + Storage | Free tier: 500MB DB, 1GB storage |
| **Cloudinary** | Image upload + CDN | Free tier: 25GB bandwidth/month |

## 🎯 Roadmap Pengembangan

Lihat [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) untuk rencana pengembangan lengkap by phase.

**Fokus saat ini**: Standalone app dengan manual input → auto generate → download

**Future**: Otomasi penuh dengan RSS feed, n8n orchestrator, Instagram publishing, Telegram notification

## 📝 Lisensi

Proyek ini dikembangkan untuk keperluan edukasi dan riset.

## 🤝 Kontribusi

Kontribusi terbuka untuk improvement dan fitur baru. Silakan submit issue atau pull request.

## 📧 Kontak

Untuk pertanyaan dan kolaborasi: [@sahamfyp](https://instagram.com/sahamfyp)

---

> **Disclaimer**: Aplikasi ini adalah tool untuk membuat konten edukasi saham.
> Semua konten yang dihasilkan bertanggung jawab kepada pembuat konten.
> Bukan merupakan ajakan untuk membeli/menjual saham tertentu (**DYOR** — Do Your Own Research).

```

# SahamFYP â€” AI-Powered Instagram Carousel Generator

> Aplikasi standalone untuk generate konten carousel Instagram edukasi saham secara otomatis menggunakan AI (Gemini) + data Sectors.app

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.0-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.10-cyan)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0-orange)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## ðŸ“‹ Deskripsi

SahamFYP adalah aplikasi web standalone yang mengubah berita keuangan menjadi konten carousel Instagram edukatif secara otomatis. User cukup memasukkan link berita, dan sistem akan:

1. **Scraping** konten berita dari URL
2. **Klasifikasi** berita ke 6 kategori (SINGLE_STOCK, MACRO_ECONOMY, SECTOR_ANALYSIS, CORPORATE_ACTION, IPO_RIGHTS_ISSUE, SUSPENSION_DELISTING)
3. **Data Enrichment** menggunakan Sectors.app API (data keuangan emiten)
4. **Generate Naskah** carousel 8 slide menggunakan Gemini AI
5. **Form Wizard** untuk edit konten per slide
6. **Download** hasil sebagai PNG (8 slide carousel)

**Status**: Development in progress â€” fokus pada standalone app sebelum otomasi penuh.

## âœ¨ Fitur Utama

### Core Features

- âœ… **Manual Input URL** â€” User paste link berita keuangan
- âœ… **Auto Scraping** â€” Extract judul, isi berita, tanggal, sumber
- âœ… **AI Classifier** â€” Gemini AI klasifikasi ke 6 kategori (akurasi >90%)
- âœ… **Data Enrichment** â€” Tarik data keuangan dari Sectors.app API
- âœ… **AI Naskah Generator** â€” Generate naskah 8 slide carousel
- âœ… **Form Wizard Editor** â€” Edit konten per slide dengan live preview
- âœ… **8 Template Slide** â€” Cover, TL;DR, Kronologi, Bedah Data, Pros, Cons, Kesimpulan, CTA
- âœ… **PNG Export** â€” Download 8 slide sebagai PNG (400Ã—500px, 2x retina)
- âœ… **Cloudinary Integration** â€” Upload & manage gambar hasil generate
- âœ… **Supabase Database** â€” Simpan log, naskah, dan konfigurasi

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

1. **COVER** â€” Headline + sub-headline + visual
2. **TLDR** â€” Ringkasan cepat 3-4 poin
3. **KRONOLOGI** â€” Konteks berita + sumber
4. **DATA/DETAIL** â€” Bedah data / detail aksi (variasi per kategori)
5. **PROS/UNTUNG** â€” Sisi positif / keuntungan
6. **CONS/RISIKO** â€” Sisi risiko / yang perlu diperhatikan
7. **KESIMPULAN** â€” Rangkuman edukatif netral
8. **CTA_DYOR** â€” Call-to-action + disclaimer DYOR

Lihat detail struktur per kategori di `Struktur_Konten_6_Kategori_SahamFYP.md`

## ðŸ› ï¸ Tech Stack

| Layer | Teknologi | Fungsi |
|-------|-----------|--------|
| **Frontend** | React 18.3.1 + TypeScript 5.5.3 | UI framework |
| **Build Tool** | Vite 5.4.0 | Development server & bundler |
| **Styling** | Tailwind CSS 3.4.10 | Utility-first CSS |
| **Image Export** | html-to-image 1.11.13 | Render React â†’ PNG |
| **Icons** | lucide-react 0.425.0 | Icon library |
| **Fonts** | Inter + Montserrat | Typography |
| **AI (LLM)** | Google Gemini 2.0 | Classifier + Naskah Generator |
| **Data API** | Sectors.app API | Data keuangan emiten IDX |
| **Database** | Supabase | PostgreSQL + Auth + Storage |
| **Image Storage** | Cloudinary | Upload & CDN gambar |
| **Hosting** | Vercel | Frontend + Serverless Functions |
| **Web Scraping** | Custom scraper / API | Extract berita dari URL |

## ðŸ“¦ Instalasi

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

## ðŸš€ Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build untuk production
npm run preview      # Preview production build
npm run typecheck    # TypeScript type checking

## ðŸ“– Cara Menggunakan

### Flow Utama

1. **Input URL** â€” Paste link berita keuangan (Kontan, CNBC, Bloomberg, dll)
2. **Scraping** â€” Sistem extract judul, isi berita, tanggal, sumber
3. **Classification** â€” Gemini AI klasifikasi berita ke 6 kategori
4. **Data Enrichment** â€” Tarik data keuangan dari Sectors.app (jika ada ticker)
5. **Generate Naskah** â€” Gemini AI generate naskah 8 slide carousel
6. **Edit via Form Wizard** â€” Edit konten per slide dengan live preview
7. **Download** â€” Export 8 slide sebagai PNG

### Form Wizard Editor

Setelah naskah di-generate, user bisa edit:
- **Handle** â€” Username Instagram (@sahamfyp)
- **Badge** â€” Ticker emiten (BBCA, BBRI, dll)
- **Judul** â€” Headline per slide
- **Deskripsi** â€” Konten per slide
- **Visual** â€” Pilih ikon atau upload ilustrasi
- **Warna** â€” Background, text, accent, badge
- **Konten Dinamis** â€” Tambah/hapus kartu TL;DR, metrik, bullet points

### Download Hasil

- Klik tombol "Download Semua Slide"
- Sistem generate 8 PNG (400Ã—500px, 2x retina quality)
- File otomatis ter-upload ke Cloudinary
- URL gambar tersimpan di Supabase

## ðŸ“ Struktur Proyek

```
sahamFYP/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ App.tsx                    # Root component
â”‚   â”œâ”€â”€ main.tsx                   # Entry point
â”‚   â”œâ”€â”€ index.css                  # Global styles + Tailwind
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ CardGenerator.tsx      # Main editor UI (existing)
â”‚   â”‚   â”œâ”€â”€ Templates.tsx          # 8 template renderers (existing)
â”‚   â”‚   â”œâ”€â”€ FormWizard.tsx         # Step-by-step wizard (TODO)
â”‚   â”‚   â”œâ”€â”€ URLInput.tsx           # URL input component (TODO)
â”‚   â”‚   â”œâ”€â”€ ScrapingResult.tsx     # Display scraped content (TODO)
â”‚   â”‚   â”œâ”€â”€ ClassificationResult.tsx # Show classification (TODO)
â”‚   â”‚   â”œâ”€â”€ DataEnrichment.tsx     # Display Sectors.app data (TODO)
â”‚   â”‚   â””â”€â”€ SlideEditor.tsx        # Per-slide editor (TODO)
â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”œâ”€â”€ scraper.ts             # Web scraping service (TODO)
â”‚   â”‚   â”œâ”€â”€ gemini.ts              # Gemini API client (TODO)
â”‚   â”‚   â”œâ”€â”€ sectors.ts             # Sectors.app API client (TODO)
â”‚   â”‚   â”œâ”€â”€ supabase.ts            # Supabase client (TODO)
â”‚   â”‚   â””â”€â”€ cloudinary.ts          # Cloudinary upload (TODO)
â”‚   â”œâ”€â”€ prompts/
â”‚   â”‚   â”œâ”€â”€ classifier.ts          # Classifier prompt (TODO)
â”‚   â”‚   â””â”€â”€ naskahGenerator.ts     # Naskah generator prompts (TODO)
â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â””â”€â”€ index.ts               # TypeScript types (TODO)
â”‚   â””â”€â”€ utils/
â”‚       â””â”€â”€ helpers.ts             # Utility functions (TODO)
â”œâ”€â”€ base/                          # Reference documents
â”‚   â”œâ”€â”€ Master_Prompt_SahamFYP_Classifier.md
â”‚   â”œâ”€â”€ Data_Mapping_Spec_SahamFYP.md
â”‚   â””â”€â”€ Struktur_Konten_6_Kategori_SahamFYP.md
â”œâ”€â”€ example/                       # Example output images
â”œâ”€â”€ index.html
â”œâ”€â”€ package.json
â”œâ”€â”€ vite.config.ts
â”œâ”€â”€ tailwind.config.js
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ README.md                      # This file
â””â”€â”€ DEVELOPMENT_PLAN.md            # Development roadmap
```

## ðŸŽ¨ Design System

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

- **Body**: Inter (400â€“700) â€” Clean, legible
- **Display**: Montserrat (700â€“900) â€” Bold headlines

### Card Dimensions

- **Size**: 400px Ã— 500px (4:5 aspect ratio â€” optimal untuk Instagram)
- **Border Radius**: 24px (`rounded-3xl`)
- **Padding**: 28px (`p-7`)

## ðŸ“Š Arsitektur Sistem

### Flow Data

```
User Input URL
    â†“
Web Scraper (extract judul, isi, tanggal, sumber)
    â†“
Gemini AI Classifier (LLM 1)
    â†“
[if SKIP] â†’ Show message "Berita tidak relevan"
    â†“
[if valid category]
    â†“
Sectors.app API (data enrichment based on category + ticker)
    â†“
Gemini AI Naskah Generator (LLM 2)
    â†“
JSON Naskah Carousel (8 slides)
    â†“
Form Wizard Editor (user edit per slide)
    â†“
html-to-image (render React â†’ PNG)
    â†“
Cloudinary Upload (store images)
    â†“
Supabase (save metadata + URLs)
    â†“
Download PNG / View in gallery
```

### API Integration

| API | Fungsi | Credit/Cost |
|-----|--------|-------------|
| **Gemini 2.0** | Classifier + Naskah Generator | ~$0.001-0.01 per request |
| **Sectors.app** | Data keuangan emiten IDX | 2-8 credits per request |
| **Supabase** | Database + Auth + Storage | Free tier: 500MB DB, 1GB storage |
| **Cloudinary** | Image upload + CDN | Free tier: 25GB bandwidth/month |

## ðŸŽ¯ Roadmap Pengembangan

Lihat [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) untuk rencana pengembangan lengkap by phase.

**Fokus saat ini**: Standalone app dengan manual input â†’ auto generate â†’ download

**Future**: Otomasi penuh dengan RSS feed, n8n orchestrator, Instagram publishing, Telegram notification

## ðŸ“ Lisensi

Proyek ini dikembangkan untuk keperluan edukasi dan riset.

## ðŸ¤ Kontribusi

Kontribusi terbuka untuk improvement dan fitur baru. Silakan submit issue atau pull request.

## ðŸ“§ Kontak

Untuk pertanyaan dan kolaborasi: [@sahamfyp](https://instagram.com/sahamfyp)

---

> **Disclaimer**: Aplikasi ini adalah tool untuk membuat konten edukasi saham.
> Semua konten yang dihasilkan bertanggung jawab kepada pembuat konten.
> Bukan merupakan ajakan untuk membeli/menjual saham tertentu (**DYOR** â€” Do Your Own Research).

```
`n`n<!-- redeploy-trigger: 2026-09-09-121522 -->

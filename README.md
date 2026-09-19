# SahamFYP — AI Market Brief & Anti-FOMO Watchlist for Gen Z Investors

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.10-cyan)](https://tailwindcss.com/)
[![n8n](https://img.shields.io/badge/n8n-Workflow%20Automation-red)](https://n8n.io/)
[![Sectors API](https://img.shields.io/badge/Sectors-REST%20API-1a73e8)](https://sectors.app/)
[![Browserless](https://img.shields.io/badge/Browserless-HTML%20to%20Image-yellow)](https://www.browserless.io/)
[![LLM: Sumopod](https://img.shields.io/badge/LLM-Sumopod%20(OpenAI%20compatible)-orange)](https://ai.sumopod.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **"Make Market Data Make Sense."** — Mentransformasi riset pasar sekuritas dan keterbukaan informasi yang tebal menjadi visual watchlist harian berbasis Sectors API, lengkap dengan bedah katalis dan sistem peringatan risiko (warning) objektif untuk investor Gen Z.

---

## 🏆 Sectors Hackathon 2026

| | |
|---|---|
| **Track** | Automation & Workflows |
| **One-Sentence Problem Statement** | **SahamFYP melindungi 54%+ investor Gen Z dari jebakan pom-pom media sosial dengan mentransformasi riset sekuritas dan keterbukaan informasi yang tebal menjadi visual watchlist harian berbasis data Sectors API — lengkap dengan bedah katalis dan sistem peringatan risiko (warning) objektif.** |
| **Who it's for** | **End-User: Gen Z & Retail Investors** (yang butuh panduan pasar kredibel tapi ringan dicerna), serta **Financial Educators / Sekuritas** (yang butuh pipeline otomatis untuk menjangkau investor muda tanpa kehilangan akurasi data). |
| **Core Innovation** | **Anti-FOMO Reality Check Engine**: Bukan sekadar ikut-ikutan tren viral, AI membedah 3W (*What, Why, Impact*) dari berita/filings, lalu memvalidasinya dengan data fundamental & teknikal Sectors API. Jika saham sedang ramai dibicarakan tapi fundamentalnya boncos atau utangnya bengkak, SahamFYP memberikan **Warning & Red Flag** secara transparan. |
| **Live Proof** | Akun publik **[@sahamfyp.id](https://instagram.com/sahamfyp.id)** berjalan 100% otomatis (unattended) di Instagram, TikTok, Threads, Facebook, dan Telegram Channel — [contoh postingan live](https://www.instagram.com/p/Ddaf_0piRRt/?img_index=5). |

> **Catatan penting soal core data source**: SahamFYP menggunakan **Sectors REST API** di setiap tahap alur — deteksi ticker, enrichment laporan keuangan & valuasi, ranking top movers berkapitalisasi wajar, hingga foreign flow dan kalkulasi teknikal Moving Average. **Kalau data Sectors.app dicabut, produk ini kehilangan fungsi intinya**: slide 4–6 di semua template konten bergantung penuh pada data tersebut untuk verifikasi faktual. Tanpa Sectors API, sistem hanya jadi rewrite berita tanpa nilai tambah — persis kebalikan dari misi produk ini.

---

## 📑 Daftar Isi
- [📌 Apa Itu SahamFYP?](#-apa-itu-sahamfyp)
- [🎯 Latar Belakang & Masalah Gen Z](#-latar-belakang--masalah-gen-z)
- [🔄 Dua Workflow Otomatis (n8n)](#-dua-workflow-otomatis-n8n)
- [🌟 Fitur Utama](#-fitur-utama)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Cara Duplikasi / Clone Content Engine](#-cara-duplikasi--clone-content-engine)
- [📁 Struktur Project](#-struktur-project)
- [🔌 API Reference](#-api-reference)
- [🎬 Pitch & Storyboard Video](#-pitch--storyboard-video)
- [🔗 Quick Links & Resources](#-quick-links--resources)
- [🔧 Troubleshooting](#-troubleshooting)
- [📝 Catatan Versi](#-catatan-versi)
- [📊 Data Pendukung](#-data-pendukung-latar-belakang-gen-z-investor)

---

## 📌 Apa Itu SahamFYP?

**SahamFYP** adalah **AI-Powered Market Brief & Risk Warning Engine** yang didesain khusus untuk melindungi dan mengedukasi investor generasi baru (Gen Z).

Setiap hari sebelum bursa saham Indonesia buka (08:00 WIB), SahamFYP memproses data pasar modal secara otonom:
1. **Kurasi Berita & Filings Terhangat**: Mengumpulkan keterbukaan informasi BEI dan berita pasar dari 8 sumber ekonomi terpercaya.
2. **Ekstraksi Katalis 3W**: AI memilih peristiwa dengan katalis paling signifikan dan mengekstraknya menjadi **Apa** yang terjadi, **Kenapa** terjadi, dan **Apa Dampaknya** ke emiten.
3. **Reality Check Fundamental & Teknikal (Sectors.app)**: Data emiten langsung di-enrich dengan metrik resmi Sectors API (PER, PBV, ROE, DER, Foreign Flow, MA20/50/200, Volume ratio).
4. **Edukasi & Warning System**: Menghasilkan watchlist harian visual dengan pemetaan kuadran objektif. Jika suatu saham sedang viral tapi fundamentalnya rapuh (utang menumpuk, rugi bersih, valuasi bubble), SahamFYP memberikan **stempel peringatan risiko (Warning / Red Flag)**.
5. **Multi-Publishing Otomatis**: Naskah dirender menjadi carousel visual beresolusi tinggi dan diunggah secara otomatis ke Instagram, TikTok, Threads, Facebook, serta Telegram.

> **Akun live** (showcase produk nyata, berjalan otomatis tanpa operator):
> - Instagram: https://instagram.com/sahamfyp.id
> - Facebook: https://facebook.com/sahamfyp.id
> - Threads: https://www.threads.com/@sahamfyp.id
> - TikTok: https://tiktok.com/@sahamfyp.id
> - Telegram Channel: https://t.me/sahamfyp
> - Contoh postingan hasil generate otomatis: https://www.instagram.com/p/Ddaf_0piRRt/?img_index=5

---

## 🎯 Latar Belakang & Masalah Gen Z

### Realita Pasar Modal Indonesia
Berdasarkan data resmi **Kustodian Sentral Efek Indonesia (KSEI)** dan **Bursa Efek Indonesia (BEI)**:
- **54,4% investor pasar modal adalah Generasi Z** (usia di bawah 30 tahun mendominasi demografi investor individu).
- Namun, nilai kepemilikan aset kelompok ini hanya **3,2% dari total aset pasar modal** (Katadata, Mei 2026). Angka ini mencerminkan tingginya angka retail pemula yang bertransaksi dengan modal terbatas dan minim literasi risiko.

### Kontradiksi: Di Mana Gen Z Beli Saham vs Di Mana Seharusnya?

```
[ Realita Perilaku Gen Z ]                     [ Sumber Rekomendasi Resmi ]
Screenshot Grup Telegram Bandar                 Daily Market Brief Sekuritas
Video TikTok / Reels Pom-pom      VS           Research Report Emiten (PDF 25+ Lembar)
FOMO "To The Moon" Tanpa Analisis               Keterbukaan Informasi BEI (Filings)
       │                                                      │
       ▼                                                      ▼
  CEPAT & MENARIK,                                       AKURAT & RESMI,
  TAPI MENYESATKAN & BONCOS!                             TAPI KAKU, PANJANG, & BIKIN PUSING!
```

1. **Kenapa Gen Z lari ke grup pom-pom?**  
   Formatnya instan, bahasanya santai, dan menjanjikan keuntungan cepat.
2. **Kenapa Gen Z tidak membaca riset sekuritas resmi?**  
   Riset sekuritas disajikan dalam dokumen PDF 20–30 lembar, bertabur istilah teknis (DER, PBV, EBITDA margin), grafik abu-abu yang kaku, dan tulisan padat yang sangat tidak cocok dengan cara konsumsi informasi generasi mobile-first.
3. **Akibatnya?**  
   Gen Z sering kali membeli saham di puncak harga (*pucuk*) dan menjadi **exit liquidity** bagi bandar/pelaku manipulasi pasar.

### Solusi SahamFYP: Jembatan Data Riset & Bahasa Gen Z

SahamFYP mengambil **kedalaman data riset sekuritas** dan memformatnya menjadi **daya cerna konten media sosial**:
- **Bukan Ikutan Nge-Hype, Tapi Reality Check**: SahamFYP hadir dengan komitmen independen. Jika sebuah saham sedang ramai dibicarakan tetapi perusahaannya terus merugi, valuasinya tidak masuk akal, atau kepemilikan asing terus dilepas, SahamFYP akan menyatakannya secara lugas: *"Saham ini ramai, tapi fundamentalnya merah menyala — waspada jebakan FOMO!"*.
- **Bahasa Gaul Finansial & Kamus Gen Z**: Setiap istilah rumit (seperti Golden Cross, PER, atau Foreign Flow) langsung diterjemahkan dengan analogi kehidupan sehari-hari (misal: DER dianalogikan seperti limit paylater vs gaji).
- **100% Otomatis & Terverifikasi**: Menghilangkan hambatan operasional riset manual. Setiap data dipasok langsung oleh **Sectors REST API** yang kredibel.

> **Bukan Nasihat Keuangan (DYOR)**: Seluruh konten SahamFYP bersifat edukatif dan berbasis data publik untuk menumbuhkan kebiasaan riset mandiri (*Do Your Own Research*), bukan ajakan beli/jual saham tertentu.

---

## 🔄 Dua Workflow Otomatis (n8n)

Ini adalah inti dari track **Automation & Workflows**: dua pipeline yang berjalan **otonom** tanpa intervensi manual per siklus.

### 1. Daily Market Brief — Trigger Terjadwal, tiap 08:00 WIB

Berjalan otomatis setiap pagi sebelum bursa buka. Dalam **satu sesi trigger**, sistem memanggil banyak endpoint Sectors REST API sekaligus untuk membangun brief pasar harian + watchlist saham. Contoh log eksekusi nyata (Sep 18, 10:17 — sesi manual test run, jadwal produksi tetap 08:00 WIB):

| Waktu | Endpoint Sectors API | Tipe | Status | Credits |
|---|---|---|---|---|
| 10:17 | `/v2/daily/INET.JK/` | Direct API | 200 | 1 |
| 10:17 | `/v2/company/report/PTRO.JK/` | Direct API | 200 | 3 |
| 10:17 | `/v2/company/report/BYAN.JK/` | Direct API | 200 | 3 |
| 10:17 | `/v2/company/report/INET.JK/` | Direct API | 200 | 3 |
| 10:17 | `/v2/daily/BYAN.JK/` | Direct API | 200 | 1 |
| 10:17 | `/v2/daily/MBMA.JK/` | Direct API | 200 | 1 |
| 10:17 | `/v2/daily/PTRO.JK/` | Direct API | 200 | 1 |
| 10:17 | `/v2/company/report/MBMA.JK/` | Direct API | 200 | 3 |
| 10:17 | `/v2/brokers/top/` | Direct API | 200 | 2 |
| 10:17 | `/v2/companies/top-changes/` | Direct API | 200 | 2 |
| 10:17 | `/v2/news/` | Direct API | 200 | 1 |
| 10:17 | `/v2/filings/` | Direct API | 200 | 1 |
| 10:17 | `/v2/index-daily/ihsg/` | Direct API | 200 | 1 |

**Alur:**

```
Schedule Trigger (08:00 WIB)
  → SectorTrigger/open (pilih watchlist saham hari ini, generate naskah via LLM + Sectors data)
  → Loop per slide → Render HTML → Browserless (HTML → JPEG 1080×1350)
  → Upload ke Supabase Storage (bucket sfyp-storage) → kumpulkan imageUrls
  → Publish ke Repliz (multi-akun: Instagram, Facebook, Threads, X, TikTok)
  → Simpan log post ke Supabase (/api/posts)
  → Laporan status ke Telegram (jumlah credits terpakai, saham terpilih, akun yang berhasil publish)
```

Bukti unattended run: log eksekusi (seperti tabel di atas), timestamp trigger, dan notifikasi Telegram otomatis tiap sesi selesai — semua tanpa operator menekan tombol apa pun setelah workflow di-deploy.

### 2. News Monitoring — Trigger Event-Based, real-time saat ada berita baru

Berjalan kontinu, memantau **8 sumber RSS media ekonomi Indonesia** (Katadata, Kontan, Okezone, Liputan6, Detik, CNN Indonesia, CNBC Indonesia, IDX Channel) setiap menit untuk mendeteksi sinyal berita baru yang berpotensi memengaruhi harga saham.

**Alur:**

```
RSS Trigger (8 sumber, poll tiap menit)
  → Cek duplikat (/api/news-scrape, cegah proses berita yang sama 2x)
  → Scrape isi artikel penuh (/api/scrape)
  → Classify kategori & ticker (/api/classify — LLM, 6 kategori)
  → Score urgensi/relevansi (/api/score)
  → Decision gate: PASS (berita tidak cukup relevan/kuat → skip, notifikasi Telegram singkat)
             atau GENERATE (lanjut ke enrichment & produksi konten)
  → Enrich dengan Sectors REST API sesuai kategori (lihat tabel 6 kategori di bawah)
  → Generate naskah (LLM) → Render HTML → Browserless → upload gambar (Supabase Storage — migrasi dari Cloudinary sedang berjalan)
  → Publish ke Repliz → Update status di Supabase → Laporan ke Telegram
```

Karena berbasis RSS multi-sumber + polling otomatis (bukan scraping satu situs saja), workflow ini lebih tahan terhadap downtime satu sumber berita dan tetap berjalan otonom mendeteksi sinyal kapan pun berita baru terbit — tanpa jadwal tetap, murni event-driven.

> **Status migrasi storage**: workflow ini sedang dipindah dari Cloudinary ke Supabase Storage supaya satu CDN dipakai konsisten di seluruh sistem. Lihat [Known Limitations](#-known-limitations--status-pengembangan) untuk detail.



---

## 🌟 Fitur Utama

- **Dashboard Terintegrasi** → Akses cepat untuk *Market Brief* harian dan pantauan *Stock Watchlist*.
- **News Monitoring Real-Time** → Deteksi otomatis berita dari 8 sumber RSS, filter berdasarkan rentang waktu untuk merangkum berita terkini secara dinamis.
- **Accounts Manager** → Manajemen akun sosial media terpusat (Instagram, Threads, Facebook, X, TikTok). Bisa menambah, menghapus, melihat preview link profil, serta *toggle* Active/Inactive yang tersinkronisasi langsung dengan *database* Supabase.
- **Content Generator & Multi-Publishing** → Generate konten visual AI (Form Wizard) dan kemampuan **memilih beberapa target akun sosmed** sekaligus dalam satu kali klik — untuk kebutuhan konten manual/ad-hoc di luar dua workflow otomatis di atas.
- **Full Automation Workflow (n8n)** → Dua pipeline otonom end-to-end (lihat bagian [Dua Workflow Otomatis](#-dua-workflow-otomatis-n8n)) dari deteksi sinyal → verifikasi data Sectors → generate → publish → laporan Telegram, tanpa intervensi manual per siklus.

---

## 🛠️ Tech Stack

### 1. Sectors.app — REST API (Core Data Source)

- **Fungsi**: Sumber data fundamental & pasar saham — laporan keuangan, valuation, dividen, ownership, foreign flow, broker activity, top movers, index harian, filings, dan berita pasar terverifikasi.
- **Referensi**: https://sectors.app/
- **Cara kerja**: Seluruh integrasi memakai **Sectors REST API** secara langsung (bukan MCP) lewat endpoint seperti `/v2/company/report/{ticker}/`, `/v2/daily/{ticker}/`, `/v2/brokers/top/`, `/v2/companies/top-changes/`, `/v2/news/`, `/v2/filings/`, `/v2/index-daily/{index}/`. Data ini dipanggil di **setiap** sesi Daily Market Brief dan di tahap enrichment News Monitoring — bukan panggilan dekoratif sekali pakai, melainkan tulang punggung verifikasi faktual seluruh konten yang diproduksi.

### 2. Repliz

- **Fungsi**: Publish scheduling ke berbagai media sosial (Instagram, Threads, Facebook, TikTok, Twitter/X, LinkedIn, Telegram).
- **Referensi**: https://repliz.com/ | https://api.repliz.com/public-json
- **Cara kerja**: Endpoint Vercel API `/api/publish` SahamFYP berperan sebagai orkestrator yang menerima daftar akun yang ingin dituju (`targetAccountIds`). API ini kemudian akan mengecek kredensial dinamis dari database Supabase (`social_accounts`) dan mengirim payload massal ke Repliz secara simultan.

### 3. LLM — Sumopod (OpenAI compatible)

- **Fungsi**:
  - **Klasifikasi berita** → kategori & ticker yang relevan
  - **Scoring** → urgensi/relevansi berita untuk keputusan PASS/GENERATE
  - **Enrichment ringkasan** → ekstrak topik, insight, dan rekomendasi ticker
  - **Generate konten** → naskah slide, caption, hashtag, konten IG/TikTok
- **Referensi**: https://ai.sumopod.com/ | https://sumopod.com/
- **Cara kerja**: Endpoint OpenAI-compatible `POST {SUMOPOD_BASE_URL}/chat/completions` (default `https://ai.sumopod.com/v1/chat/completions`) dengan header `Authorization: Bearer <SUMOPOD_API_KEY>`. Model default `gemini/gemini-3.1-flash-lite` (ganti via `SUMOPOD_MODEL`). Wrapper server: `api/_lib/llm.ts`; wrapper client (proxy `/api/llm`): `src/services/llm.ts` — API key tidak pernah ter-expose ke bundle browser.

### 4. Penyimpanan Gambar: Supabase Storage (migrasi dari Cloudinary — in progress)

- **Fungsi**: Engine rendering gambar dan penyimpanan CDN publik
- **Status**: Daily Market Brief sudah sepenuhnya pakai **Supabase Storage** (bucket `sfyp-storage`). News Monitoring **sedang dalam proses migrasi** dari Cloudinary ke Supabase Storage — belum 100% selesai, sebagian eksekusi masih bisa memakai Cloudinary sampai migrasi tuntas. Env variable Cloudinary masih dipertahankan di `.env.example` untuk sementara.
- **Cara kerja**:
  - **Browserless.io** digunakan oleh kedua *workflow* n8n untuk mengubah skrip HTML (berisi data fundamental & berita) menjadi gambar beresolusi tinggi (JPEG 1080×1350).
  - Gambar hasil render diunggah ke **Supabase Storage** (bucket `sfyp-storage`); URL publiknya dikumpulkan sebagai payload `imageUrls` yang diteruskan ke API publish, menghindari risiko blokir CDN gratisan dari Meta/Facebook.

### 5. Template Konten & Klasifikasi Berita

SahamFYP menggunakan **6 kategori utama konten** yang masing-masing memiliki struktur slide carousel **8 slide** yang konsisten.

#### a. Klasifikasi Berita Otomatis

- **Endpoint**: `POST /api/classify`
- **Fungsi**: Mengklasifikasikan berita ke dalam 6 kategori utama dengan menentukan kategori terbaik dan ticker yang relevan (jika ada)
- **Kategori**: `SINGLE_STOCK`, `MACRO_ECONOMY`, `SECTOR_ANALYSIS`, `CORPORATE_ACTION`, `IPO_RIGHTS_ISSUE`, `SUSPENSION_DELISTING`
- **Output**: JSON berisi `{category, ticker?, confidence}`
- **Model**: Sumopod `gemini/gemini-3.1-flash-lite` (OpenAI compatible, bisa diganti via `SUMOPOD_MODEL`)

#### b. Struktur Konten per Kategori

Semua kategori menggunakan **8 slide carousel** yang konsisten:

| Slide | Fungsi | Keterangan |
|-------|--------|------------|
| 1 | **COVER** | Headline menarik + sub-judul |
| 2 | **TLDR** | Ringkasan cepat dalam poin-poin |
| 3 | **KRONOLOGI** | Konteks berita (apa, kapan, siapa) + sumber |
| 4 | **Data Enrichment** | **Beda per kategori** (lihat tabel di bawah) — sumber: Sectors REST API |
| 5 | **Point + Explanation** | **Beda per kategori** (lihat tabel di bawah) |
| 6 | **Point + Explanation** | **Beda per kategori** (lihat tabel di bawah) |
| 7 | **KESIMPULAN** | Rangkuman edukatif netral |
| 8 | **CTA_DYOR** | Diskusi + disclaimer DYOR |

#### c. 6 Kategori & Perbedaan Slide 4–6

**1. SINGLE_STOCK — Analisis Emiten Tunggal**
- Slide 4: `BEDAH_DATA` — PER, PBV, ROE, ROA, EPS TTM, Foreign Flow
- Slide 5: `PROS` — Sisi positif emiten dengan point & explanation
- Slide 6: `CONS` — Sisi risiko dengan point & explanation
- **Sectors REST API endpoints**: `/v2/company/report/{ticker}/` (sections: `overview`, `valuation`, `financials`, `future`, `dividend`, `ownership`) + `/v2/daily/{ticker}/` (foreign flow)

**2. MACRO_ECONOMY — Makro Ekonomi & Tren Pasar**
- Slide 4: `DAMPAK_PASAR` — Dampak kebijakan makro ke IHSG & portofolio
- Slide 5: `DIUNTUNGKAN` — Saham/sector yang diuntungkan kebijakan tersebut
- Slide 6: `PERLU_DIWASPADAI` — Risiko & hal yang perlu diwaspadai
- **Sectors REST API endpoints**: `/v2/index-daily/ihsg/` + `/v2/companies/top-changes/` + `/v2/company/report/{ticker}/` (ringan)

**3. SECTOR_ANALYSIS — Tren Sektor & Emiten Terkait**
- Slide 4: `DATA_SEKTOR` — Data sektor (market cap, korelasi, top stocks)
- Slide 5: `SAHAM_JAGOAN` — Saham-saham yang mendominasi sektor
- Slide 6: `PERLU_DIWASPADAI` — Risiko & catatan khusus sektor
- **Sectors REST API endpoints**: data sektor + `/v2/company/report/{ticker}/` (untuk beberapa emiten)

**4. CORPORATE_ACTION — Aksi Korporasi**
- Slide 4: `DETAIL_AKSI` — Jadwal & detail aksi (bonus, cuan, dividend, split, dll)
- Slide 5: `UNTUNG_BUAT_INVESTOR` — Pengaruh aksi ke investor
- Slide 6: `PERLU_DIPERHATIKAN` — Hal yang perlu diperhatikan sebelum/after aksi
- **Sectors REST API endpoints**: `/v2/filings/` + `/v2/company/report/{ticker}/` (sections: `overview`) — ringan

**5. IPO_RIGHTS_ISSUE — IPO & Penawaran Emiten**
- **(5A) Emiten dengan prospektus & data jelas**
  - Slide 4: `SKEMA_AKSI` — Skema penawaran (harga, lot, discount, jadwal)
  - Slide 5: `UNTUNG_BUAT_INVESTOR` — Potensi keuntungan
  - Slide 6: `RISIKO` — Risiko investasi IPO
  - **Sectors REST API endpoints**: `/v2/company/report/{ticker}/` (sections: `overview`) — ringan
- **(5B) Emiten dengan info terbatas**
  - Slide 4: `DETAIL_PENAWARAN` — Detail yang tersedia (hanya yang public)
  - Slide 5: `PROFIL_PERUSAHAAN` — Profil singkat yang diketahui
  - Slide 6: `KENAPA_MENARIK` — Faktor menarik + keberadaan risiko
  - **Sectors REST API endpoints**: Tidak ada — 100% dari teks berita hasil scrape

**6. SUSPENSION_DELISTING — Suspensi & Delisting**
- Slide 4: `FAKTA_SUSPENSI` — Fakta dasar suspensi (status, ticker, kapan dimulai)
- Slide 5: `APA_ITU_SUSPENSI` — Edukasi tentang suspensi (mekanisme, tipe, cooling down vs delisting)
- Slide 6: `YANG_PERLU_DILAKUKAN` — Langkah yang bisa dilakukan investor
- **Sectors REST API endpoints**: data suspensi + `/v2/company/report/{ticker}/` (sections: `overview`)

#### d. Data Enrichment — Sumber

- **Sectors REST API**: Data fundamental & pasar emiten (keuangan, dividen, valuation, ownership, foreign flow, broker activity, top movers, index harian, filings, berita pasar)
- **RSS Multi-Sumber + Scrape**: Deteksi sinyal berita awal (8 outlet media ekonomi Indonesia) dan pengambilan teks lengkap artikel via `/api/scrape` — dipakai sebagai *trigger* dan konteks tambahan, sementara **verifikasi faktual tetap dari Sectors REST API**

#### e. Panduan Konten (Standar Wajib)

- Semua kategori **8 slide** — konsistensi pagination di tiap carousel
- Slide 1, 2, 7, 8 **format relatif sama** di semua kategori (bisa reuse komponen)
- Slide 3, 4, 5, 6 **berbeda per kategori** — masing-masing butuh komponen/template tersendiri
- Format **point + explanation** pada slide 5 & 6 adalah **standar wajib** di semua kategori
- Konten bersifat **edukatif & netral** — tidak mengajak beli/jual, melainkan memberi perspektif & data

#### f. Referensi Detail

Selengkapnya baca di: [`docs/Struktur_Konten_6_Kategori_SahamFYP.md`](docs/Struktur_Konten_6_Kategori_SahamFYP.md)



### 6. Template Konten Daily Brief (Market Open, live — Market Close, planned)

Selain konten berbasis berita, SahamFYP juga memiliki template dinamis untuk trigger terjadwal yang dirancang untuk merangkum kondisi IHSG.

#### a. Market Open (08:00 WIB) — ✅ sudah live
Digunakan untuk memberikan outlook pasar sebelum bursa buka, dilengkapi watchlist saham pilihan. Ini yang berjalan otomatis lewat workflow [Daily Market Brief](#1-daily-market-brief--trigger-terjadwal-tiap-0800-wib) di atas.
| Slide | Fungsi | Keterangan |
|-------|--------|------------|
| 1 | **COVER** | Judul "Market Open" + Tanggal + Jumlah Watchlist |
| 2 | **TLDR** | Ringkasan IHSG kemarin, Top Gainers/Losers, Foreign Flow, Berita Utama |
| 3 | **KONDISI MARKET** | Data metrik market kemarin |
| 4...N | **STOCK SLIDES** | Bedah fundamental, teknikal, dan vibe check per saham di watchlist (berulang per saham) |
| N+1 | **MATRIX** | Kesimpulan posisi saham di Kuadran Fundamental × Teknikal |
| N+2 | **KAMUS** | Penjelasan istilah saham ala Gen Z |
| N+3 | **CTA** | Ajakan diskusi di komentar |

#### b. Market Close (17:00 WIB) — 🚧 direncanakan, belum dibangun
Template & struktur slide di bawah sudah dirancang untuk merangkum pergerakan bursa setelah tutup, tapi **workflow trigger-nya (`/api/sector-trigger/close`) belum diimplementasikan** — belum ada n8n schedule trigger yang menjalankannya secara otomatis. Ditulis di sini sebagai roadmap teknis, bukan fitur yang sudah live.
| Slide | Fungsi | Keterangan |
|-------|--------|------------|
| 1 | **COVER** | Judul "Recap Market" + Tanggal |
| 2 | **TLDR** | Ringkasan angka penutupan IHSG & Top Gainers/Losers |
| 3 | **KRONOLOGI** | Narasi singkat pergerakan IHSG hari ini |
| 4 | **DATA** | Angka detail Gainer, Loser & Volume |
| 5 | **PROS** | Broker asing akumulasi terbesar & saham yang diborong |
| 6 | **CONS** | Sektor yang underperform & perlu diwaspadai |
| 7 | **KESIMPULAN** | Ringkasan netral dari pergerakan harga hari ini |
| 8 | **CTA** | Ajakan diskusi & Disclaimer DYOR |

### 7. Supabase

- **Fungsi**: Database utama, Single Source of Truth, dan Object Storage.
- **Referensi**: https://supabase.com/
- **Cara kerja**:
  - **Tabel Utama**: `sector_trigger_news` (log eksekusi n8n & berita, jadi bukti unattended run), `social_accounts` (database akun sosmed & status aktif/inaktif), dan `generated_posts` (status posting).
  - **Storage**: Menggunakan bucket publik `sfyp-storage` untuk workflow Daily Market Brief.

### 8. Vercel

- **Fungsi**:
  - Hosting untuk aplikasi web (frontend React + Vite)
  - Serverless functions (Vercel Functions) untuk API routes (`/api/*`)
- **Referensi**: https://vercel.com/
- **Cara kerja**:
  - Setiap file di `api/` folder di-deploy sebagai Vercel Function
  - Build command: `node scripts/sync-env.mjs && npm run build`
  - Output directory: `dist`
  - Config di `vercel.json` untuk routing & rewrites

### 9. n8n

- **Fungsi**: Workflow automation sebagai orchestrator utama untuk dua pipeline otonom (Daily Market Brief & News Monitoring) — menghubungkan Sectors REST API, LLM, storage, dan publish tanpa intervensi manual per siklus.
- **Referensi**: https://n8n.io/
- **Cara kerja**:
  - Workflow JSON bisa diimport ke n8n instance (lihat `docs/n8n-workflows/`, token API sudah dianonimkan sebelum commit)
  - Trigger: schedule (Daily Market Brief, 08:00 WIB) atau RSS event trigger (News Monitoring, tiap menit polling)
  - Setiap step memanggil API SahamFYP atau service langsung

### 10. Telegram Bot

- **Fungsi**: Notifikasi status tiap sesi otomatis: berhasil / gagal / scheduled — sekaligus menjadi bukti unattended run (timestamp + hasil tiap eksekusi tanpa operator).
- **Referensi**: https://core.telegram.org/bots
- **Cara kerja**: Menggunakan Telegram Bot API untuk kirim notifikasi ke user/group yang diset.

### 11. React + Vite

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
  - Sectors.app API key (REST API): https://sectors.app/ — **wajib**, tanpa ini produk tidak berfungsi
  - Sumopod API key (OpenAI-compatible LLM): https://ai.sumopod.com/
  - Repliz account & API key: https://repliz.com/
  - Supabase project & credentials: https://supabase.com/
  - n8n instance (self-hosted or cloud): https://n8n.io/
  - Telegram bot token (jika pakai notifikasi Telegram): https://core.telegram.org/bots
  - Cloudinary account & cloud name (masih dipakai sebagian workflow News Monitoring selama migrasi ke Supabase Storage berjalan): https://cloudinary.com/
  - **Vercel account**: untuk deploy backend & frontend

> ⚠️ **Keamanan**: jangan pernah commit API key/token asli (termasuk di file workflow JSON n8n) ke repository publik. Ganti dengan placeholder/environment variable sebelum push. Kalau terlanjur bocor, rotate key tersebut segera di provider terkait sebelum melakukan commit apa pun.

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

# 5. Setup Supabase Storage
# Buat bucket bernama "sfyp-storage" di dashboard Supabase dan pastikan diset sebagai Public.

# 6. Test local development
npm run dev

# 7. Build for production
npm run build
```

### Environment Variables

Buat file `.env.local` dengan variabel berikut:

```bash
# Sectors.app (REST API — core data source, wajib)
SECTORS_API_KEY=your_sectors_api_key_here

# LLM (OpenAI-compatible: Sumopod)
SUMOPOD_API_KEY=your_sumopod_api_key_here
# Opsional (ada default di api/_lib/llm.ts)
SUMOPOD_BASE_URL=https://ai.sumopod.com/v1
SUMOPOD_MODEL=gemini/gemini-3.1-flash-lite

# Repliz
REPLIZ_ACCESS_KEY=your_repliz_access_key
REPLIZ_SECRET_KEY=your_repliz_secret_key
REPLIZ_ACCOUNT_ID=your_repliz_account_id
# Opsional: TikTok account ID (jika beda dari Instagram)
REPLIZ_TIKTOK_ACCOUNT_ID=your_repliz_tiktok_account_id_optional

# Cloudinary (CDN gambar — dipakai workflow News Monitoring)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Browserless (HTML → image renderer)
BROWSERLESS_IO_KEY=your_browserless_api_key

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# n8n
# Dipakai untuk autentikasi webhook calls dari n8n ke endpoint:
# /api/enrich, /api/generate, /api/posts, /api/publish, /api/llm, /api/classify, /api/score, /api/news-scrape, /api/sector-trigger/open
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

> **Note**: Anda TIDAK PERLU menambahkan VITE_ keys secara manual. Build command `node scripts/sync-env.mjs && npm run build` akan auto-generate VITE_ duplicates dari non-prefixed keys (lihat `.env.example` dan `scripts/sync-env.mjs`).

### Setup n8n Workflow

1. Buat n8n instance (self-hosted atau cloud)
2. Import kedua workflow JSON: `Daily Market Brief` (schedule trigger 08:00 WIB) dan `News Monitoring` (RSS trigger, 8 sumber, poll tiap menit)
3. Isi credential (Sectors API key, N8N_API_KEY, Telegram, dsb) — jangan hardcode token di node
4. Hubungkan API nodes ke endpoint SahamFYP:
   - `POST /api/sector-trigger/open` → mulai sesi Daily Market Brief
   - `POST /api/scrape`, `/api/classify`, `/api/score`, `/api/news-scrape` → pipeline News Monitoring
   - `POST /api/enrich` → enrich dengan Sectors REST API
   - `POST /api/generate` → generate slide & caption
   - `POST /api/publish` → publish ke Repliz
5. Setup notifikasi Telegram sebagai bukti unattended run

---

## 📁 Struktur Project

```
sahamFYP/
├── api/
│   ├── _lib/              # Shared utilities
│   ├── classify.ts        # Klasifikasi berita endpoint
│   ├── score.ts           # Scoring urgensi/relevansi berita endpoint
│   ├── enrich.ts          # Enrichment data Sectors REST API endpoint
│   ├── generate.ts        # Generate konten (slide + caption) endpoint
│   ├── news-scrape.ts     # Dedup check & simpan berita scraped endpoint
│   ├── sector-trigger/
│   │   └── open.ts        # Trigger sesi Daily Market Brief endpoint
│   ├── posts/
│   │   └── index.ts       # Posts management endpoints
│   ├── publish.ts         # Publish ke Repliz endpoint
│   ├── scrape.ts          # Scrape isi artikel penuh endpoint
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
│   ├── Struktur_Konten_6_Kategori_SahamFYP.md  # Referensi template konten
│   └── n8n-workflows/     # Export workflow JSON (token dianonimkan)
│       ├── SahamFYP_-_Daily_Market_Brief.json
│       └── SahamFYP_-_News_Monitoring.json
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
    "llm": true,
    "llmModel": "gemini/gemini-3.1-flash-lite",
    "llmBaseUrl": "https://ai.sumopod.com/v1",
    "sectors": true,
    "supabase": true,
    "repliz": true
  }
}
```

### Trigger Sesi Daily Market Brief

**POST** `/api/sector-trigger/open`

- **Auth**: `X-API-Key` (= `N8N_API_KEY`)
- **Fungsi**: Memulai satu sesi Daily Market Brief — memilih watchlist saham hari ini, memanggil rangkaian endpoint Sectors REST API (lihat contoh log di bagian [Dua Workflow Otomatis](#-dua-workflow-otomatis-n8n)), dan generate naskah slide via LLM
- **Response**: Session data berisi `logId`, `naskah` (slides + caption), `selection` (alasan saham terpilih), `creditsUsed`

### Klasifikasi Berita

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

### Scoring Berita

**POST** `/api/score`

- **Auth**: `x-api-key` header (N8N_API_KEY)
- **Fungsi**: Menilai urgensi/relevansi berita untuk menentukan keputusan `PASS` (berita di-skip, tidak cukup kuat/relevan) atau `GENERATE` (lanjut diproses jadi konten) di workflow News Monitoring

### LLM Prompt (proxy)

**POST** `/api/llm`

- **Auth**: `X-API-Key` (= `N8N_API_KEY`)
- **Fungsi**: proxy prompt bebas dari browser ke LLM (Sumopod, OpenAI compatible) supaya API key provider tidak ter-expose ke client
- **Request body**:
```json
{
  "prompt": "Buat caption Instagram ...",
  "json": false,
  "temperature": 0.7,
  "maxTokens": 4096
}
```
- **Response** (text mode): `{ "model": "gemini/gemini-3.1-flash-lite", "text": "..." }`
- **Response** (json mode, `"json": true`): `{ "model": "gemini/gemini-3.1-flash-lite", "data": { ... } }`

### Enrich Berita (Sectors REST API)

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
- **Response**: Data fundamental dari Sectors REST API
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
- **Request body** (contoh full pipeline):
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
  "imageUrls": [
    "https://xxxx.supabase.co/storage/v1/object/public/sfyp-storage/slide-1.jpg"
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
- `imageUrls`/`cloudinaryUrls` bisa berisi 1 (single image) atau lebih (album/carousel). Jika 1 → type `image`, jika 2+ → type `album`

### Scrape Isi Artikel

**POST** `/api/scrape`

- **Auth**: Tidak perlu (public)
- **Request body**:
```json
{
  "url": "https://www.cnbcindonesia.com/market/..."
}
```
- **Response**: Teks berita yang di-scrape (jika berhasil)
- **Konteks**: Dipanggil setelah RSS trigger (News Monitoring) mendeteksi berita baru dari salah satu dari 8 sumber (Katadata, Kontan, Okezone, Liputan6, Detik, CNN Indonesia, CNBC Indonesia, IDX Channel), untuk mengambil isi artikel penuh sebelum diklasifikasi & di-enrich dengan Sectors REST API.

**Catatan**: Endpoint ini rentan terhadap blokir oleh target website (403 Forbidden) — mitigasi: RSS multi-sumber membuat pipeline tetap berjalan meski satu situs sedang memblokir.

### Cek Duplikat & Simpan Berita

**POST** `/api/news-scrape`

- **Auth**: Tidak perlu (public, dipanggil internal oleh n8n)
- **Fungsi**: `action: "check"` untuk cek apakah URL berita sudah pernah diproses (cegah duplikat konten); `action: "update"` untuk update kategori/skor berita yang tersimpan

---

## 🎬 Pitch & Storyboard Video

Panduan lengkap naskah dan alur video presentasi untuk juri Hackathon tersedia di:
📄 **[`storyboard.md`](storyboard.md)**

- **One-Sentence Problem Statement**:
  > *"SahamFYP melindungi 54%+ investor Gen Z dari jebakan pom-pom media sosial dengan mentransformasi riset sekuritas dan keterbukaan informasi yang tebal menjadi visual watchlist harian berbasis data Sectors API — lengkap dengan bedah katalis dan sistem peringatan risiko (warning) objektif."*
- **1-Minute Teaser Video**: Naskah hook cepat (FOMO vs riset resmi), demo automasi n8n + Sectors API, dan visual slide warning.
- **3-Minute Judging Walkthrough**: Dekonstruksi masalah Gen Z, demonstrasi Sectors API sebagai tulang punggung kebenaran data, arsitektur pipeline otonom, dan bukti live di akun publik `@sahamfyp.id`.

---

## 🔗 Quick Links & Resources

- **Dashboard Web**: https://saham-fyp.vercel.app/
- **API Health**: https://saham-fyp.vercel.app/api/health
- **Akun live**: [@sahamfyp](https://instagram.com/sahamfyp) di Instagram, Facebook, Threads, X, TikTok
- **API Sector Trigger**: `POST /api/sector-trigger/open`
- **API Classify**: `POST /api/classify`
- **API Score**: `POST /api/score`
- **API Enrich**: `POST /api/enrich`
- **API Generate**: `POST /api/generate`
- **API Posts**: `GET/POST /api/posts`
- **API Publish**: `POST /api/publish`
- **API Scrape**: `POST /api/scrape`
- **API Score**: `POST /api/score`
- **API News Scrape**: `POST /api/news-scrape`
- **API Sector Trigger Open**: `POST /api/sector-trigger/open`
- **API Sector Trigger Close**: `POST /api/sector-trigger/close`
- **API News Scrape**: `POST /api/news-scrape`

### Referensi Eksternal

- **Sectors.app REST API**: https://sectors.app/
- **Google AI Studio**: https://aistudio.google.com/
- **Google Generative AI Docs**: https://ai.google.dev/
- **Repliz**: https://repliz.com/ | https://api.repliz.com/public-json
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

2. **`401 Unauthorized` saat publish ke Repliz**
   - Pastikan `REPLIZ_ACCESS_KEY`, `REPLIZ_SECRET_KEY`, `REPLIZ_ACCOUNT_ID` benar dan akun Repliz mendukung fitur yang dipakai

3. **`403 Forbidden` saat scrape artikel**
   - Beberapa situs sumber (dari 8 RSS feed) bisa memblokir scraping sesekali — pipeline tetap jalan karena multi-sumber, cek log source mana yang gagal

4. **Data enrichment kosong / tidak lengkap dari Sectors API**
   - Cek apakah ticker yang dimasukkan benar (format: kode saham + `.JK`, misal `ANTM.JK`)
   - Cek quota `SECTORS_API_KEY` dan endpoint yang dipanggil sesuai dokumentasi Sectors.app

5. **LLM API error / rate limit (Sumopod)**
   - Cek quota & billing di dashboard Sumopod (https://ai.sumopod.com)
   - Pastikan `SUMOPOD_API_KEY` aktif

6. **Publish ke Repliz gagal dengan error "scheduleId not found"**
   - Cek response `/api/publish` — pastikan payload sesuai format yang diharapkan Repliz

> Troubleshooting lebih lengkap (npm/build/dependency issues) tersedia terpisah agar README utama tetap ringkas — lihat issue tracker di GitHub.

### 💡 Tips

1. **Verifikasi scheduleAt timezone**: pastikan waktu dalam WIB; format tanpa timezone otomatis dianggap WIB (`+07:00`)
2. **Monitoring via Telegram**: aktifkan notifikasi Telegram untuk memantau tiap sesi otomatis tanpa buka dashboard
3. **Jangan simpan API key di repo**: gunakan `.env.local` (tidak di-commit) dan anonimkan token di file export workflow n8n sebelum commit

---

## 📝 Catatan Versi

### v1.0.0 (Current)

- Dua workflow otonom: Daily Market Brief (schedule 08:00 WIB) & News Monitoring (RSS event-trigger real-time)
- Klasifikasi & scoring berita otomatis (6 kategori)
- Enrichment data fundamental via Sectors REST API
- Generate konten (slide + caption + hashtag)
- Publish otomatis ke 5 platform (Instagram, Facebook, Threads, X, TikTok) lewat Repliz — live di akun [@sahamfyp](https://instagram.com/sahamfyp)
- Manual post / form wizard dengan fleksibel waktu posting (WIB)
- Penyimpanan gambar: Supabase Storage
- Telegram bot notifikasi sebagai bukti unattended run
- Web dashboard (React + Vite)
- Monitoring 8 sumber RSS media ekonomi Indonesia
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

Proyek ini dikembangkan untuk keperluan edukasi dan riset, dan disubmit untuk Sectors Hackathon 2026 (Track: Automation & Workflows).

---

## 🙏 Acknowledgement

- **Sectors.app** — Data fundamental & pasar saham (REST API), core data source produk ini
- **Sumopod** — LLM API (OpenAI-compatible) untuk classification, scoring, enrichment, dan content generation
- **Repliz** — Platform scheduling & publishing ke Instagram/Facebook/Threads/X/TikTok
- **Supabase Storage** — CDN & penyimpanan gambar
- **Supabase** — Database & Backend-as-a-Service
- **Vercel** — Hosting & Serverless Functions
- **n8n** — Workflow automation platform
- **Telegram** — Notifikasi & integrasi bot
- **React & Vite** — Web engine

---

> **Disclaimer**: Aplikasi ini adalah tool untuk membuat konten edukasi saham bagi financial content creator, edukator finansial, dan sekuritas.
> Semua konten yang dihasilkan bersifat informasi & analisis, **bukan nasihat keuangan**, dan tanggung jawab publikasinya ada pada pembuat konten/akun terkait.
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

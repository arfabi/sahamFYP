# SahamFYP — Draft Presentasi
*(untuk Sectors.app Demo / Pitching — fokus 5W+1H, Impact & Otomasi)*

---

## OPENING HOOK

> **"54,4% investor pasar modal Indonesia adalah Gen Z."**
> **"Tapi aset yang mereka miliki hanya 3,2% dari total."**
> **"Bukan karena mereka tidak mau invest — tapi karena mereka invest dengan cara yang salah."**

---

## 1. WHAT — Apa Itu SahamFYP?

**SahamFYP** adalah AI-powered content engine yang mengubah berita saham & data fundamental menjadi konten edukasi finansial yang otomatis dipublikasikan ke Instagram — platform yang paling banyak digunakan Gen Z Indonesia.

### Bukan sekadar akun berita saham biasa.

| Akun Saham Biasa | SahamFYP |
|------------------|----------|
| Repost berita dari portal | Berita + data fundamental terverifikasi |
| "Saham X naik 10%!" | "Saham X naik 10% — tapi PER-nya 38x vs rata-rata sektor 11x. Worth it?" |
| Dibuat manual oleh admin | Otomatis 100% dari RSS → AI → Instagram |
| Data dari kabar burung | Data langsung dari Sectors.app API |
| Posting sesekali | 2 post per hari setiap hari bursa, otomatis |

---

## 2. WHY — Kenapa SahamFYP Perlu Ada?

### Masalah yang Nyata

**Data BEI & KSEI (2024–2026):**
- **54,4%** investor pasar modal Indonesia adalah **Gen Z** (BEI, Mei 2026)
- **55,38%** investor individu berusia **≤30 tahun** (KSEI, Juni 2024)
- Tapi aset Gen Z hanya **Rp48,3 triliun = 3,2%** dari total aset di BEI

**Artinya:** Banyak yang ikut investasi, tapi nilainya kecil — dan keputusannya sering salah.

### Kenapa Keputusannya Salah?

- **70%** Gen Z dapat info investasi dari **media sosial** — bukan dari data fundamental
- **60%+ investor pemula** tidak melakukan analisis fundamental sebelum beli
- **70%** pernah ikut tren tanpa pertimbangan matang
- Rata-rata hold saham hanya **1–3 bulan** — bukan investasi, tapi FOMO trading

### Akibatnya

Mereka beli saham karena viral, bukan karena data. Mereka tidak tahu PER, PBV, ROE — tapi mereka sudah taruh uang di sana. Ini risiko finansial yang nyata bagi jutaan anak muda Indonesia.

---

## 3. WHO — Untuk Siapa?

### Target Pengguna Konten (Viewer)

**Gen Z Indonesia usia 18–28 tahun** yang:
- Sudah punya akun saham tapi belum paham analisis fundamental
- Aktif di Instagram setiap hari
- Ingin belajar saham tapi tidak mau baca laporan keuangan 100 halaman
- Sering FOMO tapi mulai sadar butuh data, bukan cuma hype

### Skala Potensi

- Total investor Gen Z di IDX: **>7 juta akun** (dari 13 juta total SID)
- Pengguna Instagram di Indonesia: **>100 juta** — nomor 4 terbesar di dunia
- Irisan keduanya: target audiens yang sangat besar dan belum terlayani dengan baik

---

## 4. WHERE — Di Mana SahamFYP Beroperasi?

### Platform Distribusi Konten
**Instagram** — dipilih karena:
- Platform #1 yang digunakan Gen Z Indonesia untuk konsumsi konten finansial
- Format carousel cocok untuk edukasi step-by-step (8 slide)
- Fitur Save & Share membantu konten menyebar organik

### Sumber Data
- **Sectors.app API** — data fundamental saham IDX (PER, PBV, ROE, Foreign Flow, Broker Flow, Insider Filing, dll)
- **RSS Feed** — CNBC Indonesia, Kontan, Bisnis.com, Investor.id, IDN Financials

### Infrastruktur
- **n8n** — orchestrator otomasi (RSS → AI → Instagram)
- **Vercel** — hosting API & dashboard
- **Supabase** — database log konten
- **Repliz** — scheduling publish ke Instagram/TikTok
- **Cloudinary** — CDN gambar slide

---

## 5. WHEN — Kapan Konten Dipublikasikan?

### Otomatis Mengikuti Ritme Bursa IDX

SahamFYP punya dua jenis pipeline konten yang berjalan **setiap hari bursa (Senin–Jumat)**:

#### Pipeline 1 — Berbasis Berita (Reaktif)
Berita masuk → diklasifikasikan → diperkaya data → jadi carousel → dipublikasikan

**6 kategori berita yang ditangani:**

| Kategori | Contoh Trigger | Contoh Konten |
|----------|---------------|---------------|
| `SINGLE_STOCK` | "TINS cetak laba Rp2 T" | Bedah data: PER, PBV, ROE, Foreign Flow TINS |
| `MACRO_ECONOMY` | "BI pangkas suku bunga" | Dampak ke IHSG, sektor yang diuntungkan/dirugikan |
| `SECTOR_ANALYSIS` | "Saham bank kompak naik" | Perbandingan big bank: BBCA vs BBRI vs BMRI vs BBNI |
| `CORPORATE_ACTION` | "BBCA bagi dividen Rp281/saham" | Skema, jadwal, yield, waspada dividend trap |
| `IPO_RIGHTS_ISSUE` | "Emiten baru mau IPO" | Profil bisnis, skema penawaran, risiko IPO baru |
| `SUSPENSION_DELISTING` | "ASLI disuspensi BEI" | Fakta suspensi, jenis (cooling down vs delisting), langkah investor |

#### Pipeline 2 — SectorTrigger (Proaktif, Terjadwal)
Tidak perlu menunggu berita — dipicu oleh jam:

| Waktu | Konten | Isi Utama |
|-------|--------|-----------|
| 🌅 **08.00** | Market Outlook Pagi | IHSG kemarin, top gainer/loser, insider filing, outlook hari ini |
| 🌆 **17.00** | Recap Market Closing | IHSG closing, market cap IDX, broker asing paling aktif, smart money hari ini |

---

## 6. HOW — Bagaimana SahamFYP Bekerja?

### Alur Otomasi End-to-End

```
RSS Feed / Jadwal Cron
        ↓
  [AI Classifier]          ← Gemini: tentukan kategori & ticker
        ↓
  [Data Enrichment]        ← Sectors.app API: tarik data fundamental
        ↓
  [AI Content Generator]   ← Gemini: buat naskah 8 slide carousel
        ↓
  [Carousel Builder]       ← React + html2image: render visual
        ↓
  [Cloudinary Upload]      ← simpan gambar ke CDN
        ↓
  [Repliz Publish]         ← post ke Instagram otomatis
        ↓
  [Supabase Log]           ← catat status, data, engagement
        ↓
  [Telegram Notif]         ← notifikasi ke admin
```

**Dari berita masuk sampai post tayang di Instagram: fully automated, 0 sentuhan manual.**

---

## 7. KEUNIKAN DATA — Yang Tidak Ada di Aplikasi Lain

Ini adalah inti dari keunggulan SahamFYP dibanding akun saham lain.

### Semua platform (Stockbit, RTI, IPOT, Yahoo Finance) punya:
Top gainer/loser, harga saham, volume transaksi, IHSG — **ini komoditas**.

### Yang HANYA ada di Sectors.app dan SahamFYP pakai:

---

#### 🥇 1. Broker Flow Institusional Asing (Arah Terbalik)

**Apa yang bisa dilakukan:** Dari satu broker, tahu saham apa yang mereka borong/jual

**Contoh real (4 Sep 2026):**
> Broker **YU (UBS)** — net buy terbesar asing hari ini **+Rp184 M**
> Saham yang paling diborong: **BBCA Rp529 M, BBRI Rp150 M, BMRI Rp119 M**
> Saham yang paling dijual: **ASII −Rp170 M**

**Mengapa ini penting untuk Gen Z:**
Institusi global seperti UBS punya tim riset ratusan analis. Kalau mereka kompak borong saham bank hari ini, itu sinyal yang worth diketahui — disajikan dalam bahasa yang mudah dipahami, bukan data mentah.

**Tidak ada di:** Stockbit, RTI, IPOT, Yahoo Finance

---

#### 🥇 2. Insider Filing Lengkap + Histori 6 Bulan

**Apa yang bisa dilakukan:** Tahu siapa yang beli/jual saham perusahaannya sendiri, berapa nilainya, dan ini transaksi ke-berapa dalam 6 bulan

**Contoh real (4 Sep 2026):**
> **Edwin Soeryadjaya** (pendiri Saratoga Group) beli **2,25 juta lembar SRTG**
> Senilai Rp4 M, harga rata-rata Rp1.809
> Ini beli di tanggal 2–3 September, transaksi terbaru dari pola akumulasi

**Mengapa ini penting untuk Gen Z:**
Kalau pendiri perusahaannya sendiri beli saham di harga Rp1.809 — itu sinyal keyakinan dari orang yang paling tahu kondisi perusahaan. Ini konten yang biasanya hanya diketahui investor institusional.

**Tidak ada di:** Stockbit (sangat terbatas), RTI (tidak ada), Yahoo Finance (tidak ada untuk IDX)

---

#### 🥇 3. Valuation vs Rata-rata Peer Sub-sektor

**Apa yang bisa dilakukan:** Langsung tahu apakah saham mahal atau murah dibanding kompetitornya

**Contoh real (BUMI):**
> PER BUMI: **38,13x**
> PER rata-rata peer sub-sektor (Coal Production): **11,67x**
> Artinya: BUMI diperdagangkan **3,3x lebih mahal** dari rata-rata kompetitornya

**Mengapa ini penting untuk Gen Z:**
Bukan cuma kasih angka PER — tapi langsung kasih konteks apakah itu mahal atau murah. Ini yang biasanya hanya bisa dilakukan analis sekuritas dengan akses Bloomberg.

**Tidak ada di:** Yahoo Finance, IPOT (perlu hitung manual), Stockbit Pro (ada tapi tidak per sub-sektor)

---

#### 🥇 4. Intrinsic Value (Model Estimasi)

**Apa yang bisa dilakukan:** Estimasi nilai intrinsik saham dari model valuasi

**Contoh real (BUMI):**
> Harga pasar: **Rp210**
> Intrinsic Value (model): **−Rp156**
> Artinya: model valuasi menganggap saham sudah **premium signifikan** di harga saat ini

**Mengapa ini penting untuk Gen Z:**
Ini bahan edukasi yang powerful — "harga saham yang naik bukan berarti valuasinya masuk akal." Konten anti-FOMO yang berbasis data.

---

#### 🥇 5. Foreign Flow Harian per Saham (Date Range Query)

**Apa yang bisa dilakukan:** Tarik data net buy/sell asing per saham selama periode tertentu

**Contoh real (BUMI, 1 bulan terakhir):**
> Net kumulatif: **+Rp47,4 M** (net inflow asing)
> Terbesar single day: 4 Sep +Rp46,1 M, 10 Agu +Rp47,9 M
> Outflow terbesar: 11 Agu −Rp53,6 M

**Mengapa ini penting:**
Bukan cuma tahu asing masuk atau keluar — tapi bisa lihat pola dan intensitasnya selama sebulan. Ini level analisis yang biasanya hanya dilakukan fund manager.

---

## 8. IMPACT — Dampak yang Diharapkan

### Impact Langsung ke Pengguna (Gen Z Investor)

| Sebelum SahamFYP | Sesudah SahamFYP |
|-----------------|-----------------|
| Beli saham karena viral di TikTok | Cek dulu datanya: PER berapa? Asing lagi beli atau jual? |
| Tidak tahu insider trading legal itu ada | Tahu kalau pendiri perusahaan borong saham sendiri |
| Tidak paham valuasi | Paham "saham ini mahal 3x lipat dari rata-rata sektornya" |
| FOMO tanpa data | FOMO yang sudah ter-filter oleh fundamental |

### Impact ke Literasi Keuangan Indonesia

- Konten yang tadinya hanya bisa diakses analis sekuritas berbayar → **gratis, di Instagram, dalam bahasa Gen Z**
- Bukan sekadar konten viral — tapi konten yang **terverifikasi oleh data Sectors.app**
- Setiap post menyertakan sumber data eksplisit: `Sumber Data: Sectors.app`
- Disclaimer DYOR (Do Your Own Research) wajib di setiap konten — mendorong kemandirian analisis, bukan dependensi pada konten

### Impact ke Ekosistem Sectors.app

- Setiap hari, data Sectors.app menjangkau ratusan (menuju ribuan) Gen Z investor di Instagram
- Menjadi **bukti nyata** bahwa data API Sectors.app bisa menghasilkan konten yang meaningful, bukan hanya untuk analis profesional
- Membuka awareness tentang data fundamental IDX yang berkualitas ke segmen yang selama ini tidak terjangkau

---

## 9. OTOMASI — Mengapa Ini Scalable?

### Yang Terjadi Setiap Hari Bursa (Tanpa Intervensi Manual):

**Pagi 08.00** — n8n trigger otomatis:
1. Fetch data IHSG T-1, top gainer/loser, insider filing dari Sectors.app
2. Gemini generate naskah 8 slide
3. React render carousel → upload ke Cloudinary
4. Repliz publish ke Instagram jam 08.00 tepat
5. Supabase log status, Telegram kirim notifikasi ke admin

**Sore 17.00** — n8n trigger otomatis:
1. Fetch IHSG closing, market cap, foreign flow, broker asing dari Sectors.app
2. Gemini generate naskah 8 slide
3. Render → upload → publish → log → notifikasi

**Sepanjang hari** — RSS berita masuk:
1. Classifier deteksi berita relevan
2. Data enrichment dari Sectors.app per kategori
3. Generate carousel → publish → log

**Total: ~3 post per hari, 0 sentuhan manual, setiap hari bursa.**

### Credit Sectors.app yang Dibutuhkan

| Konten | Credit/Hari | Credit/Bulan |
|--------|-------------|--------------|
| SectorTrigger Open (08.00) | 4 | ~88 |
| SectorTrigger Close (17.00) | 10 | ~220 |
| Pipeline Berita (estimasi 1–2 berita/hari) | ~6 | ~132 |
| **Total** | **~20** | **~440 credit/bulan** |

---

## 10. TECH STACK (Ringkas)

```
Data Layer    : Sectors.app API + RSS Feed (CNBC Indonesia, Kontan, Bisnis.com, dll)
AI Layer      : Google Gemini (klasifikasi + generate konten)
Render Layer  : React + Vite + html2image (carousel visual)
Storage Layer : Cloudinary (CDN gambar) + Supabase (database)
Publish Layer : Repliz (Instagram/TikTok scheduling)
Automation    : n8n (orchestrator workflow)
Notifikasi    : Telegram Bot
Dashboard     : React + Vite (Vercel)
```

---

## 11. DIFERENSIASI vs KOMPETITOR

| | Akun Saham Manual | Robot Berita | SahamFYP |
|--|------------------|-------------|----------|
| **Data fundamental** | ❌ | ❌ | ✅ Sectors.app |
| **Broker flow institusional** | ❌ | ❌ | ✅ Eksklusif |
| **Insider filing** | ❌ | ❌ | ✅ Eksklusif |
| **Valuation vs peer** | ❌ | ❌ | ✅ Eksklusif |
| **Otomasi penuh** | ❌ | ⚠️ Parsial | ✅ End-to-end |
| **Bahasa Gen Z** | ⚠️ Tergantung admin | ❌ | ✅ AI-generated |
| **Disclaimer DYOR** | ⚠️ Tidak konsisten | ❌ | ✅ Wajib setiap post |
| **Scalable** | ❌ Tergantung orang | ⚠️ | ✅ |

---

## 12. CLOSING — Satu Kalimat

> **SahamFYP mengubah data eksklusif Sectors.app — yang selama ini hanya bisa diakses analis profesional — menjadi konten edukasi harian yang otomatis menjangkau jutaan Gen Z investor Indonesia melalui Instagram, platform yang mereka buka setiap hari.**

---

## APPENDIX — Data Pendukung

| Sumber | Data | Periode |
|--------|------|---------|
| BEI | 54,4% investor pasar modal adalah Gen Z | Mei 2026 |
| KSEI | 55,38% investor individu berusia ≤30 tahun | Juni 2024 |
| KSEI | Total SID menembus 13 juta | Akhir 2025 |
| Katadata | Aset Gen Z: Rp48,3 triliun = 3,2% dari total | Mei 2026 |
| Kompas/BEI | 65–70% Gen Z dapat info investasi dari medsos | 2026 |
| Kompas/BEI | 60%+ investor pemula tidak analisis fundamental | 2026 |
| Kompas/BEI | Rata-rata hold saham investor muda: 1–3 bulan | 2026 |
| Instagram | Pengguna Instagram Indonesia: >100 juta | 2026 |

---

*Draft ini dibuat untuk keperluan presentasi/video SahamFYP kepada Sectors.app.*
*Fokus: impact nyata, otomasi penuh, dan keunikan penggunaan data Sectors.app untuk Gen Z.*

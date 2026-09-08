# STRUKTUR KONTEN CAROUSEL — 6 Kategori @sahamfyp
*(v1 — Referensi template slide per kategori berita, lengkap dengan contoh isi & endpoint Sectors.app)*

Dokumen ini adalah referensi desain konten untuk **Carousel Builder (React + Vite + html2image)**
dan **LLM Naskah Generator (LLM 2)**. Setiap kategori berita memiliki susunan slide, nama
type, contoh isi, dan endpoint Sectors.app yang dipakai.

**Legenda endpoint:**
- ✅ = endpoint utama, wajib dipanggil
- 🔁 = endpoint pelengkap, opsional tergantung konteks berita
- ❌ = tidak ada data dari Sectors.app, 100% dari teks berita RSS

---

## 1. SINGLE_STOCK — Analisis Emiten Tunggal

> Contoh kasus: **BUMI** (Bumi Resources Tbk) — berita ekspansi/kinerja keuangan

| No | Type | Nama Slide | Contoh Isi | Endpoint Sectors.app |
|----|------|------------|------------|----------------------|
| 1 | `COVER` | Cover | Headline: *"BUMI Laba Bersih Naik 24%! Saatnya Masuk? 🤔"* — Sub: *"Bedah datanya dulu sebelum FOMO"* | ❌ |
| 2 | `TLDR` | Ringkasan Cepat | • EPS naik dari Rp2,94 → Rp3,65 (+24% YoY)<br>• Asing net beli Rp47,4 M sebulan terakhir<br>• PER 38x vs rata-rata peer 11,67x — valuasi premium | ❌ |
| 3 | `KRONOLOGI` | Kronologi Kejadian | Narasi singkat konteks berita (apa yang terjadi, kapan, siapa) + `Sumber: [Nama Media] — [URL]` | ❌ |
| 4 | `BEDAH_DATA` | Bedah Data | PER: 38,13x *(waktu balik modal ~38 tahun)*<br>PBV: 2,62x *(harga saham 2,6× aset bersihnya)*<br>ROE: 2,81% \| ROA: 1,92%<br>EPS TTM: Rp3,65<br>Foreign Flow +1M: +Rp47,4 M<br>`Sumber Data: Sectors.app` | ✅ `fetch-company-report` (sections: `valuation`, `financials`)<br>✅ `fetch-foreign-flow` |
| 5 | `PROS` | Sisi Positif | **Point:** *"Foreign Inflow Positif Sebulan Terakhir"*<br>**Explanation:** *"Asing net beli Rp47,4 M sebulan terakhir — ibarat orang luar negeri yang mulai nabung di 'warung' lo lagi, biasanya ini sinyal optimisme jangka pendek."*<br><br>**Point:** *"EPS Tumbuh 24% Tahun Ini"*<br>**Explanation:** *"Laba per saham naik dari Rp2,94 ke Rp3,65 — kayak gaji lo naik 24% tahun ini. Arah pertumbuhannya positif meski nominalnya masih kecil."* | ✅ `fetch-company-report` (section: `financials`, `ownership`)<br>✅ `fetch-foreign-flow` |
| 6 | `CONS` | Sisi Risiko | **Point:** *"Valuasi Jauh di Atas Rata-Rata Sektor"*<br>**Explanation:** *"PER BUMI 38x vs rata-rata peer 11,67x — ibarat beli gorengan 5× lipat harga sebelah yang rasanya mirip. Risikonya gede kalau ekspektasi pasar meleset."*<br><br>**Point:** *"Tidak Ada Dividen"*<br>**Explanation:** *"BUMI belum bagi dividen sama sekali. Kalau lo tipe investor yang ngarep 'THR tahunan' dari saham, BUMI belum bisa kasih itu sekarang."* | ✅ `fetch-company-report` (section: `valuation`, `dividend`) |
| 7 | `KESIMPULAN` | Kesimpulan | Rangkuman edukatif netral — cocok buat investor tipe apa, tidak mengajak beli/jual | ❌ |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Gimana menurutmu soal BUMI? Drop di kolom komentar 👇"* + disclaimer DYOR | ❌ |

**Data enrichment utama:** `fetch-company-report` (sections: `overview`, `valuation`, `financials`, `future`, `dividend`, `ownership`) + `fetch-foreign-flow`

---

## 2. MACRO_ECONOMY — Makro Ekonomi & Tren Pasar

> Contoh kasus: **BI Pangkas Suku Bunga ke 5,25%** — dampak ke IHSG & pasar

| No | Type | Nama Slide | Contoh Isi | Endpoint Sectors.app |
|----|------|------------|------------|----------------------|
| 1 | `COVER` | Cover | Headline: *"BI Pangkas Suku Bunga ke 5,25%, IHSG Auto Ngegas! 🚀"* — Sub: *"Efeknya ke Portofolio Lo Gimana?"* | ❌ |
| 2 | `TLDR` | Ringkasan Cepat | • BI pangkas suku bunga 25bps jadi 5,25%<br>• IHSG melonjak ke 6.667 — level tertinggi 2 pekan<br>• Total market cap IDX tembus Rp11.637 Triliun | ❌ (angka berasal dari API di slide 4) |
| 3 | `KRONOLOGI` | Kronologi Kejadian | Konteks RDG BI, kapan diputuskan, latar belakang kebijakan + `Sumber: [Nama Media] — [URL]` | ❌ |
| 4 | `DAMPAK_PASAR` | Dampak ke Pasar | IHSG: 6.667,89 (+1,1%)<br>Market Cap IDX: Rp11.637 T (naik dari Rp11.521 T)<br>Top Gainer: SMMT +24,8%, NATO +24,6%, PKPK +17,4%<br>Top Loser: TAPG -5,1%, CMRY -5,4%<br>`Sumber Data: Sectors.app` | ✅ `fetch-index-daily` (index_code: `ihsg`)<br>✅ `fetch-idx-market-cap`<br>✅ `fetch-companies-top-changes` (periods: `1d`, classifications: `top_gainers`, `top_losers`) |
| 5 | `DIUNTUNGKAN` | Yang Diuntungkan | **Point:** *"Saham Perbankan & Consumer Finance"*<br>**Explanation:** *"Bunga acuan turun → bank ikut turunin bunga kredit → cicilan KPR bisa turun jutaan per bulan. Makin banyak orang berani ngajuin kredit, makin gede potensi cuan bank dari volume kreditnya."*<br><br>**Point:** *"Saham Properti"*<br>**Explanation:** *"Bunga KPR turun = cicilan rumah makin ringan buat calon pembeli. Yang tadinya ragu beli rumah karena bunga mahal, sekarang jadi lebih pede ambil KPR."* | 🔁 `fetch-companies-top-changes` (sub_sector: `banks`, `property`) |
| 6 | `PERLU_DIWASPADAI` | Perlu Diwaspadai | **Point:** *"Rally Tidak Merata ke Semua Saham"*<br>**Explanation:** *"TAPG & CMRY malah turun di hari yang sama. Jangan asal all-in cuma modal headline 'BI pangkas bunga' — cek dulu apakah bisnis emiten yang lo pegang memang sensitif ke suku bunga."*<br><br>**Point:** *"Efek ke Nilai Tukar Rupiah"*<br>**Explanation:** *"Bunga RI turun sementara bunga AS masih tinggi → investor asing bisa pindahkan dana ke dolar. Rupiah bisa tertekan, bikin bahan baku impor jadi lebih mahal buat industri."* | 🔁 `fetch-companies-top-changes` (top_losers) |
| 7 | `KESIMPULAN` | Kesimpulan | Dampak jangka pendek vs panjang, sektor mana yang perlu dipantau, tone netral | ❌ |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Menurut lo, sektor mana yang paling untung dari rate cut ini?"* + disclaimer DYOR | ❌ |

**Data enrichment utama:** `fetch-index-daily` + `fetch-idx-market-cap` + `fetch-companies-top-changes`
**Catatan:** Data suku bunga BI/inflasi/kurs murni dari teks berita RSS — tidak ada di Sectors.app.

---

## 3. SECTOR_ANALYSIS — Analisis & Rotasi Sektor

> Contoh kasus: **Sektor Perbankan** — rotasi dana, tren valuasi, perbandingan big bank

| No | Type | Nama Slide | Contoh Isi | Endpoint Sectors.app |
|----|------|------------|------------|----------------------|
| 1 | `COVER` | Cover | Headline: *"Saham-Saham Bank Balik Ngegas! +5,8% Seminggu 📈"* — Sub: *"Worth It Buat Masuk Sekarang?"* | ❌ |
| 2 | `TLDR` | Ringkasan Cepat | • Market cap sektor perbankan naik 5,8% sepekan<br>• YTD sektor masih -14,6%<br>• Earning sektor diproyeksikan rebound +16,7% di 2026 | ❌ (angka dari API di slide 4) |
| 3 | `KRONOLOGI` | Kronologi Kejadian | Konteks pemicu rotasi dana (sentimen BI, global, apa trigger-nya) + `Sumber: [Nama Media] — [URL]` | ❌ |
| 4 | `DATA_SEKTOR` | Data Sektor | **Agregat Sektor:**<br>Total Market Cap: Rp2.515 T \| 48 Emiten<br>PE Median: 10,3x \| PE Rata-rata: 20,1x<br>Earning Growth 2025: -17,2% → Forecast 2026: +16,7%<br><br>**Perbandingan Big Bank:**<br>`BBCA` Rp817,7 T \| PE 17,1x \| PB 3,50x<br>`BBRI` Rp508,6 T \| PE 9,7x \| PB 1,66x<br>`BMRI` Rp408,4 T \| PE 8,4x \| PB 1,44x<br>`BBNI` Rp145,5 T \| PE 8,1x \| PB 0,92x<br>`Sumber Data: Sectors.app` | ✅ `fetch-subsector-report` (sections: `statistics`, `market_cap`, `growth`, `valuation`, `companies`)<br>✅ `fetch-companies-by-subsector` (order_by: `-market_cap`, limit: 4-5) |
| 5 | `SAHAM_JAGOAN` | Saham Jagoan Sektor | **Point:** *"PE Median Sektor Masih Murah"*<br>**Explanation:** *"PE median bank 10,3x vs rata-ratanya 20,1x — kesenjangan ini muncul karena ada beberapa saham bank yang valuasinya ekstrem tinggi, 'narik' rata-ratanya ke atas. Mayoritas saham bank sebenarnya masih di valuasi wajar."*<br><br>**Point:** *"Top Gainer Sepekan: BSIM +68%"*<br>**Explanation:** *"Bank Sinarmas (BSIM) jadi top gainer sektor minggu ini. Small-cap bank yang tiba-tiba melesat setinggi ini biasanya volatil banget — bisa naik cepet, bisa turun cepet juga."* | ✅ `fetch-companies-top-changes` (sub_sector: `banks`, periods: `7d`, top_gainers)<br>🔁 `fetch-most-traded-stocks` (sub_sector: `banks`) |
| 6 | `PERLU_DIWASPADAI` | Perlu Diwaspadai | **Point:** *"Big Bank Tidak Semurah Kelihatannya"*<br>**Explanation:** *"BBCA PBV 3,5x vs BBNI 0,92x — hampir 4× lipat bedanya. Market cap gede bukan jaminan valuasinya paling masuk akal. Harus pilih-pilih emiten, nggak bisa asal beli 'saham bank' secara general."*<br><br>**Point:** *"YTD Sektor Masih Merah -14,6%"*<br>**Explanation:** *"Rally sepekan terakhir jangan bikin lupa bahwa YTD sektor masih minus 14,6%. Momentum jangka pendek ≠ reversal jangka panjang — cek dulu tren yang lebih panjang sebelum FOMO."* | ✅ `fetch-subsector-report` (section: `market_cap`) |
| 7 | `KESIMPULAN` | Kesimpulan | Rotasi sektor menarik jangka pendek, tapi seleksi emiten tetap krusial — bukan asal beli sektor | ❌ |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Saham bank mana yang lagi lo pantau? Komen di bawah 👇"* + disclaimer DYOR | ❌ |

**Data enrichment utama:** `fetch-subsector-report` + `fetch-companies-by-subsector` + `fetch-companies-top-changes`
**Catatan:** `sub_sector` wajib dalam format kebab-case slug (mis. `banks`, `oil-gas-coal`).

---

## 4. CORPORATE_ACTION — Dividen, RUPS, Buyback

> Contoh kasus: **BBCA** — RUPST 2026, dividen Rp336/saham + rencana buyback Rp5 T

| No | Type | Nama Slide | Contoh Isi | Endpoint Sectors.app |
|----|------|------------|------------|----------------------|
| 1 | `COVER` | Cover | Headline: *"BBCA Bagi Dividen Rp336/Saham + Buyback Rp5 T! 💰"* — Sub: *"Simak Jadwal & Skemanya"* | ❌ |
| 2 | `TLDR` | Ringkasan Cepat | • RUPST setujui dividen tunai Rp336/saham dari laba 2025<br>• Buyback saham disetujui, budget maks Rp5 Triliun<br>• Ex-date: 30 Mar 2026 \| Payment: 8 Apr 2026 | ❌ (detail dari API di slide 4) |
| 3 | `KRONOLOGI` | Kronologi Kejadian | Kapan RUPST digelar, agenda apa saja yang dibahas + `Sumber: [Nama Media] — [URL]` | ❌ |
| 4 | `DETAIL_AKSI` | Detail Aksi Korporasi | **Jenis Aksi:** Dividen Tunai + Buyback<br>**Nilai Dividen:** Rp336/saham (interim Rp55 + final Rp281)<br>**Dividend Yield TTM:** ~2,5%<br>**Ex-Date:** 30 Mar 2026 \| **Payment:** 8 Apr 2026<br>**Buyback:** Maks Rp5 Triliun<br>**Payout Ratio:** ~45%<br>`Sumber Data: Sectors.app` | ✅ `fetch-corporate-actions` (riwayat dividen, agenda RUPS)<br>✅ `fetch-company-report` (section: `dividend` — yield TTM, payout ratio)<br>🔁 `fetch-free-float` (jika ada buyback) |
| 5 | `UNTUNG_BUAT_INVESTOR` | Untung Buat Investor | **Point:** *"Dividen Konsisten Tiap Tahun"*<br>**Explanation:** *"BBCA rutin bagi dividen setiap tahun dengan yield ~2-3% — ibarat lo dapat 'THR' yang bisa diprediksi waktunya. Bukan yang paling gede, tapi bisa diandalkan."*<br><br>**Point:** *"Buyback Bisa Dorong Harga Saham"*<br>**Explanation:** *"Buyback Rp5 T artinya BBCA beli sahamnya sendiri dari pasar → saham beredar berkurang → EPS per saham jadi lebih besar. Biasanya direspons positif sama harga saham."* | ✅ `fetch-company-report` (section: `dividend`) |
| 6 | `PERLU_DIPERHATIKAN` | Perlu Diperhatikan | **Point:** *"Yield 2-3% Kalah dari Deposito"*<br>**Explanation:** *"Dengan bunga deposito/obligasi pemerintah yang lebih tinggi sekarang, yield BBCA ~2-3% terlihat kurang menarik kalau tujuan lo murni cari passive income. Cocokkan sama tujuan investasi lo dulu."*<br><br>**Point:** *"Timeline Buyback Belum Pasti"*<br>**Explanation:** *"RUPST baru nyetujuin 'rencana' buyback maks Rp5 T — kapan, berapa banyak, di harga berapa, belum ada jadwal pasti. Jangan asumsikan efeknya langsung terasa ke harga besok."* | 🔁 `fetch-corporate-actions` |
| 7 | `KESIMPULAN` | Kesimpulan | Cocok buat investor yang cari stabilitas & dividen konsisten — bukan buat cari yield tinggi atau cuan cepat | ❌ |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Lo tipe investor dividen atau growth? Mana yang lebih worth buat lo?"* + disclaimer DYOR | ❌ |

**Data enrichment utama:** `fetch-corporate-actions` + `fetch-company-report` (section: `dividend`)
**Catatan:** Slide 4 (`DETAIL_AKSI`) bersifat adaptif — tampilkan hanya jenis aksi yang disebut di berita (bisa 1, 2, atau ketiganya). Jangan tampilkan field yang tidak ada datanya.

---

## 5. IPO_RIGHTS_ISSUE — IPO, Right Issue, Stock Split

> Kategori ini memiliki **2 skenario** berbeda tergantung apakah emiten sudah listing atau belum.

---

### 5A. Right Issue / Stock Split (Emiten Sudah Listing)

> Contoh kasus: **ELPI** — Right Issue HMETD, target dana Rp739 M

| No | Type | Nama Slide | Contoh Isi | Endpoint Sectors.app |
|----|------|------------|------------|----------------------|
| 1 | `COVER` | Cover | Headline: *"ELPI Right Issue! Incar Dana Rp739 Miliar 💸"* — Sub: *"Lo Dapat Hak Beli Saham Baru — Mau Diapain?"* | ❌ |
| 2 | `TLDR` | Ringkasan Cepat | • ELPI terbitkan 2,03 miliar saham baru (rasio 200:57)<br>• Harga pelaksanaan Rp350/saham<br>• Target dana Rp739,34 M untuk ekspansi armada | ❌ |
| 3 | `KRONOLOGI` | Kronologi Kejadian | Konteks RUPS persetujuan, kapan pengumuman, timeline pelaksanaan + `Sumber: [Nama Media] — [URL]` | ❌ |
| 4 | `SKEMA_AKSI` | Skema Right Issue | **Jenis:** Right Issue (HMETD)<br>**Jumlah Saham Baru:** 2,03 Miliar lembar<br>**Harga Pelaksanaan:** Rp350/saham<br>**Rasio:** Tiap 200 saham lama → 57 HMETD<br>**Target Dana:** Rp739,34 M<br>**Record Date:** 5 Mei 2026<br>**Penggunaan Dana:** Ekspansi armada kapal<br>`Sumber Data: Sectors.app` | ✅ `fetch-corporate-actions` (field: `right_issue`)<br>🔁 `fetch-listing-performance` (performa harga sejak listing)<br>🔁 `fetch-free-float` (dampak dilusi) |
| 5 | `UNTUNG_BUAT_INVESTOR` | Untung Buat Investor | **Point:** *"Harga HMETD Biasanya di Bawah Harga Pasar"*<br>**Explanation:** *"Harga pelaksanaan Rp350 sementara harga pasar di atasnya — artinya lo bisa beli saham baru dengan harga lebih murah dari yang dijual di bursa sekarang. Ini keuntungan eksklusif buat pemegang saham lama."*<br><br>**Point:** *"Dana Buat Ekspansi Bisnis Nyata"*<br>**Explanation:** *"Dana Rp739 M akan dipakai buat tambah armada kapal — bukan bayar utang. Ekspansi armada langsung berkontribusi ke kapasitas pendapatan jangka panjang."* | 🔁 `fetch-company-report` (section: `overview`, `financials`) |
| 6 | `PERLU_DIWASPADAI` | Perlu Diwaspadai | **Point:** *"Dilusi Kepemilikan Kalau Tidak Tebus HMETD"*<br>**Explanation:** *"Kalau lo nggak tebus HMETD, porsi kepemilikan lo otomatis berkurang karena saham beredar nambah 2,03 miliar lembar — ibarat kue yang sama dipotong jadi lebih banyak, bagian lo per lembar jadi lebih kecil."*<br><br>**Point:** *"3 Pilihan Buat Pemegang HMETD"*<br>**Explanation:** *"Lo bisa: (1) tebus haknya, (2) jual hak-nya selama masih diperdagangkan, atau (3) biarin kedaluwarsa. Opsi ketiga rugi karena hak itu sebenarnya punya nilai — jangan diabaikan."* | 🔁 `fetch-free-float`<br>🔁 `fetch-shareholders-composition` |
| 7 | `KESIMPULAN` | Kesimpulan | Netral — cocok buat pemegang saham existing yang percaya rencana penggunaan dananya | ❌ |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Lo mau nebus HMETD ELPI atau jual haknya? Diskusi di sini 👇"* + disclaimer DYOR | ❌ |

---

### 5B. IPO Baru (Calon Emiten Belum Listing, `ticker: null`)

> Contoh kasus: Perusahaan jasa genset & menara telko, terafiliasi Grup Djarum

| No | Type | Nama Slide | Contoh Isi | Endpoint Sectors.app |
|----|------|------------|------------|----------------------|
| 1 | `COVER` | Cover | Headline: *"Ada Emiten Baru Terafiliasi Grup Djarum Mau IPO! 🏗️"* — Sub: *"Worth It Ikutan?"* | ❌ |
| 2 | `TLDR` | Ringkasan Cepat | • Bisnis jasa genset & maintenance menara telko (klien: Telkomsel, XL, Indosat)<br>• Laba bersih FY25 naik 97,5% jadi Rp155,6 M<br>• Terafiliasi keluarga Hartono (Grup Djarum), berdiri sejak 2006 | ❌ |
| 3 | `PROFIL_PERUSAHAAN` | Profil Perusahaan | Sekilas model bisnis, sejak kapan berdiri, siapa klien utamanya, posisi di industri + `Sumber: [Nama Media] — [URL]` | ❌ |
| 4 | `DETAIL_PENAWARAN` | Detail Penawaran IPO | Harga IPO (range/final), jumlah saham dilepas, target dana, penggunaan dana, jadwal listing, cara ikut (e-IPO)<br>**⚠️ Skip field yang tidak tersebut di berita — jangan dikarang** | ❌ **(100% dari teks berita/prospektus)** |
| 5 | `KENAPA_MENARIK` | Kenapa Menarik | **Point:** *"Growth Story yang Kuat"*<br>**Explanation:** *"Laba naik 97,5% dalam setahun — hampir 2× lipat. Untuk perusahaan yang main di infrastruktur digital (menara telko), demand-nya nggak akan kemana selama penetrasi internet terus tumbuh."*<br><br>**Point:** *"Didukung Grup Konglomerasi Besar"*<br>**Explanation:** *"Afiliasi Grup Djarum bukan jaminan, tapi backing dari konglomerasi besar biasanya berarti akses modal & jaringan klien lebih mudah — faktor yang sering jadi pembeda antara startup yang scale vs yang stuck."* | ❌ |
| 6 | `RISIKO` | Risiko | **Point:** *"Belum Ada Rekam Jejak Sebagai Perusahaan Publik"*<br>**Explanation:** *"Beda sama saham lama, IPO baru nggak punya histori harga buat dianalisis. Harga IPO bisa ARA (naik maksimal) di hari pertama, tapi bisa juga langsung anjlok begitu euforia mereda — dua-duanya sama mungkinnya."*<br><br>**Point:** *"Harga Penawaran Bisa Sudah Pricing In Ekspektasi Tinggi"*<br>**Explanation:** *"Underwriter biasanya set harga IPO di level yang cukup premium. Kalau growth story sudah ter-price di harga IPO-nya, potensi upside buat lo sebagai investor ritel bisa lebih terbatas dari yang kelihatan."* | ❌ |
| 7 | `KESIMPULAN` | Kesimpulan | Cocok buat investor yang paham risiko volatilitas tinggi di hari-hari awal listing & punya conviction sama story bisnisnya | ❌ |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Tertarik ikut IPO ini? Cek prospektusnya di e-IPO.co.id dulu 👇"* + disclaimer DYOR | ❌ |

**Catatan implementasi:** LLM wajib deteksi `ticker` dari output LLM 1 (Classifier). Kalau `ticker: null` → gunakan template 5B (PROFIL_PERUSAHAAN + DETAIL_PENAWARAN, 0 panggilan API Sectors.app). Kalau ada `ticker` → gunakan template 5A.

---

## 6. SUSPENSION_DELISTING — Suspensi & Delisting Saham

> Contoh kasus: **ASLI** (PT Asri Karya Lestari Tbk) — suspensi cooling down 4 Sep 2026

> ⚠️ Kategori ini adalah konten **alert/informatif urgent** — bukan konten ajak beli/jual.
> Slide 5 & 6 difokuskan ke edukasi mekanisme & langkah yang harus diambil investor, bukan PROS/CONS investasi.

| No | Type | Nama Slide | Contoh Isi | Endpoint Sectors.app |
|----|------|------------|------------|----------------------|
| 1 | `COVER` | Cover | Headline: *"⚠️ Saham ASLI Disuspensi BEI! Kenapa Tiba-Tiba Nggak Bisa Dijual?"* — Sub: *"Ini Penjelasannya"* | ❌ |
| 2 | `TLDR` | Ringkasan Cepat | • BEI suspensi ASLI mulai 4 Sep 2026 — alasan: lonjakan harga kumulatif signifikan<br>• Jenis: Cooling Down (sementara, bukan delisting)<br>• Harga terakhir Rp376, naik dari Rp139 (90-day low) dalam ~3 bulan | ❌ (detail dari API di slide 4) |
| 3 | `KRONOLOGI` | Kronologi Kejadian | Kapan BEI keluarkan pengumuman, apa alasan resminya, konteks pergerakan harga sebelumnya + `Sumber: IDX Notice — [URL PDF resmi dari fetch-suspensions]` | ✅ `fetch-suspensions` (field: `suspension_date`, `reason`, `pdf_url`) |
| 4 | `FAKTA_SUSPENSI` | Fakta Suspensi | **Tanggal Suspensi:** 4 Sep 2026<br>**Alasan Resmi BEI:** Peningkatan harga kumulatif signifikan (Cooling Down)<br>**Harga Terakhir:** Rp376<br>**52-Week Range:** Rp50 – Rp750<br>**90-Day Range:** Rp139 – Rp390<br>**Market Cap:** ~Rp2,35 Triliun<br>**Sektor:** Infrastruktur — Konstruksi & Teknik Sipil<br>`Sumber Data: Sectors.app` | ✅ `fetch-suspensions` (detail suspensi)<br>✅ `fetch-company-report` (section: `overview` — market cap, sektor, price range) |
| 5 | `APA_ITU_SUSPENSI` | Apa Itu Suspensi? | **Point:** *"BEI Suspensi untuk Lindungi Investor"*<br>**Explanation:** *"Kalau saham naik terlalu cepat & tajam tanpa berita jelas, BEI 'nge-pause' perdagangannya — ibarat wasit tiup peluit time-out biar semua pemain napas dulu & nggak ada yang ikut-ikutan beli di harga panas tanpa info yang cukup."*<br><br>**Point:** *"Cooling Down ≠ Delisting"*<br>**Explanation:** *"Banyak yang panik dan kira sahamnya bakal dihapus dari bursa. Cooling down itu sementara — biasanya dicabut dalam 1-2 hari setelah emiten kasih klarifikasi atau harga lebih stabil."* | ❌ |
| 6 | `YANG_PERLU_DILAKUKAN` | Yang Perlu Dilakukan | **Point:** *"Cek Pengumuman Resmi BEI Dulu"*<br>**Explanation:** *"Jangan asal percaya kabar dari grup WA/Telegram. Suspensi selalu disertai dokumen PDF resmi dari BEI — akses di idx.co.id atau link di caption post ini. Itu sumber paling akurat soal alasan & estimasi kapan dicabut."*<br><br>**Point:** *"Tahan Diri dari Panic Sell Begitu Dibuka"*<br>**Explanation:** *"Begitu suspensi dicabut, biasanya ada lonjakan order jual masif — harga bisa volatile ekstrem di menit-menit pertama. Tentukan strategi lo sebelum market buka, bukan pas harga udah bergerak liar."* | ❌ |
| 7 | `KESIMPULAN` | Kesimpulan | Suspensi cooling down = BEI jaga ketertiban pasar, bukan sinyal emiten bermasalah fundamental. Tapi kenaikan harga tanpa katalis jelas tetap perlu diwaspadai | ❌ |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Lo pegang ASLI? Atau penasaran soal suspensi ini? Tanya di kolom komentar 👇"* + link PDF resmi BEI + disclaimer DYOR | ❌ |

**Data enrichment utama:** `fetch-suspensions` + `fetch-company-report` (section: `overview`)

**Catatan — 3 Tipe Suspensi (Slide 5 Harus Menyesuaikan):**

| Tipe | Ciri | Penyesuaian Slide 5 (`APA_ITU_SUSPENSI`) |
|---|---|---|
| **Cooling Down** | Harga naik cepat tanpa katalis jelas | Edukasi mekanisme cooling down, sifat sementara, cara cek kapan dicabut |
| **Gagal Bayar / Default** | Obligasi/utang jatuh tempo tidak terbayar | Edukasi risiko fundamental lebih serius, kapan bisa diperdagangkan lagi, dampak ke bondholder vs stockholder |
| **Delisting / Force Delisting** | Pencabutan pencatatan dari bursa | Edukasi apa yang terjadi ke saham yang dipegang, hak buyback wajib oleh emiten, proses penyelesaian |

---

## RINGKASAN PERBANDINGAN 6 KATEGORI

| Kategori | Jumlah Slide | Slide Unik (Berbeda dari Single Stock) | Pakai Sectors.app? |
|---|---|---|---|
| SINGLE_STOCK | 8 | — (template acuan) | ✅ Intensif |
| MACRO_ECONOMY | 8 | Slide 4: `DAMPAK_PASAR`, Slide 5: `DIUNTUNGKAN`, Slide 6: `PERLU_DIWASPADAI` | ✅ Sedang |
| SECTOR_ANALYSIS | 8 | Slide 4: `DATA_SEKTOR`, Slide 5: `SAHAM_JAGOAN`, Slide 6: `PERLU_DIWASPADAI` | ✅ Intensif |
| CORPORATE_ACTION | 8 | Slide 4: `DETAIL_AKSI`, Slide 5: `UNTUNG_BUAT_INVESTOR`, Slide 6: `PERLU_DIPERHATIKAN` | ✅ Ringan |
| IPO_RIGHTS_ISSUE (5A) | 8 | Slide 4: `SKEMA_AKSI`, Slide 5: `UNTUNG_BUAT_INVESTOR`, Slide 6: `PERLU_DIWASPADAI` | ✅ Ringan |
| IPO_RIGHTS_ISSUE (5B) | 8 | Slide 3: `PROFIL_PERUSAHAAN`, Slide 4: `DETAIL_PENAWARAN`, Slide 5: `KENAPA_MENARIK`, Slide 6: `RISIKO` | ❌ Tidak ada |
| SUSPENSION_DELISTING | 8 | Slide 4: `FAKTA_SUSPENSI`, Slide 5: `APA_ITU_SUSPENSI`, Slide 6: `YANG_PERLU_DILAKUKAN` | ✅ Ringan |

**Catatan penting untuk Carousel Builder:**
- Semua kategori tetap **8 slide** — konsistensi jumlah dot pagination di tiap carousel
- Slide 1, 2, 7, 8 formatnya **relatif sama** di semua kategori (Cover, TLDR, Kesimpulan, CTA) — bisa reuse komponen
- Slide 3, 4, 5, 6 adalah **slide yang berbeda** per kategori — masing-masing butuh komponen/template tersendiri
- Teks "Geser →" muncul di slide 1–5, tidak ada di slide 6–8 (konsisten di semua kategori)
- Format `point + explanation` pada slide 5 & 6 adalah **standar wajib** di semua kategori

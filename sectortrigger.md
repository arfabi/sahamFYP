# SectorTrigger — PRD Konten Terjadwal Otomatis @sahamfyp
*(v1 — Sistem konten berbasis jadwal: Harian, Mingguan, Bulanan)*

---

## 1. Ringkasan Eksekutif

**SectorTrigger** adalah sistem konten otomatis yang berjalan **tanpa input berita RSS** —
murni dipicu oleh jadwal waktu (cron) dan data real-time dari **Sectors.app API**. Berbeda
dari pipeline utama (yang menunggu berita masuk), SectorTrigger **proaktif menghasilkan
konten** sesuai ritme pasar modal Indonesia.

**Tiga pilar jadwal:**
- ⏰ **Harian** — konten time-sensitive sebelum & sesudah jam bursa
- 📅 **Mingguan** — review & outlook akhir pekan
- 📆 **Bulanan** — deep dive data komposisi & rekap pasar

**Keunggulan vs platform lain:** Semua konten di SectorTrigger menggunakan data yang
**tidak tersedia di Yahoo Finance, Stockbit, IPOT, atau aplikasi trading manapun** —
khususnya data broker flow institusional, komposisi kepemilikan per kategori investor,
dan insider trading filings IDX.

---

## 2. Prioritas Konten (Ranking by Engagement Impact)

Ranking berdasarkan 3 faktor: **keunikan data** (tidak bisa dibuat dari sumber lain),
**relevansi timing** (viewer butuh info ini kapan), dan **potensi share/save** (konten
yang orang mau simpan atau kirim ke teman).

### 🔴 PRIORITAS 1 — Must Have (Langsung Implementasi)

| Rank | Nama Konten | Jadwal | Alasan High Impact |
|------|-------------|--------|--------------------|
| #1 | **Recap Market Sore** | Harian 17.00 | Paling dicari — viewer mau tahu "market hari ini gimana?" sebelum pulang kerja. Volume search tertinggi di jam ini. |
| #2 | **Smart Money Hari Ini** | Harian 17.00 | Data broker institusional **eksklusif Sectors** — tidak ada di Stockbit/IPOT. "Siapa yang beli apa hari ini" selalu viral. |
| #3 | **Market Outlook Pagi** | Harian 08.00 | Viewer buka Instagram sebelum market buka — butuh konteks untuk ambil keputusan pagi. |
| #4 | **Saham Jagoan Minggu Ini** | Mingguan (Minggu 16.00) | Top gainer/loser sepekan = konten yang paling di-save dan di-share ke grup WA/Telegram. |

### 🟡 PRIORITAS 2 — Should Have (Fase Kedua)

| Rank | Nama Konten | Jadwal | Alasan |
|------|-------------|--------|--------|
| #5 | **Insider Radar Minggu Ini** | Mingguan (Minggu 16.00) | Transaksi direksi/komisaris = high curiosity content, tapi butuh konteks narasi yang lebih kaya — agak lebih kompleks dari sekadar data mentah. |
| #6 | **Radar Broker Pagi** | Harian 08.00 | Eksklusif & menarik, tapi audiens yang paham broker flow lebih sempit — cocok setelah akun punya base follower yang lebih matang. |
| #7 | **Review Pasar Minggu Ini** | Mingguan (Minggu 16.00) | Konten komprehensif yang bagus, tapi lebih panjang untuk diproduksi — lebih cocok sebagai konten "anchor" di akhir pekan. |
| #8 | **Rotasi Sektor Minggu Ini** | Mingguan (Minggu 16.00) | Niche tapi sangat berharga untuk investor yang main level sektor — engagement lebih terbatas di awal. |

### 🟢 PRIORITAS 3 — Nice to Have (Fase Ketiga)

| Rank | Nama Konten | Jadwal | Alasan |
|------|-------------|--------|--------|
| #9 | **Recap Pasar Bulan Ini** | Bulanan (tgl 30/31) | Konten review bulanan bagus untuk retention, tapi butuh lebih banyak data yang dikurasi manual. |
| #10 | **Komposisi Kepemilikan Berubah** | Bulanan (tgl 30/31) | Data sangat eksklusif (tidak ada di mana pun), tapi butuh narasi yang kuat supaya tidak terasa terlalu teknis untuk Gen Z. |
| #11 | **Broker Paling Aktif Bulan Ini** | Bulanan (tgl 30/31) | Menarik untuk audiens advanced, tapi perlu edukasi konteks lebih banyak supaya viewer paham relevansinya. |
| #12 | **Dividen & Aksi Korporasi Bulan Depan** | Bulanan (tgl 30/31) | Konten kalender yang sangat useful, tapi harus akurat 100% — risiko salah tanggal tinggi kalau tidak divalidasi. |
| #13 | **"Dari Mana Uangnya?"** | Bulanan (tgl 30/31) | Konten edukatif tinggi, tapi produksinya paling berat karena butuh pilihan emiten yang relevan tiap bulan. |

---

## 3. Spesifikasi Konten per Jadwal

---

### 3.1 ⏰ HARIAN — Pagi 08.00 (Senin–Jumat)

> Data yang dipakai: **T-1** (data hari bursa sebelumnya, karena data hari ini belum tersedia saat jam 08.00)

---

#### KONTEN H-1: Market Outlook Pagi *(Prioritas #3)*

**Tujuan:** Kasih konteks ke viewer sebelum market buka jam 09.00 — apa yang terjadi kemarin, sentimen global semalam, apa yang perlu dipantau hari ini.

**Struktur Carousel (8 Slide):**

| No | Type | Nama Slide | Contoh Isi |
|----|------|------------|------------|
| 1 | `COVER` | Cover | *"Selamat Pagi! 🌅 IHSG Kemarin Ditutup di 6.636 — Hari Ini Bakal Kemana?"* |
| 2 | `TLDR` | Ringkasan Cepat | • IHSG kemarin: 6.636 (-0,47%)<br>• Top gainer kemarin: SMMT +24,8%<br>• Sentimen AS semalam: S&P500 +0,3% (dari RSS berita) |
| 3 | `IHSG_KEMARIN` | Rekap IHSG Kemarin | Pergerakan IHSG T-1, volume, apakah di atas/bawah rata-rata 5 hari |
| 4 | `TOP_MOVER` | Top Mover Kemarin | Top 3 gainer & top 3 loser kemarin dengan % perubahan & sektor |
| 5 | `SENTIMEN_GLOBAL` | Sentimen Global Semalam | Pergerakan Wall Street, harga komoditas (minyak, emas, batu bara) dari berita RSS |
| 6 | `YANG_PERLU_DIPANTAU` | Yang Perlu Dipantau Hari Ini | Event/rilis data hari ini yang bisa pengaruhi pasar (dari berita RSS/kalender ekonomi) |
| 7 | `OUTLOOK` | Outlook Singkat | Ringkasan netral: market cenderung ke mana berdasarkan data yang ada |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Saham apa yang lo pantau hari ini? 👇"* + disclaimer DYOR |

**Endpoint Sectors.app:**
- ✅ `fetch-index-daily` (index_code: `ihsg`, date: T-1)
- ✅ `fetch-companies-top-changes` (periods: `1d`, classifications: `top_gainers`+`top_losers`, n_stock: 3)
- ✅ `fetch-idx-market-cap` (date: T-1)
- 🔁 `fetch-most-traded-stocks` (date: T-1) — opsional untuk konteks volume

**Sumber tambahan:** Sentimen global (Wall Street, komoditas) dari RSS berita (CNBC Indonesia / Kontan).

---

#### KONTEN H-2: Radar Broker Pagi *(Prioritas #6)*

**Tujuan:** Kasih insight "smart money kemarin" — broker institusional asing lagi akumulasi atau distribusi saham apa? Data ini **tidak ada di Stockbit, IPOT, atau Yahoo Finance.**

**Struktur Carousel (8 Slide):**

| No | Type | Nama Slide | Contoh Isi |
|----|------|------------|------------|
| 1 | `COVER` | Cover | *"🔍 Broker Asing Kemarin Beli Saham Apa? Intip Smart Money-nya!"* |
| 2 | `TLDR` | Ringkasan Cepat | • Net foreign flow kemarin: +Rp312 M (net inflow)<br>• Saham paling diakumulasi broker asing: BBCA, TLKM<br>• Saham paling didistribusikan: GOTO, BUMI |
| 3 | `APA_ITU_BROKER_FLOW` | Apa Itu Broker Flow? | Edukasi singkat: broker flow = rekam jejak siapa beli/jual saham lewat broker mana — bisa deteksi pergerakan institusi besar |
| 4 | `TOP_AKUMULASI` | Top Akumulasi Broker Asing | 3 saham dengan net buy terbesar dari broker asing kemarin + nilai net buy-nya |
| 5 | `TOP_DISTRIBUSI` | Top Distribusi Broker Asing | 3 saham dengan net sell terbesar dari broker asing kemarin + nilai net sell-nya |
| 6 | `INTERPRETASI` | Cara Baca Datanya | *Point: "Net Buy Asing Bukan Sinyal Langsung Beli"* — Explanation: *"Asing net beli BBCA kemarin bukan berarti lo harus langsung ikut beli. Ini cuma 1 data point — broker asing bisa salah, bisa punya agenda berbeda. Jadiin bahan riset tambahan, bukan trigger beli/jual."* |
| 7 | `KESIMPULAN` | Kesimpulan | Rangkuman pola broker asing kemarin, apakah konsisten dengan tren beberapa hari terakhir |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Lo notice ada pola menarik dari data broker kemarin? Share di sini 👇"* + disclaimer DYOR |

**Endpoint Sectors.app:**
- ✅ `fetch-top-brokers` (origin: `foreign`, metric: `net`, date: T-1)
- ✅ `fetch-broker-summary-top` (symbol: top saham, cohort: `institutional`, origin: `foreign`)
- 🔁 `fetch-foreign-flow` (per saham yang masuk top akumulasi/distribusi)

---

### 3.2 ⏰ HARIAN — Sore 17.00 (Senin–Jumat)

> Data yang dipakai: **T (hari ini)** — market sudah tutup jam 16.00, data sudah tersedia

---

#### KONTEN S-1: Recap Market Sore *(Prioritas #1 — Highest Impact)*

**Tujuan:** Jawab pertanyaan paling mendasar viewer: *"Market hari ini gimana?"* — singkat, visual, mudah dicerna.

**Struktur Carousel (8 Slide):**

| No | Type | Nama Slide | Contoh Isi |
|----|------|------------|------------|
| 1 | `COVER` | Cover | *"📊 Recap Market Sore — [Hari, Tanggal]"* dengan angka IHSG closing besar di tengah |
| 2 | `TLDR` | Ringkasan Cepat | • IHSG closing: 6.636 (-0,47%)<br>• Market cap IDX: Rp11.595 T<br>• Net foreign flow hari ini: -Rp89 M (net outflow) |
| 3 | `IHSG_HARI_INI` | IHSG Hari Ini | Closing, perubahan dari kemarin (%), konteks vs minggu ini & bulan ini |
| 4 | `TOP_MOVER` | Top Gainer & Loser | Top 3 gainer + top 3 loser hari ini — nama, ticker, % perubahan, sektor |
| 5 | `SAHAM_TERAKTIF` | Saham Paling Aktif | 3 saham dengan volume transaksi terbesar hari ini (indikator sentimen pasar) |
| 6 | `FOREIGN_FLOW` | Uang Asing Masuk/Keluar? | Net foreign flow hari ini — naik/turun, pola vs 5 hari terakhir |
| 7 | `KESIMPULAN` | Kesimpulan Hari Ini | Tone market hari ini: risk-on / risk-off? Sektor apa yang leading/lagging? |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Hari ini portofolio lo hijau atau merah? 🙋"* + disclaimer DYOR |

**Endpoint Sectors.app:**
- ✅ `fetch-index-daily` (index_code: `ihsg`, date: T)
- ✅ `fetch-idx-market-cap` (date: T)
- ✅ `fetch-companies-top-changes` (periods: `1d`, n_stock: 3, top_gainers + top_losers)
- ✅ `fetch-most-traded-stocks` (date: T)
- ✅ `fetch-foreign-flow` (agregat, date: T) — atau dari company-report jika tidak ada endpoint agregat

---

#### KONTEN S-2: Smart Money Hari Ini *(Prioritas #2 — Eksklusif)*

**Tujuan:** Data broker flow institusional hari ini — **tidak ada di platform lain manapun.** Saham apa yang lagi diakumulasi/didistribusikan institusi besar hari ini.

**Struktur Carousel (8 Slide):**

| No | Type | Nama Slide | Contoh Isi |
|----|------|------------|------------|
| 1 | `COVER` | Cover | *"🧠 Smart Money Hari Ini — Institusi Lagi Akumulasi Saham Apa?"* |
| 2 | `TLDR` | Ringkasan Cepat | • 3 saham top akumulasi institusi hari ini<br>• 3 saham top distribusi institusi hari ini<br>• Pola: asing net buy, domestik institusi net sell (atau sebaliknya) |
| 3 | `APA_ITU_SMART_MONEY` | Apa Itu Smart Money? | Edukasi singkat: institusi = dana pensiun, reksa dana, asuransi, hedge fund — mereka punya riset lebih dalam dari investor ritel biasa |
| 4 | `TOP_AKUMULASI` | Top Akumulasi Institusi | Tabel: ticker \| net buy (Rp) \| % dari volume total — top 3 saham paling diborong institusi hari ini |
| 5 | `TOP_DISTRIBUSI` | Top Distribusi Institusi | Tabel: ticker \| net sell (Rp) \| % dari volume total — top 3 saham paling dijual institusi hari ini |
| 6 | `POLA_MENARIK` | Pola Menarik Hari Ini | *Point + Explanation* — contoh: *"Institusi asing & domestik kompak net buy BBRI hari ini — terakhir kali ini terjadi, 3 hari kemudian BBRI naik 4%. Tapi ingat, ini bukan jaminan."* |
| 7 | `KESIMPULAN` | Kesimpulan | Interpretasi netral pola smart money hari ini |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Data ini bikin lo makin yakin sama saham tertentu atau malah sebaliknya? 👇"* + disclaimer DYOR |

**Endpoint Sectors.app:**
- ✅ `fetch-broker-summary-top` (cohort: `institutional`, n_brokers: 5)
- ✅ `fetch-top-brokers` (metric: `net`, cohort: `institutional`, date: T)
- 🔁 `fetch-broker-activity-top` (broker_code: broker institusional terbesar)

---

### 3.3 📅 MINGGUAN — Minggu Sore 16.00

> Data yang dipakai: **periode Senin–Jumat minggu berjalan** (T-5 s/d T-1)

---

#### KONTEN M-1: Saham Jagoan Minggu Ini *(Prioritas #4 — Most Shareable)*

**Tujuan:** Konten paling di-save dan di-share ke grup WA/Telegram. Top gainer & loser sepekan dengan filter minimum market cap (bukan saham gorengan).

**Struktur Carousel (8 Slide):**

| No | Type | Nama Slide | Contoh Isi |
|----|------|------------|------------|
| 1 | `COVER` | Cover | *"🏆 Saham Jagoan Minggu Ini — [Tanggal Range]"* |
| 2 | `TLDR` | Ringkasan Cepat | • IHSG minggu ini: +1,4% (Senin–Jumat)<br>• Saham terbang tertinggi: BSIM +68%<br>• Saham paling tertekan: TAPG -12% |
| 3 | `IHSG_MINGGU_INI` | Performa IHSG Minggu Ini | Tabel IHSG Senin–Jumat, closing tiap hari, net change mingguan |
| 4 | `TOP_GAINER` | 🟢 Top 5 Gainer Minggu Ini | Tabel: Rank \| Ticker \| Sektor \| Harga Akhir \| % Change 7d — filter min market cap Rp500 M |
| 5 | `TOP_LOSER` | 🔴 Top 5 Loser Minggu Ini | Tabel: Rank \| Ticker \| Sektor \| Harga Akhir \| % Change 7d — filter min market cap Rp500 M |
| 6 | `HIGHLIGHT` | Highlight Minggu Ini | *Point + Explanation* — saham/sektor yang paling menarik perhatian minggu ini, dengan konteks kenapa naik/turun |
| 7 | `KESIMPULAN` | Kesimpulan | Sektor apa yang dominan minggu ini, outlook singkat untuk minggu depan |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Saham mana di list ini yang udah lo pantau dari lama? 👇"* + disclaimer DYOR |

**Endpoint Sectors.app:**
- ✅ `fetch-index-daily` (ihsg, start: Senin, end: Jumat)
- ✅ `fetch-companies-top-changes` (periods: `7d`, classifications: `top_gainers`+`top_losers`, n_stock: 5, min_mcap_billion: 0.5)

---

#### KONTEN M-2: Insider Radar Minggu Ini *(Prioritas #5)*

**Tujuan:** Transaksi direksi/komisaris/pemegang saham >5% yang beli/jual saham sendiri minggu ini. **Eksklusif Sectors — tidak ada di Stockbit level detail ini.**

**Struktur Carousel (8 Slide):**

| No | Type | Nama Slide | Contoh Isi |
|----|------|------------|------------|
| 1 | `COVER` | Cover | *"👀 Insider Radar — Direksi Beli/Jual Saham Sendiri Minggu Ini"* |
| 2 | `TLDR` | Ringkasan Cepat | • X transaksi insider tercatat minggu ini<br>• Terbesar: Direktur BBCA beli 500.000 lembar senilai Rp4,5 M<br>• Net: lebih banyak yang beli (bullish signal?) |
| 3 | `APA_ITU_INSIDER` | Apa Itu Insider Trading (Legal)? | Edukasi: di Indonesia, direksi boleh beli/jual saham perusahaannya sendiri ASALKAN dilaporkan ke OJK — ini yang dilacak, bukan yang ilegal |
| 4 | `INSIDER_BUY` | 🟢 Insider yang Beli | Tabel: Nama \| Jabatan \| Ticker \| Jumlah Lembar \| Nilai (Rp) — top 3 transaksi beli terbesar minggu ini |
| 5 | `INSIDER_SELL` | 🔴 Insider yang Jual | Tabel: Nama \| Jabatan \| Ticker \| Jumlah Lembar \| Nilai (Rp) — top 3 transaksi jual terbesar minggu ini |
| 6 | `INTERPRETASI` | Cara Baca Insider Filing | *Point: "Insider Beli = Bullish Signal?"*<br>*Explanation: "Kalau direkturnya sendiri mau keluar uang pribadi beli saham perusahaannya, biasanya itu sinyal dia yakin harga sekarang masih murah atau ada katalis yang dia tahu. Tapi bukan 100% akurat — tetap harus cek fundamentalnya juga."* |
| 7 | `KESIMPULAN` | Kesimpulan | Net insider sentiment minggu ini: lebih banyak beli atau jual? Saham apa yang paling menarik perhatian? |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Kalau direkturnya beli, lo ikut beli juga? Atau tetap riset dulu? 🤔"* + disclaimer DYOR |

**Endpoint Sectors.app:**
- ✅ `fetch-filings` (start: Senin, end: Jumat, holder_type: `insider`, transaction_type: `buy` + `sell`)

---

#### KONTEN M-3: Review Pasar Minggu Ini *(Prioritas #7)*

**Tujuan:** Konten anchor akhir pekan — rangkuman komprehensif pasar + rotasi sektor.

**Struktur Carousel (8 Slide):**

| No | Type | Nama Slide | Contoh Isi |
|----|------|------------|------------|
| 1 | `COVER` | Cover | *"📰 Review Pasar Minggu Ini — [Tanggal Range]"* |
| 2 | `TLDR` | Ringkasan Cepat | 3 poin utama: IHSG net change + sektor terkuat + sentimen asing |
| 3 | `IHSG_WEEKLY` | Performa IHSG Sepekan | Grafik IHSG harian Senin–Jumat + konteks vs bulan ini & YTD |
| 4 | `SEKTOR_TERKUAT` | Sektor Terkuat Minggu Ini | Top 3 sub-sektor dengan return terbaik + top 3 terburuk minggu ini |
| 5 | `ROTASI_DANA` | Rotasi Dana Asing | Net foreign flow per sektor minggu ini — ke mana asing mengalirkan/menarik dana |
| 6 | `HIGHLIGHT` | Event Pasar Terpenting | Berita/event terpenting minggu ini yang paling gerakkan pasar (dari RSS) |
| 7 | `OUTLOOK_MINGGU_DEPAN` | Outlook Minggu Depan | Event/rilis data minggu depan yang perlu dipantau (kalender ekonomi dari RSS) |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Minggu ini portofolio lo gimana? Hijau atau merah?"* + disclaimer DYOR |

**Endpoint Sectors.app:**
- ✅ `fetch-index-daily` (ihsg, 7d)
- ✅ `fetch-subsector-report` (sections: `market_cap`, `statistics`)
- ✅ `fetch-companies-top-changes` (7d, per sub_sector)
- ✅ `fetch-idx-market-cap` (7d)

---

### 3.4 📆 BULANAN — Tanggal 30/31

> Data yang dipakai: **periode bulan berjalan (1 s/d 30/31)**

---

#### KONTEN B-1: Recap Pasar Bulan Ini *(Prioritas #9)*

| No | Type | Nama Slide | Contoh Isi |
|----|------|------------|------------|
| 1 | `COVER` | Cover | *"📆 Recap Pasar — [Nama Bulan Tahun]"* |
| 2 | `TLDR` | Ringkasan Cepat | IHSG net change bulan ini + sektor terkuat + total market cap naik/turun berapa triliun |
| 3 | `IHSG_BULANAN` | Performa IHSG Bulan Ini | IHSG awal vs akhir bulan + pergerakan mingguan dalam bulan ini |
| 4 | `SEKTOR_BULANAN` | Pemenang & Pecundang Sektor | Top 3 sektor terbaik & terburuk bulan ini + YTD context |
| 5 | `MARKET_CAP` | Total Pasar IDX | Total market cap IDX awal vs akhir bulan — naik/turun berapa triliun dari portofolio investor Indonesia secara agregat |
| 6 | `FOREIGN_FLOW_BULANAN` | Asing Masuk atau Keluar? | Net foreign flow kumulatif bulan ini — konsisten dengan tren global? |
| 7 | `KESIMPULAN` | Kesimpulan | Karakter pasar bulan ini (bullish/bearish/sideways), highlight terbesar |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Bulan ini investasi lo gimana? Bagi pengalamannya! 👇"* + disclaimer DYOR |

**Endpoint:** `fetch-index-daily` (30d) + `fetch-idx-market-cap` (30d) + `fetch-subsector-report` (market_cap, growth)

---

#### KONTEN B-2: Komposisi Kepemilikan Berubah *(Prioritas #10 — Paling Eksklusif)*

| No | Type | Nama Slide | Contoh Isi |
|----|------|------------|------------|
| 1 | `COVER` | Cover | *"🔄 Siapa yang Lagi Borong/Lepas Saham Bulan Ini?"* |
| 2 | `TLDR` | Ringkasan Cepat | Emiten dengan perubahan kepemilikan asing terbesar bulan ini |
| 3 | `APA_ITU_KOMPOSISI` | Kenapa Data Ini Penting? | Edukasi: komposisi kepemilikan = foto snapshot siapa yang pegang saham — kalau kepemilikan institusi asing naik terus, biasanya bullish signal jangka menengah |
| 4 | `NAIK_KEPEMILIKAN_ASING` | Kepemilikan Asing Naik | Top 3 emiten dengan kenaikan kepemilikan investor asing terbesar bulan ini |
| 5 | `TURUN_KEPEMILIKAN_ASING` | Kepemilikan Asing Turun | Top 3 emiten yang kepemilikan asingnya paling banyak berkurang bulan ini |
| 6 | `INTERPRETASI` | Cara Baca Data Ini | *Point: "Kepemilikan Asing Naik = Harga Naik?"*<br>*Explanation: "Tidak selalu langsung, tapi secara historis emiten dengan tren kepemilikan asing yang terus naik dalam 3-6 bulan cenderung outperform IHSG. Ini bukan jaminan, tapi bisa jadi salah satu filter tambahan lo."* |
| 7 | `KESIMPULAN` | Kesimpulan | Tren kepemilikan bulan ini: asing masuk atau keluar dari IDX secara keseluruhan? |
| 8 | `CTA_DYOR` | Diskusi + Disclaimer | *"Lo lebih percaya data smart money atau analisis teknikal? 🤔"* + disclaimer |

**Endpoint:** `fetch-shareholders-composition` (symbol: pilihan emiten big cap, year: tahun berjalan)

---

#### KONTEN B-3: Broker Paling Aktif Bulan Ini *(Prioritas #11)*

| No | Type | Nama Slide | Ringkasan Isi | Endpoint |
|----|------|------------|---------------|----------|
| 1–2 | COVER + TLDR | — | Broker dengan gross trade value terbesar + net flow terbesar bulan ini | — |
| 3 | `APA_ITU_BROKER` | Edukasi broker IDX | Apa itu kode broker, kenapa penting dilacak | — |
| 4 | `TOP_BROKER_GROSS` | Volume Terbesar | Ranking broker by gross trade value bulan ini | ✅ `fetch-top-brokers` (metric: gross) |
| 5 | `TOP_BROKER_NET` | Net Flow Terbesar | Ranking broker by net buy/sell bulan ini | ✅ `fetch-top-brokers` (metric: net) |
| 6–8 | Interpretasi + Kesimpulan + CTA | — | — | — |

---

#### KONTEN B-4: Dividen & Aksi Korporasi Bulan Depan *(Prioritas #12)*

| No | Type | Nama Slide | Ringkasan Isi | Endpoint |
|----|------|------------|---------------|----------|
| 1–2 | COVER + TLDR | — | Preview: berapa emiten yang akan bagi dividen bulan depan? | — |
| 3 | `KALENDER_DIVIDEN` | Jadwal Cum Date | Tabel: Ticker \| Nilai Dividen \| Cum Date \| Ex Date \| Payment Date | ✅ `fetch-corporate-actions` |
| 4 | `KALENDER_RUPS` | Jadwal RUPS/RUPSLB | Emiten yang akan gelar RUPS bulan depan | ✅ `fetch-corporate-actions` |
| 5–6 | Cara Hitung Yield + Risiko Dividend Trap | Edukasi | — | — |
| 7–8 | Kesimpulan + CTA | — | — | — |

---

#### KONTEN B-5: "Dari Mana Uangnya?" *(Prioritas #13)*

| No | Type | Nama Slide | Ringkasan Isi | Endpoint |
|----|------|------------|---------------|----------|
| 1–2 | COVER + TLDR | — | Pilihan 1 emiten konglomerat per bulan (rotasi: TLKM, ASII, MAPI, dll) | — |
| 3 | `PROFIL_BISNIS` | Sekilas Bisnis | Overview emiten, berapa segmen bisnis yang dimiliki | ✅ `fetch-company-report` (overview) |
| 4 | `BREAKDOWN_REVENUE` | Dari Mana Pendapatannya? | Visual breakdown % pendapatan per lini bisnis (Sankey-ready) | ✅ `fetch-company-segments` |
| 5 | `BREAKDOWN_BIAYA` | Ke Mana Biayanya? | Breakdown komponen biaya terbesar | ✅ `fetch-company-segments` |
| 6–8 | Insight + Kesimpulan + CTA | — | — | — |

---

## 4. Ringkasan Teknis

### Trigger Schedule (n8n Cron)

| Konten | Cron Expression | Hari |
|--------|----------------|------|
| Market Outlook Pagi | `0 8 * * 1-5` | Senin–Jumat |
| Radar Broker Pagi | `0 8 * * 1-5` | Senin–Jumat |
| Recap Market Sore | `0 17 * * 1-5` | Senin–Jumat |
| Smart Money Hari Ini | `0 17 * * 1-5` | Senin–Jumat |
| Saham Jagoan Minggu Ini | `0 16 * * 0` | Minggu |
| Insider Radar Minggu Ini | `0 16 * * 0` | Minggu |
| Review Pasar Minggu Ini | `0 16 * * 0` | Minggu |
| Recap Pasar Bulan Ini | `0 10 28-31 * *` | Tgl 28–31* |
| Komposisi Kepemilikan | `0 10 28-31 * *` | Tgl 28–31* |
| Broker Paling Aktif | `0 10 28-31 * *` | Tgl 28–31* |
| Dividen Bulan Depan | `0 10 28-31 * *` | Tgl 28–31* |
| "Dari Mana Uangnya?" | `0 10 28-31 * *` | Tgl 28–31* |

*\*Gunakan cek kondisi di n8n: jalankan hanya di hari terakhir bulan berjalan*

### Volume Konten per Bulan

| Frekuensi | Jumlah per Run | Run per Bulan | Total Carousel |
|-----------|----------------|----------------|----------------|
| Harian pagi (2 konten) | 2 | ~22 (Senin–Jumat) | ~44 |
| Harian sore (2 konten) | 2 | ~22 (Senin–Jumat) | ~44 |
| Mingguan (3 konten) | 3 | ~4 (Minggu) | ~12 |
| Bulanan (5 konten) | 5 | 1 | ~5 |
| **Total** | | | **~105 carousel/bulan** |

### Endpoint Sectors.app yang Dipakai

| Endpoint | Dipakai Oleh | Estimasi Credit/Run |
|----------|-------------|---------------------|
| `fetch-index-daily` | H-1, S-1, M-1, M-3, B-1 | 1 |
| `fetch-idx-market-cap` | H-1, S-1, M-3, B-1 | 1 |
| `fetch-companies-top-changes` | H-1, S-1, M-1, M-3 | 2 |
| `fetch-most-traded-stocks` | H-1, S-1 | 2 |
| `fetch-top-brokers` | H-2, S-2, B-3 | 2 |
| `fetch-broker-summary-top` | H-2, S-2 | 2 |
| `fetch-broker-activity-top` | H-2, S-2 | 2 |
| `fetch-foreign-flow` | S-1 | 1 |
| `fetch-filings` | M-2 | 1 |
| `fetch-subsector-report` | M-3, B-1 | 3–4 |
| `fetch-shareholders-composition` | B-2 | 1 |
| `fetch-corporate-actions` | B-4 | 1 |
| `fetch-company-segments` | B-5 | 1 |
| `fetch-company-report` | B-5 | 1–2 |

---

## 5. Catatan Implementasi

1. **Data Holiday:** Tambahkan pengecekan libur bursa IDX di n8n — kalau hari libur,
   cron harian dilewati otomatis (tidak ada data pasar yang bisa di-fetch).

2. **Fallback Konten Harian:** Kalau market merah signifikan (IHSG < -1,5%), tone
   konten Recap Sore harus lebih hati-hati/netral — tambahkan flag di LLM untuk
   deteksi kondisi ini dari data `fetch-index-daily`.

3. **Filter Anti-Gorengan:** Konten Top Gainer/Loser WAJIB pakai filter minimum market
   cap (rekomendasi: min Rp500 M) supaya daftar tidak didominasi saham-saham kecil
   yang mudah digoreng.

4. **Rotasi Emiten Bulanan:** Konten B-5 ("Dari Mana Uangnya?") perlu daftar emiten
   yang dirotasi tiap bulan — buat tabel rotasi manual atau random pick dari top 20
   market cap IDX.

5. **Disclaimer Wajib Semua Konten:** Semua 13 jenis konten ini wajib menyertakan
   disclaimer DYOR di slide terakhir — termasuk konten harian yang sifatnya
   informatif/recap, bukan hanya konten analisis.

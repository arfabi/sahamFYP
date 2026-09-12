# SectorTrigger — PRD Konten Terjadwal Otomatis @sahamfyp
*(v5 — Final: Opsi B — Open (08.00) + Close (17.00) + data eksklusif Broker Flow & Insider Filing)*

---

## 1. Ringkasan Eksekutif

**SectorTrigger** adalah sistem konten otomatis yang berjalan **tanpa input berita RSS** —
murni dipicu oleh jadwal waktu (cron) dan data real-time dari **Sectors.app API**.

**Jadwal aktif (Opsi B):**
- 🌅 **Open — 08.00 WIB** (Senin–Jumat) — recap T-1 + outlook + insider filing kemarin
- 🌆 **Close — 17.00 WIB** (Senin–Jumat) — recap full-day + broker asing eksklusif

**Visual:** Foto real + overlay teks (konsisten dengan style akun yang sudah ada)
**Data angka slide 4:** Semua dari Sectors.app API
**Keunggulan vs Stockbit/RTI:**
- Data insider filing lengkap dengan nama, jabatan, nilai transaksi, histori 6 bulan
- Broker flow institusional asing — dari broker ke saham (tidak ada di Stockbit/RTI)

---

## 2. 🌅 OPEN — 08.00 WIB

> **Data:** T-1 (hari bursa sebelumnya)
> **Cron:** `0 8 * * 1-5`
> **Foto cover:** Suasana pagi / gedung BEI / seseorang cek HP pagi hari

### Struktur Carousel (8 Slide)

| No | Slide | Contoh Isi | Template |
|----|-------|------------|----------|
| 1 | `COVER` | **"Selamat Pagi! ☀️ IHSG Kemarin Tutup di 6.636 — Hari Ini Bakal Kemana?"** | COVER — foto pagi + headline besar + badge tanggal |
| 2 | `TLDR` | • IHSG kemarin: 6.636 (−0,47%)<br>• Gainer terbesar: ELPI +16%<br>• Market cap IDX: Rp11.595 T | TLDR — 3 poin ringkasan |
| 3 | `IHSG_KEMARIN` | Pergerakan IHSG T-1, volume transaksi, konteks vs rata-rata 5 hari terakhir | KRONOLOGI — narasi singkat pergerakan kemarin |
| 4 | `DATA_MARKET` | **Top 3 Gainer kemarin:** ELPI +16%, INDY +11%, VICI +9,9%<br>**Top 3 Loser kemarin:** NATO −9%, BMAS −7%, BELI −6,9%<br>*Sumber Data: Sectors.app* | BEDAH_DATA — tabel gainer/loser |
| 5 | `INSIDER_RADAR` | 🔍 **Insider Filing Kemarin:**<br>✅ Edwin Soeryadjaya beli **2,25 juta lembar SRTG** senilai Rp4 M (harga avg Rp1.809)<br>❌ George Oetomo jual **1,7 juta lembar TAPG** senilai Rp3,7 M<br>*"Pendiri Saratoga Group borong saham sendiri — sinyal apa?"*<br>*Sumber Data: Sectors.app* | DIUNTUNGKAN — insider buy highlight |
| 6 | `YANG_PERLU_DIPANTAU` | Event hari ini yang bisa gerakkan pasar:<br>• Rilis data inflasi AS jam 19.30 WIB<br>• RUPS BBCA jam 10.00<br>*(dari RSS berita — 0 credit tambahan)* | PERLU_DIWASPADAI — daftar event & potensi dampak |
| 7 | `OUTLOOK` | Ringkasan netral: market cenderung ke mana dari data kemarin + sentimen global semalam | KESIMPULAN — outlook singkat, tidak prediksi pasti |
| 8 | `CTA_DYOR` | *"Saham apa yang lo pantau hari ini? Drop di kolom komentar 👇"*<br>*DYOR: Konten ini murni edukasi, bukan ajakan jual/beli.* | CTA_DYOR — diskusi + disclaimer |

### API Sectors.app & Credit

| No | Endpoint | Fungsi | Credit | Ada di Stockbit/RTI? |
|----|----------|--------|--------|----------------------|
| 1 | `fetch-index-daily` | IHSG closing T-1, perubahan % | 1 | ✅ Ada |
| 2 | `fetch-companies-top-changes` | Top 3 gainer + loser kemarin (1d, n:3) | 2 | ✅ Ada |
| 3 | `fetch-filings` | Insider filing T-1 — nama, jabatan, ticker, nilai transaksi, histori 6 bulan | 1 | ⭐ **Eksklusif Sectors** |
| | **Total Open per Run** | | **4 credit** | |

---

## 3. 🌆 CLOSE — 17.00 WIB

> **Data:** T (hari ini — market sudah tutup jam 16.00, data final)
> **Cron:** `0 17 * * 1-5`
> **Foto cover:** Layar trading dengan angka merah/hijau — warna overlay sesuai arah IHSG

### Struktur Carousel (8 Slide)

| No | Slide | Contoh Isi | Template |
|----|-------|------------|----------|
| 1 | `COVER` | **"📊 Recap Market — Kamis, 4 Sep 2026"**<br>IHSG: **6.636** ▼ −0,47% | COVER — foto sore + angka IHSG besar + warna merah/hijau |
| 2 | `TLDR` | • IHSG closing: 6.636 (−0,47%)<br>• Market cap IDX: Rp11.595 T (turun Rp42 T dari kemarin)<br>• Net foreign flow: −Rp89 M (asing net sell) | TLDR — 3 poin ringkasan hari ini |
| 3 | `IHSG_HARI_INI` | IHSG closing hari ini vs kemarin, vs seminggu ini, vs awal bulan — biar viewer tahu ini koreksi wajar atau tren turun | KRONOLOGI — narasi pergerakan IHSG hari ini |
| 4 | `DATA_MARKET` | **Top 3 Gainer:** ELPI +16%, INDY +11%, VICI +9,9%<br>**Top 3 Loser:** NATO −9%, BMAS −7%, BELI −6,9%<br>**Paling Aktif:** COCO (vol 2,1 M lot), BULL, BUMI<br>**Foreign Flow:** −Rp89 M (net sell)<br>*Sumber Data: Sectors.app* | BEDAH_DATA — tabel lengkap: gainer, loser, volume, foreign flow |
| 5 | `BROKER_ASING` | 🧠 **Smart Money Hari Ini:**<br>Broker **YU (UBS)** — net buy terbesar asing hari ini +Rp184 M<br>Paling diborong: BBCA Rp529 M, BBRI Rp150 M, BMRI Rp119 M<br>Paling dijual: ASII −Rp170 M<br>*"Institusi asing lagi akumulasi saham bank besar — sinyal jangka pendek?"*<br>*Sumber Data: Sectors.app* | DIUNTUNGKAN — broker flow highlight dengan narasi |
| 6 | `PERLU_DIWASPADAI` | Sektor/saham yang underperform hari ini + konteks singkat kenapa<br>*"Saham teknologi & media kompak merah — BELI −6,9%, MDIA −6,8%. Tekanan valuasi masih berlanjut."* | PERLU_DIWASPADAI — poin + penjelasan Gen Z style |
| 7 | `KESIMPULAN` | Tone market hari ini: risk-on atau risk-off?<br>Sektor leading vs lagging.<br>1 hal yang perlu diperhatikan besok. | KESIMPULAN — ringkasan netral |
| 8 | `CTA_DYOR` | *"Hari ini portofolio lo hijau atau merah? 🙋 Share pengalamannya!"*<br>*DYOR: Konten ini murni edukasi, bukan ajakan jual/beli.* | CTA_DYOR — diskusi + disclaimer |

### API Sectors.app & Credit

| No | Endpoint | Fungsi | Credit | Ada di Stockbit/RTI? |
|----|----------|--------|--------|----------------------|
| 1 | `fetch-index-daily` | IHSG closing T, perubahan % vs kemarin & 5 hari | 1 | ✅ Ada |
| 2 | `fetch-idx-market-cap` | Total market cap IDX hari ini vs kemarin | 1 | ✅ Ada |
| 3 | `fetch-companies-top-changes` | Top 3 gainer + loser full day (1d, n:3) | 2 | ✅ Ada |
| 4 | `fetch-most-traded-stocks` | Top 3 saham paling aktif volume hari ini | 2 | ✅ Ada |
| 5 | `fetch-foreign-flow` | Net foreign flow hari ini (masuk/keluar) | 1 | ✅ Ada (terbatas) |
| 6 | `fetch-top-brokers` | Ranking broker asing by net flow hari ini — cari broker #1 net buy | 2 | ⭐ **Eksklusif Sectors** |
| 7 | `fetch-broker-activity-top` | Saham apa yang diborong/dijual broker asing terbesar hari ini | 1 | ⭐ **Eksklusif Sectors** |
| | **Total Close per Run** | | **10 credit** | |

---

## 4. Ringkasan Total Opsi B (Final)

| Sesi | Waktu | Cron | Credit/Run | Hari Aktif/Bulan | Credit/Bulan |
|------|-------|------|-----------|-----------------|--------------|
| 🌅 Open | 08.00 | `0 8 * * 1-5` | 4 | ~22 | ~88 |
| 🌆 Close | 17.00 | `0 17 * * 1-5` | 10 | ~22 | ~220 |
| **Total** | | | **14 credit/hari** | | **~308 credit/bulan** |

---

## 5. Perbandingan Data: Sectors.app vs Stockbit/RTI

| Data | Stockbit | RTI | Sectors.app | Keterangan |
|------|----------|-----|-------------|------------|
| IHSG harian | ✅ | ✅ | ✅ | Setara |
| Top gainer/loser | ✅ | ✅ | ✅ | Setara |
| Volume saham aktif | ✅ | ✅ | ✅ | Setara |
| Foreign flow agregat | ✅ | ✅ | ✅ | Setara |
| Broker summary per saham | ✅ | ✅ | ✅ | Setara |
| **Broker → saham (arah terbalik)** | ❌ | ❌ | ⭐ | **Eksklusif Sectors** — tahu broker UBS lagi borong saham apa |
| **Insider filing lengkap + histori 6 bulan** | ⚠️ Terbatas | ❌ | ⭐ | **Eksklusif Sectors** — nama, jabatan, nilai, % kepemilikan |
| **Net broker asing ranking harian** | ❌ | ❌ | ⭐ | **Eksklusif Sectors** — broker asing mana yang paling agresif hari ini |

---

## 6. Mapping Template Slide (Reuse dari Kategori Berita)

Kedua konten SectorTrigger **reuse template yang sama** dengan 6 kategori berita utama —
tidak perlu komponen baru di Carousel Builder. Yang berbeda hanya data JSON yang di-inject.

| Slide | Template | Open | Close |
|-------|----------|------|-------|
| 1 | `COVER` | ✅ | ✅ |
| 2 | `TLDR` | ✅ | ✅ |
| 3 | `KRONOLOGI` | ✅ → IHSG_KEMARIN | ✅ → IHSG_HARI_INI |
| 4 | `BEDAH_DATA` | ✅ → gainer/loser T-1 | ✅ → gainer/loser/volume/flow T |
| 5 | `DIUNTUNGKAN` | ✅ → insider buy highlight | ✅ → broker asing akumulasi |
| 6 | `PERLU_DIWASPADAI` | ✅ → event hari ini (RSS) | ✅ → sektor underperform |
| 7 | `KESIMPULAN` | ✅ | ✅ |
| 8 | `CTA_DYOR` | ✅ | ✅ |

---

## 7. Catatan Implementasi

1. **Cek Hari Libur Bursa IDX:** Tambahkan logic di n8n — kalau hari libur, skip
   kedua trigger otomatis. Referensi kalender IDX bisa di-hardcode per tahun di n8n.

2. **Fallback Tone Close:** Kalau IHSG drop > −1,5%, flag LLM untuk gunakan tone
   lebih hati-hati di slide 6 — hindari narasi yang terlalu cheerful saat pasar merah dalam.

3. **Filter Insider Filing:** Dari `fetch-filings`, filter hanya transaksi dengan
   `transaction_value > 500.000.000` (Rp500 juta) — hindari transaksi kecil/tidak signifikan
   yang tidak informatif untuk viewer Gen Z.

4. **Filter Broker Eksklusif:** Dari `fetch-top-brokers`, ambil `origin: foreign`, `metric: net`
   — lalu fetch `fetch-broker-activity-top` hanya untuk broker rank #1 net buy asing.
   Jangan fetch semua broker untuk hemat credit.

5. **Filter Anti-Gorengan:** `fetch-companies-top-changes` wajib pakai
   `min_mcap_billion: 0.5` (min market cap Rp500 M) — supaya top gainer/loser
   tidak diisi saham kecil yang mudah digoreng.

6. **Warna Overlay Foto Close:** Sesuaikan warna overlay dengan arah IHSG —
   **hijau** kalau IHSG naik, **merah** kalau turun. Bisa di-automate dari nilai
   `daily_close_change` di output `fetch-index-daily`.

7. **Disclaimer Wajib:** Slide 8 (`CTA_DYOR`) di kedua sesi wajib ada teks:
   *"DYOR: Konten ini murni edukasi, bukan ajakan jual/beli."*

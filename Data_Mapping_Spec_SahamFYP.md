# DATA MAPPING SPEC — Sectors.app API per Kategori Berita @sahamfyp
*(v1 — Referensi data enrichment untuk 6 kategori konten carousel)*

Dokumen ini memetakan endpoint **Sectors.app API (via MCP)** mana yang dipakai untuk
memperkaya naskah carousel di tiap kategori berita hasil klasifikasi LLM 1. Tujuannya:
LLM Naskah Generator (LLM 2) tahu persis endpoint mana yang harus dipanggil per
kategori — tidak perlu (dan tidak boleh) menarik semua endpoint untuk semua berita,
karena setiap `sections`/klasifikasi punya biaya credit API sendiri.

**Prinsip umum:**
- Tarik data **seminimal mungkin tapi cukup** untuk kategori tersebut — gunakan
  parameter `sections`/`classifications`/`periods` untuk membatasi field yang ditarik,
  bukan default (semua section).
- Kalau field yang dibutuhkan `null`/tidak tersedia dari API, **jangan dikarang** —
  ikuti Aturan Wajib #3 di Master Prompt Single Stock: skip metrik tersebut.
- Sectors.app adalah **data emiten/pasar IDX**, bukan data makro pemerintah (BI
  rate, inflasi, kurs resmi) — data makro murni tetap bersumber dari isi berita RSS,
  Sectors.app hanya memperkaya sisi *dampaknya ke pasar* (index, market cap, saham
  penggerak).

---

## 1. `SINGLE_STOCK`

| Endpoint | Fungsi | Credit |
|---|---|---|
| `fetch-company-report` | Data komprehensif satu emiten | 1 credit/section, default semua (8) section = 8 credit |
| `fetch-foreign-flow` | Data foreign flow harian (lebih detail dari company-report) | 1 credit |

**Section yang direkomendasikan dari `fetch-company-report`** (pilih sesuai kebutuhan
slide, jangan tarik semua 8 section):
- `overview` → market cap, sektor/sub-sektor, price change 1d, ESG score, indeks
  (LQ45/IDX30/dll), 52w/90d/all-time high-low
- `valuation` → PER, PBV, PS, PCF, PEG, EV/EBITDA (TTM + historis per tahun), rata-rata
  peer sub-sektor, intrinsic value, forward PE
- `financials` → historical revenue/earnings, EPS + EPS growth, margin (gross/net/
  operating), rasio leverage & likuiditas per tahun, growth kuartalan YoY
- `future` → analyst rating breakdown (buy/hold/sell), forecast EPS/revenue growth
- `dividend` → dividend yield TTM, payout ratio, historical & upcoming dividend
- `ownership` → major shareholders, top buyer/seller institusi bulan terakhir,
  conglomerate group afiliasi
- `management` (opsional) → direksi/komisaris & kepemilikan sahamnya — pakai hanya
  kalau berita menyinggung pergantian direksi
- `peers` (opsional) → perbandingan lengkap emiten sejenis — pakai hanya kalau
  narasi butuh benchmark eksplisit ke kompetitor

**Field kunci yang paling sering dipakai untuk slide BEDAH_DATA:** `pb`, `pe`,
`pb_peer_avg`, `pe_peer_avg`, `peg`, `enterprise_to_ebitda`, `intrinsic_value`, `roe`,
`roa`, `net_profit_margin`, `eps`, `eps_growth`, `yoy_quarter_earnings_growth`,
`yoy_quarter_revenue_growth`, `yield_ttm`, `payout_ratio`.

**Field kunci untuk slide KRONOLOGI/konteks tambahan:** `market_cap`,
`daily_close_change`, `indices`, `major_shareholders`, `analyst_rating_breakdown`.

---

## 2. `MACRO_ECONOMY`

| Endpoint | Fungsi | Credit |
|---|---|---|
| `fetch-index-daily` | Pergerakan harian indeks (IHSG/LQ45/IDX30/dll) | 1 credit |
| `fetch-idx-market-cap` | Total kapitalisasi pasar IDX historis | 1 credit |
| `fetch-companies-top-changes` | Saham penggerak (top gainer/loser) periode tertentu | 1 credit × (classification × period) |
| `fetch-most-traded-stocks` | Saham paling aktif ditransaksikan | 2 credit |

**Parameter penting:**
- `fetch-index-daily`: `index_code` — gunakan `ihsg` sebagai default; index lain
  (`lq45`, `idx30`, dll) hanya jika berita menyebut spesifik.
- `fetch-companies-top-changes`: batasi `periods` ke 1 nilai relevan saja (mis. `1d`
  untuk berita harian) dan `classifications` ke `top_gainers`+`top_losers` — jangan
  tarik semua 5 periode sekaligus (biaya 10 credit kalau default).

**Field kunci:** `close` (indeks), perubahan harian indeks, `total_market_cap` &
perubahannya, daftar top gainer/loser dengan `daily_close_change`.

**Batasan:** Tidak ada data BI rate/inflasi/kurs resmi dari Sectors.app — field
tersebut wajib diambil dari isi berita RSS (`news_body`), bukan API ini.

---

## 3. `SECTOR_ANALYSIS`

| Endpoint | Fungsi | Credit |
|---|---|---|
| `fetch-subsector-report` | Data agregat satu sub-sektor | 1 credit/section, default semua (6) = 6 credit |
| `fetch-companies-top-changes` (filter `sub_sector`) | Top gainer/loser dalam sektor | 1 credit × kombinasi |
| `fetch-most-traded-stocks` (filter `sub_sector`) | Saham paling aktif dalam sektor | 2 credit |
| `fetch-companies-by-subsector` | Screening/ranking emiten dalam sektor (query terstruktur) | 1 credit |

**Section yang direkomendasikan dari `fetch-subsector-report`:**
- `statistics` → jumlah emiten, median PE, PE tertimbang, PE min/max sektor
- `market_cap` → total & rata-rata market cap sektor, tren kuartalan, perubahan 1w/1y/YTD
- `valuation` → PB/PE/PS/PCF historis sektor per tahun
- `growth` → rata-rata tertimbang growth revenue & earnings sektor
- `companies` → daftar emiten dalam sektor dengan metrik kunci (untuk menyebut
  ticker representatif di slide)
- `stability` (opsional) → max drawdown, deviasi standar — pakai kalau naskah bahas
  volatilitas sektor

**Catatan:** `sub_sector` wajib dalam format kebab-case (mis. `banks`,
`oil-gas-coal`) — kalau LLM classifier hanya menyebut nama sektor bebas (mis.
"Perbankan"), perlu mapping ke slug resmi sebelum panggil endpoint ini.

---

## 4. `CORPORATE_ACTION`

| Endpoint | Fungsi | Credit |
|---|---|---|
| `fetch-corporate-actions` | Riwayat lengkap stock split, right issue, warrant, bonus share, agenda RUPS, dividen historis & mendatang | 1 credit |
| `fetch-company-report` (section `dividend` saja) | Dividend yield TTM, payout ratio, ex-dividend date | 1 credit |
| `fetch-free-float` | Free float % — relevan untuk konteks dampak buyback | 1 credit/100 perusahaan |

**Field kunci:** riwayat dividen (nilai per saham, cum date, ex-date, payment date),
agenda/hasil RUPS(LB), riwayat stock split/right issue/bonus share, `yield_ttm`,
`payout_ratio`, `cash_payout_ratio`.

**Catatan:** Endpoint ini **tidak mencakup detail buyback** (jumlah saham dibeli
kembali, nilai realisasi) secara eksplisit di skema saat ini — kalau berita spesifik
soal progres buyback, detail realisasi kemungkinan besar tetap harus diambil dari isi
berita RSS, Sectors.app hanya memperkuat konteks dividend/RUPS di sekitarnya.

---

## 5. `IPO_RIGHTS_ISSUE`

| Endpoint | Fungsi | Credit | Syarat |
|---|---|---|---|
| `fetch-listing-performance` | Performa harga sejak listing (7/30/90/365 hari) | 1 credit | **Hanya untuk ticker yang listing setelah Mei 2005** dan sudah resmi tercatat |
| `fetch-corporate-actions` | Cek status right issue/stock split resmi | 1 credit | Emiten sudah punya ticker |
| `fetch-free-float` | Dampak dilusi kepemilikan pasca right issue | 1 credit/100 perusahaan | Emiten sudah punya ticker |
| `fetch-shareholders-composition` | Komposisi kepemilikan bulanan (lokal/asing per kategori investor) | 1 credit | Data tersedia mulai 2021 |

**Dua skenario berbeda:**
1. **Right issue/stock split emiten existing** (sudah listing) → semua endpoint di
   atas bisa dipakai normal dengan `symbol` ticker yang sudah ada.
2. **IPO calon emiten baru** (belum listing) → **tidak ada endpoint Sectors.app yang
   bisa dipakai** karena emiten belum ada di database IDX. Semua data (target dana,
   harga penawaran, jumlah saham dilepas, penggunaan dana, jadwal listing) wajib
   diambil murni dari isi berita RSS/prospektus — **jangan mencoba memanggil
   `fetch-company-report` atau endpoint lain dengan ticker yang belum eksis.**

---

## 6. `SUSPENSION_DELISTING`

| Endpoint | Fungsi | Credit |
|---|---|---|
| `fetch-suspensions` | Tanggal suspensi, alasan resmi, link PDF notice BEI (filter by `symbol`/tanggal) | 1 credit |
| `fetch-company-report` (section `overview` saja) | Konteks singkat: market cap, sektor emiten yang disuspensi | 1 credit |

**Field kunci:** `suspension_date`, alasan resmi suspensi, link dokumen resmi BEI
(bisa dipakai sebagai sumber sekunder untuk field `source` di slide KRONOLOGI selain
berita RSS itu sendiri), plus konteks singkat dari `overview` (market cap & sektor)
supaya audiens paham skala emiten yang terdampak.

---

## RINGKASAN CEPAT (Referensi Lookup)

| Kategori | Endpoint Utama | Endpoint Pelengkap | Estimasi Credit* |
|---|---|---|---|
| SINGLE_STOCK | `fetch-company-report` | `fetch-foreign-flow` | ~4-6 |
| MACRO_ECONOMY | `fetch-index-daily` | `fetch-idx-market-cap`, `fetch-companies-top-changes`, `fetch-most-traded-stocks` | ~5-6 |
| SECTOR_ANALYSIS | `fetch-subsector-report` | `fetch-companies-top-changes`, `fetch-most-traded-stocks`, `fetch-companies-by-subsector` | ~6-8 |
| CORPORATE_ACTION | `fetch-corporate-actions` | `fetch-company-report` (dividend), `fetch-free-float` | ~2-3 |
| IPO_RIGHTS_ISSUE | `fetch-listing-performance` | `fetch-corporate-actions`, `fetch-free-float`, `fetch-shareholders-composition` | ~3-4 (emiten baru: 0, murni dari berita) |
| SUSPENSION_DELISTING | `fetch-suspensions` | `fetch-company-report` (overview) | ~2 |

*\*Estimasi asumsi memilih section/parameter secukupnya, bukan default penuh.*

---

## CATATAN IMPLEMENTASI UNTUK ORCHESTRATOR (n8n)

1. Setelah LLM 1 (Classifier) mengembalikan `category` + `ticker`/`sector`,
   orchestrator baru memanggil endpoint Sectors.app sesuai tabel di atas — **bukan
   sebelum klasifikasi selesai** (hindari pemanggilan API yang sia-sia untuk berita
   yang akhirnya di-skip).
2. Untuk `SECTOR_ANALYSIS`, orchestrator perlu langkah tambahan: mapping nama sektor
   bebas dari classifier ke slug kebab-case resmi (bisa pakai endpoint
   `fetch-industries`/daftar subsectors sebagai referensi) sebelum memanggil
   `fetch-subsector-report`.
3. Untuk `IPO_RIGHTS_ISSUE`, orchestrator wajib cek dulu apakah `ticker` terisi
   (hasil dari LLM 1). Kalau `ticker: null` (emiten belum listing), **skip semua
   panggilan API Sectors.app** dan langsung teruskan isi berita mentah ke LLM 2.
4. Simpan hasil mentah panggilan API ke Supabase (`content_logs.slides_json` atau
   kolom terpisah) untuk audit — supaya kalau ada komplain "data ini kok beda dari
   Sectors.app", tim bisa cek snapshot data yang dipakai saat generate.

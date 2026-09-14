# 📋 REVISI FORMAT — DAILY MARKET BRIEF (Gen Z)
### 2 Template: VISUAL (IG + TikTok) & TEXT (Telegram + Threads)
> Status: TEMPLATE KOSONG — belum ada MCP call. Placeholder pakai format {{FIELD}} yang dipetakan ke endpoint Sectors.
> Watchlist dipangkas dari 5 → **3-4 saham** sesuai arahan.

---

## 🔑 Kenapa direvisi

| Masalah versi lama | Perbaikan |
|---|---|
| IG: 5 watchlist slide, tiap slide ada tabel 4 baris → berat buat swipe | Watchlist dipangkas 3-4, tabel diganti 1-2 baris "gap" paling penting aja |
| Telegram: isinya copy hampir 1:1 dari IG (duplikat) | Telegram jadi versi **ringkasan cepat**, bukan mini-carousel |
| Threads & TikTok belum ada bentuknya | Threads = pakai kerangka Telegram (text). TikTok = pakai kerangka IG (visual, tinggal convert ke slide vertikal/voice-over) |
| Data placeholder ([ISI DATA]) nyampur sama data dummy — rawan kebawa ke production | Semua placeholder dikasih tag jelas terhubung ke endpoint spesifik, gampang di-track |

---

## 🎨 FORMAT 1 — VISUAL (dasar untuk IG Carousel & TikTok)

**Prinsip:** hook cepat & scannable di slide TL;DR/movers, tapi watchlist tetap detail lengkap (PER/PBV/ROE/DER) karena ini yang dipakai buat keputusan — cuma dirapihin biar gampang dibaca. Total 9-10 slide.

### Slide 1 — Cover
```
☕📈 MARKET BRIEF
Senin, {{TANGGAL}}
"Yang perlu lo tau sebelum bel bursa bunyi"
```

### Slide 2 — TL;DR (gabungan IHSG + Global + Rupiah)
```
📉 IHSG: {{IHSG_PREV}} → {{IHSG_LAST}} ({{IHSG_PCT_CHG}})
   [sumber: index-daily/ihsg]
🌍 Global: {{FTSE_LAST}} ({{FTSE_PCT_CHG}})
   [sumber: index-daily/ftse]
🏛️ Kebijakan/Berita utama: {{NEWS_HEADLINE_1}}
   [sumber: news, limit 2]
```
*Catatan: kalau field rupiah/global lain nggak ada di endpoint yang di-approve, jangan dipaksa isi — cukup yang ada datanya (IHSG & FTSE).*

### Slide 3 — Top Movers (gainers + losers digabung 1 slide, bukan tabel panjang)
```
🚀 TOP GAINERS (1D)
{{GAINER_1}} +{{PCT}}  {{GAINER_2}} +{{PCT}}  {{GAINER_3}} +{{PCT}}

🩸 TOP LOSERS (1D)
{{LOSER_1}} -{{PCT}}  {{LOSER_2}} -{{PCT}}  {{LOSER_3}} -{{PCT}}
```
*(dari 5 jadi 3 tiap sisi biar 1 slide nggak penuh — sisanya opsional di caption)*

### Slide 4-7 — Watchlist (3-4 saham, 1 slide/saham, detail lengkap)
```
{{EMOJI}} {{TICKER}} — {{NAMA_PERUSAHAAN}}
{{MOMENTUM_TAG}} (mis: "+84% 30D" / "Laba +34% YoY")

APA? {{SATU_KALIMAT_EVENT}}
KENAPA? {{SATU_KALIMAT_KONTEKS}}

📊 Valuasi vs Sektor {{NAMA_SEKTOR}}
PER   : {{PER}}   vs sektor {{PER_SEKTOR}}   {{SINYAL}}
PBV   : {{PBV}}   vs sektor {{PBV_SEKTOR}}   {{SINYAL}}
ROE   : {{ROE}}   vs sektor {{ROE_SEKTOR}}   {{SINYAL}}
DER   : {{DER}}   vs sektor {{DER_SEKTOR}}   {{SINYAL}}

TL;DR: {{SATU_KALIMAT_KESIMPULAN}}
```
*Format sama kayak versi lama (4 metrik lengkap), cuma dirapihin: baris disejajarkan, sinyal emoji (✅ lebih baik dari sektor / ⚠️ lebih mahal-berisiko / — netral) biar langsung kebaca tanpa mikir.*
*Sumber: `company/report/{{TICKER}}` (sections=valuation,financials,peers)*

### Slide 8 — Kamus Ala Gen Z (edukasi istilah, konten statis — nggak butuh data Sectors)
```
📖 KAMUS ALA GEN Z
Biar lo ngerti istilah di slide sebelumnya 👆

PER (Price to Earnings Ratio)
→ "Berapa tahun balik modal kalau laba perusahaan segini terus."
Analoginya: beli HP Rp15jt, tiap tahun lo "untung" Rp1jt dari
pemakaian/produktivitas → PER = 15x, alias 15 tahun modal balik.
Makin kecil = makin cepet "balik modal".

PBV (Price to Book Value)
→ "Lo bayar berapa kali lipat dari aset bersih perusahaan."
Analoginya: beli barang preloved. Kalau harga aslinya Rp1jt tapi
lo bayar Rp3jt (PBV 3x), berarti lo bayar mahal buat "brand" atau
ekspektasi, bukan buat barangnya doang.

ROE (Return on Equity)
→ "Seberapa efisien modal sendiri perusahaan menghasilkan cuan."
Analoginya: 2 temen sama-sama modal patungan bisnis jastip.
Yang modal Rp1jt untung Rp200rb (ROE 20%) lebih jago ngolah
modal daripada yang modal Rp5jt untung Rp200rb (ROE 4%).

DER (Debt to Equity Ratio)
→ "Utang perusahaan dibanding modal sendiri."
Analoginya: kayak paylater. DER 1x = utang lo sama gede sama
modal sendiri. DER 3x = utang lo 3x lipat modal sendiri —
makin gede, makin gampang "kepontal" kalau ada masalah.

💡 Nggak ada angka "pasti bagus" — semua musti dibandingin sama
rata-rata sektornya. Makanya tiap slide watchlist selalu ada
kolom "vs sektor".
```

### Slide 9 — Kesimpulan (bullet super pendek)
```
✨ SO GIMANA?
• Murah & berkualitas: {{TICKER}}
• Mahal karena hype: {{TICKER}}
• Murah karena berisiko: {{TICKER}}
```

### Slide 10 — CTA
```
💬 Dari watchlist ini, lo pilih mana? Drop di komen 👇
⚠️ DYOR — edukasi, bukan ajakan jual/beli.
```

**Untuk TikTok:** pakai kerangka yang sama persis, tinggal convert tiap slide jadi 1 scene vertikal (teks on-screen pendek + voice-over baca poin utama). Slide 4-7 (watchlist, 4 metrik) bisa dipercepat jadi ~5-7 detik/saham biar sempet kebaca. Slide 8 (Kamus) opsional dipisah jadi video sendiri (evergreen, nggak perlu update tiap hari) — bisa di-reuse berkali-kali, nggak harus nempel di brief harian.

---

## 💬 FORMAT 2 — TEXT (dasar untuk Telegram & Threads)

**Prinsip:** bullet cepat, tanpa tabel, tanpa duplikasi penuh dari visual. Fokus angka + 1 kesimpulan per poin, bukan narasi panjang.

```
☕ MARKET BRIEF — {{TANGGAL}}

📉 IHSG: {{IHSG_PREV}} → {{IHSG_LAST}} ({{IHSG_PCT_CHG}})
🌍 Global: {{FTSE_LAST}} ({{FTSE_PCT_CHG}})

🚀 Top Gainers: {{G1}} +{{PCT}} • {{G2}} +{{PCT}} • {{G3}} +{{PCT}}
🩸 Top Losers: {{L1}} -{{PCT}} • {{L2}} -{{PCT}} • {{L3}} -{{PCT}}

🔥 Watchlist:
• {{TICKER1}} — PER {{PER}} | PBV {{PBV}} | ROE {{ROE}} | DER {{DER}} (vs sektor {{SEKTOR_RATA2}}) {{SINYAL}} — {{SATU_BARIS_INSIGHT}}
• {{TICKER2}} — PER {{PER}} | PBV {{PBV}} | ROE {{ROE}} | DER {{DER}} (vs sektor {{SEKTOR_RATA2}}) {{SINYAL}} — {{SATU_BARIS_INSIGHT}}
• {{TICKER3}} — PER {{PER}} | PBV {{PBV}} | ROE {{ROE}} | DER {{DER}} (vs sektor {{SEKTOR_RATA2}}) {{SINYAL}} — {{SATU_BARIS_INSIGHT}}

📅 Corporate action: {{FILING_HEADLINE}}
🗞️ Berita: {{NEWS_HEADLINE}}

📊 Kesimpulan: {{SATU_KALIMAT_RANGKUMAN}}

⚠️ DYOR — edukasi, bukan ajakan jual/beli.
```
*Kamus istilah (PER/PBV/ROE/DER) nggak perlu ditempel tiap hari di Telegram/Threads — cukup dikirim 1x sebagai pesan pinned/reference, terus tinggal di-link balik kalau ada follower baru nanya.*

**Untuk Threads:** pakai template yang sama, tapi karena limit ~500 karakter/post, dipecah jadi thread:
- Post 1: Cover + IHSG + Global (hook)
- Post 2 (reply): Top movers
- Post 3 (reply): Watchlist
- Post 4 (reply): Kesimpulan + DYOR

**Untuk Telegram:** bisa langsung 1 pesan utuh (limit 4.096 karakter, masih longgar), seperti contoh di atas.

---

## 🗺️ Mapping placeholder → endpoint (buat referensi pas run MCP nanti)

| Placeholder | Endpoint |
|---|---|
| `{{IHSG_PREV}}`, `{{IHSG_LAST}}`, `{{IHSG_PCT_CHG}}` | `index-daily/ihsg` |
| `{{FTSE_LAST}}`, `{{FTSE_PCT_CHG}}` | `index-daily/ftse` |
| `{{GAINER_n}}` | `companies/top-changes` (classifications=top_gainers) |
| `{{LOSER_n}}` | `companies/top-changes` (classifications=top_losers) |
| `{{NEWS_HEADLINE_n}}` | `news` (limit 2) |
| `{{FILING_HEADLINE}}` | `filings` (limit 2) |
| `{{TICKER}}`, metrik valuasi/financials/peers | `company/report/{TICKER}` (sections=valuation,financials,peers) — dijalankan 3-4x, 1x per watchlist |

---

## ⚠️ Yang masih perlu keputusan kamu sebelum saya run MCP

1. **Watchlist 3-4 saham** — kamu mau saya pilih otomatis (misal berdasarkan top gainers/losers hari itu + 1 saham "quality" kayak ANTM di contoh lama), atau kamu tentuin ticker-nya?
2. Untuk data "hari ini" karena Senin, kemungkinan data terbaru dari Sectors adalah Jumat — mau saya proses seperti itu (dan saya sebutkan tanggal data asli, bukan diklaim "hari ini")?

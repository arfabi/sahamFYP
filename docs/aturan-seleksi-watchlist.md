# 📋 ATURAN TETAP — KRITERIA SELEKSI WATCHLIST
### Status: BELUM DIJALANKAN — dokumen aturan, bukan hasil run MCP
> Menggantikan metode lama (ambil dari top gainers/losers kemarin) dengan metode berbasis katalis (news/filings hari ini).

---

## 🎯 Prinsip Dasar

**Lama:** Watchlist diambil dari top gainers/losers 1 hari terakhir → ini **backward-looking**, harga udah lewat, nggak actionable buat pembaca.

**Baru:** Watchlist diambil dari saham yang punya **katalis** hari ini/kemarin (news & filings) → **forward-looking**, ngasih tau apa yang perlu diwaspadai *sebelum* efeknya ke harga kelihatan penuh.

**Batasan penting:** Kita **tidak pernah memprediksi arah harga**. Watchlist ini soal "saham mana yang punya alasan kuat buat dipantau", bukan "saham mana yang bakal naik". Simpulan arah harga diserahkan ke pembaca — kita cuma nyediain bahan (katalis + fundamental).

---

## 🔢 Langkah Seleksi

### 1. Tarik data dengan limit lebih besar
- `news`: limit 10-15 (bukan 2), rentang tanggal H-1 sampai hari ini
- `filings`: limit 10-15 (bukan 2), rentang sama
- Limit kecil (2) bikin pool kandidat terlalu sempit — kadang cuma nyisa cerita lemah (contoh: insider selling rutin) karena kepotong duluan.

### 2. Filter pakai sinyal objektif dari Sectors, bukan feeling
Tiap item `news` punya field `tags` dan `dimension` (skor per kategori: future, financials, ownership, valuation, management, dll) — pakai ini sebagai filter, bukan penilaian subjektif.

**Prioritaskan tags/kategori berikut** (sinyal katalis kuat):
- Rights Issue / Capital & Funding
- Mergers & Acquisitions
- Executive Changes (terutama kalau dibarengi Bearish tag atau ada kata "suspensi"/"resign massal")
- Ownership change (akuisisi mayoritas, tender offer)
- Insider trading dengan `transaction_value` besar atau pola berulang (5+ transaksi berturut dari holder yang sama dalam waktu singkat)

**Deprioritaskan / skip:**
- Insider trading kecil, transaksi tunggal, tanpa pola (contoh: 1x jual saham nominal kecil, nggak ada konteks lain)
- Berita rutin tanpa dampak jelas ke valuasi/struktur perusahaan (misal: pengumuman jadwal RUPS biasa tanpa agenda khusus)

### 3. Cross-check tiap kandidat ke `company/report`
Untuk tiap saham yang lolos filter tags, tarik `sections=valuation,financials,peers` dan cek:
- Apakah fundamentalnya (PER/PBV/ROE/DER vs sektor) **mendukung** cerita di berita, atau malah **bertentangan**?
- Kalau bertentangan (berita heboh/bullish tapi fundamental lemah — rugi, PBV ekstrem, ekuitas negatif, DER jauh di atas sektor) → **WAJIB kasih note eksplisit**, format kayak pattern FORU:

  > "Cerita korporasinya heboh, tapi harga sekarang udah 'harga cerita' — [metrik] itu ekstrem, jauh dari kinerja aktual perusahaan."

- Kalau fundamental justru mendukung/netral → note singkat aja, nggak perlu warning berat.

### 4. Bahasa — hindari framing prediksi arah harga
| ❌ Jangan | ✅ Pakai |
|---|---|
| "Saham yang bakal naik" | "Saham dengan katalis kuat hari ini" |
| "Worth dibeli karena rumor X" | "Ada rumor X yang lagi gerakin sentimen" |
| "Bakal lanjut naik" | "Momentum masih berlangsung, belum tentu didukung fundamental" |
| "Ini peluang bagus" | "Ini yang perlu lo pantau, dan ini kenapa" |

Kita deskriptif soal apa yang terjadi + apa kata fundamentalnya. Kesimpulan "layak masuk atau nggak" itu keputusan pembaca sendiri.

### 5. Fallback kalau katalis hari itu sepi
Kalau setelah filter tags, kandidat yang lolos kurang dari 3 saham → lengkapi sisa slot watchlist dari top gainers/losers 1D **sebagai pelengkap**, bukan sumber utama. Beri label beda di brief supaya jelas mana yang "katalis berita" vs "top mover harga" — jangan dicampur tanpa keterangan.

### 6. Disclaimer diperkuat, bukan cuma "DYOR" generik
Tambahan khusus untuk saham dengan pola "cerita heboh vs fundamental lemah" (kayak FORU):

> ⚠️ Kalau mau trading berdasarkan momentum kayak gini, hati-hati — situasi seperti ini bisa berbalik cepat begitu euforia beritanya reda. DYOR, dan perhatikan bedanya antara "ramai karena berita" sama "naik karena kinerja".

---

## 🗂️ Ringkasan alur (buat referensi cepat pas eksekusi nanti)

```
1. Tarik news (limit 10-15) + filings (limit 10-15), H-1 s/d hari ini
2. Filter pakai tags/dimension → prioritaskan capital action, M&A,
   executive changes signifikan, insider trading dengan pola
3. Cross-check tiap kandidat lolos ke company/report
   (valuation, financials, peers)
4. Kalau fundamental vs cerita berita BERTENTANGAN → wajib note
   eksplisit "cerita vs kinerja aktual" + disclaimer trading hati-hati
5. Kalau kandidat < 3 → lengkapi dari top gainers/losers,
   dengan label jelas "pelengkap top mover", bukan "katalis berita"
6. Bahasa selalu deskriptif (apa yang terjadi + apa kata fundamental),
   TIDAK PERNAH memprediksi arah harga
```

---

## ⚠️ Yang masih perlu keputusan kamu sebelum ini dieksekusi

1. **Limit news/filings** — saya usulkan 10-15. Oke, atau mau angka lain? (makin besar limit = makin banyak API credit terpakai per run)
2. **Ambang "insider trading dengan pola"** — saya usulkan minimal 5 transaksi berturut dari holder yang sama. Oke, atau mau threshold beda?
3. **Jumlah watchlist tetap 3-4 saham**, atau mau disesuaikan (misal kalau katalisnya kuat semua, boleh nambah)?

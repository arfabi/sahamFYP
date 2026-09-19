# 🎬 Storyboard & Pitch Script — SahamFYP
**Submission for Sectors Hackathon 2026 (Track: Automation & Workflows)**

---

## ⚡ One-Sentence Problem Statement

> **"SahamFYP melindungi 54%+ investor Gen Z dari jebakan pom-pom media sosial dengan mentransformasi riset sekuritas dan keterbukaan informasi yang tebal menjadi visual watchlist harian berbasis data Sectors API — lengkap dengan bedah katalis dan sistem peringatan risiko (warning) objektif."**

*(Versi Bahasa Inggris untuk juri internasional)*:
> **"SahamFYP protects Gen Z investors from social media pump-and-dump traps by converting dense securities research and corporate filings into bite-sized, visual watchlists powered by Sectors API — complete with catalyst breakdown and an objective risk-warning system."**

---

## 📽️ Video 1: 1-Minute Teaser Video (60 Detik)
*Tujuan: Hook agresif, visual memukau, demonstrasi end-to-end otomatisasi dan value prop "Anti-FOMO". Layak diposting di YouTube Shorts, TikTok, Instagram Reels, dan Twitter.*

| Waktu | Visual & Screen Recording yang Dibutuhkan | Overlay Text di Layar | Voiceover / Narasi (Audio) |
|---|---|---|---|
| **00:00 - 00:08** *(8s)* | **B-Roll / Screen Recording:** Cuplikan cepat scroll grup Telegram "Saham Cuan 100%", screenshot story IG influencer saham, dan teks chat "Besok ARA borong!". Lalu efek suara *glitch/buzz* dan tanda silang merah besar. | ❌ **Beli Saham Modal FOMO & Pom-pom Telegram?** | *"Pernah boncos beli saham cuma gara-gara liat screenshot cuan di grup Telegram atau hype di TikTok?"* |
| **00:08 - 00:16** *(8s)* | **Visual:** Tumpukan PDF riset sekuritas 30 halaman, font kecil, chart rumit, tulisan tabel abu-abu yang pusing dibaca. Lalu animasi orang pusing/scroll malas. | 📄 **Riset Sekuritas: Akurat, tapi pusing dibaca!** | *"Padahal analis sekuritas udah bikin riset resmi. Masalahnya: siapa yang sanggup baca PDF 30 lembar penuh angka kaku tiap pagi?"* |
| **00:16 - 00:26** *(10s)* | **Screen Recording UI:** SahamFYP Dashboard & Workflow n8n menyala otomatis. Menampilkan data Sectors API masuk real-time, LLM mengekstrak 3W (*What, Why, Impact*). | ⚡ **Meet SahamFYP: AI Market Brief & Reality Check** | *"Kenalin SahamFYP. Engine otomatis bertenaga Sectors API yang merangkum berita & keterbukaan informasi BEI, memilih katalis paling kuat, dan menerjemahkannya ke bahasa yang kita paham."* |
| **00:26 - 00:40** *(14s)* | **Screen Recording Carousel:** Zoom in ke slide carousel SahamFYP. Tampilkan slide **Matrix Kuadran** dan slide **Risk Warning**: *"Hype Tinggi tapi Fundamental Boncos: Awas Trap!"* dengan badge merah menyala. | 🚨 **Bukan Asal Hype: Ada Warning & Bedah Fundamental!** | *"Tapi kita nggak asal ngajak beli. Walaupun sahamnya lagi viral, kalau valuasinya kemahalan atau perusahaannya rugi, SahamFYP bakal kasih WARNING keras: 'Hati-hati Jebakan Batman!'."* |
| **00:40 - 00:52** *(12s)* | **Screen Recording:** Hasil render otomatis Browserless → postingan live di Instagram @sahamfyp, TikTok, dan notifikasi Telegram selesai dalam hitungan detik tanpa disentuh manusia. | 🤖 **100% Unattended Automation (n8n + Sectors REST API)** | *"Semua ini berjalan otonom tiap jam 8 pagi. Dari tarikan data Sectors API, kalkulasi teknikal, render visual, sampai publish ke 5 medsos sekaligus."* |
| **00:52 - 01:00** *(8s)* | **Branding End Screen:** Logo SahamFYP + Powered by Sectors.app + Handle [@sahamfyp](https://instagram.com/sahamfyp) + CTA. | 💡 **Investasi Pake Data, Bukan Hype. Cek @sahamfyp!** | *"Investasi cerdas pakai data, bukan FOMO. SahamFYP — Make Market Data Make Sense."* |

---

## 🎥 Video 2: 3-Minute Judging Walkthrough (180 Detik)
*Tujuan: Penjelasan komprehensif untuk Juri Hackathon mencakup Problem, Target Audience, Mengapa Sectors API tidak tergantikan, Arsitektur Workflow n8n, Fitur Warning & Reality Check, serta Bukti Live Execution.*

---

### Segment 1: Problem & Target Audience (00:00 - 00:35)
* **Visual:**
  - Data statistik BEI/KSEI (54,4% investor Indonesia adalah Gen Z).
  - Split screen: Sebelah kiri screenshot grup Telegram saham / video TikTok pom-pom ("Saham X mau ke 10.000!"), sebelah kanan file PDF riset harian sekuritas 25 lembar yang kaku dan padat.
* **Overlay Text:**
  - *54.4% Investor BEI adalah Gen Z*
  - *Masalah: FOMO vs PDF Kaku Sekuritas*
* **Voiceover / Narasi:**
  > *"Halo juri Sectors Hackathon 2026. Lebih dari 54% investor di Bursa Efek Indonesia saat ini adalah Gen Z dan generasi muda. Namun, mayoritas dari mereka membeli saham bukan atas dasar analisis, melainkan karena FOMO, pom-pom influencer, dan screenshot profit palsu di media sosial.*  
  > *Sebenarnya, sekuritas dan analis profesional menerbitkan Daily Market Brief dan riset emiten setiap hari. Tapi mari jujur: dokumen PDF puluhan halaman yang kaku dan penuh jargon finansial itu tidak ramah bagi investor muda. Hasilnya? Riset resmi diabaikan, dan retail muda menjadi korban 'exit liquidity' di pasar modal."*

---

### Segment 2: Solusi SahamFYP & Konsep "Warning System" (00:35 - 01:15)
* **Visual:**
  - Logo SahamFYP & tampilan interface Dashboard / output carousel.
  - Tampilkan alur kurasi: **News/Filings Input → AI Catalyst Filter (What, Why, Impact) → Sectors API Enrichment → Watchlist + Warning**.
  - Tampilkan contoh nyata slide: Perbandingan saham dengan fundamental solid vs saham spekulatif yang diberikan badge peringatan *"⚠️ Hype Kosong / Fundamental Merah"*.
* **Overlay Text:**
  - *SahamFYP: AI-Powered Market Brief & Risk Warning*
  - *Curate Catalyst (What, Why, Impact) + Sectors API Reality Check*
* **Voiceover / Narasi:**
  > *"SahamFYP hadir untuk menjembatani kesenjangan ini. SahamFYP adalah automated financial intelligence engine yang mengumpulkan berita pasar dan keterbukaan informasi BEI terhangat, lalu menggunakan AI untuk memfilter katalis terkuat dengan prinsip 3W: Apa peristiwanya, Mengapa terjadi, dan Apa dampaknya ke harga saham.*  
  > *Tapi yang paling krusial: SahamFYP bukan alat promosi saham. SahamFYP adalah 'Reality-Check System'. Kami mengintegrasikan Sectors REST API untuk mengecek kesehatan fundamental dan teknikalnya. Meskipun sebuah saham sedang ramai diperbincangkan, jika valuasinya overvalued ekstrem, utangnya menumpuk, atau asing sedang distribusi masif, sistem kami akan memberikan edukasi dan WARNING objektif kepada audiens: 'Rame doang, fundamental jelek, jangan FOMO!'"*

---

### Segment 3: Deep Dive Core Workflow & Sectors API Backbone (01:15 - 02:05)
* **Visual:**
  - Diagram arsitektur n8n workflow yang sedang aktif (Daily Market Brief & News Monitoring).
  - Tampilkan tabel log Sectors API call yang nyata: `/v2/index-daily/ihsg/`, `/v2/news/`, `/v2/filings/`, `/v2/companies/top-changes/`, `/v2/company/report/{ticker}/`, `/v2/daily/{ticker}/`, `/v2/brokers/top/`.
  - Sorot kalkulasi teknikal: Deteksi Moving Average (MA20/50/200), Golden/Death Cross, dan Foreign Flow.
* **Overlay Text:**
  - *Sectors REST API: The Irreplaceable Truth Engine*
  - *Pipeline: n8n + Sectors REST API + LLM + Browserless + Supabase*
* **Voiceover / Narasi:**
  > *"Di balik layar, track Automation & Workflows ini ditenagai oleh integrasi mendalam dengan Sectors REST API sebagai 'tulang punggung kebenaran data'.*  
  > *Setiap pukul 08:00 WIB, pipeline otomatis kami mengeksekusi rangkaian endpoint Sectors API secara berantai: menarik indeks IHSG harian, filings terbaru, serta pergerakan top movers berkapitalisasi wajar.*  
  > *Saham yang lolos seleksi katalis langsung di-enrich menggunakan endpoint `/v2/company/report/` untuk mengekstrak metrik kunci seperti PER, PBV, ROE, dan DER, serta `/v2/daily/` untuk menghitung Moving Average 20, 50, dan 200 hari guna mendeteksi sinyal Golden Cross atau Death Cross secara matematis. Tanpa Sectors API, produk ini hanya akan menjadi pendaur ulang berita tanpa verifikasi faktual."*

---

### Segment 4: Automasi End-to-End & Live Proof (02:05 - 02:40)
* **Visual:**
  - Screen recording pipeline rendering: Data JSON diubah menjadi HTML template responsif, lalu Browserless.io merender slide menjadi gambar beresolusi tinggi (1080x1350).
  - Gambar tersimpan di Supabase Storage.
  - Repliz API mendistribusikan carousel ke Instagram, Threads, Facebook, TikTok.
  - Tampilkan notifikasi Telegram bot masuk dengan ringkasan eksekusi dan kredit API yang terpakai.
  - Buka akun publik **[@sahamfyp.id](https://instagram.com/sahamfyp.id)** dan tunjukkan postingan real yang sudah terbit beserta engagement audiens.
* **Overlay Text:**
  - *Zero Manual Intervention per Cycle*
  - *Multi-Channel Distribution (IG, TikTok, Threads, FB, Telegram)*
  - *Live on @sahamfyp.id*
* **Voiceover / Narasi:**
  > *"Seluruh proses ini berjalan 100% tanpa campur tangan manusia (unattended). Setelah naskah dan data terverifikasi, skrip HTML langsung dirender menjadi aset visual beresolusi tinggi via Browserless, disimpan di Supabase Storage, dan dipublikasikan serentak ke Instagram, TikTok, Threads, dan Facebook melalui Repliz API.*  
  > *Sistem kemudian mengirimkan laporan audit eksekusi langsung ke Telegram. Ini bukan sekadar mock-up atau prototipe statis: akun @sahamfyp.id sudah aktif beroperasi secara otomatis di media sosial dan mengedukasi investor muda setiap hari sebelum bel pembukaan pasar berbunyi."*

---

### Segment 5: Impact & Penutup (02:40 - 03:00)
* **Visual:**
  - Testimonial / komentar pembaca di Instagram / Telegram.
  - Layar penutup: Logo SahamFYP, badge Sectors Hackathon 2026, URL GitHub repo, dan link dashboard.
* **Overlay Text:**
  - *Empowering 54%+ Next-Gen Investors with Data*
  - *SahamFYP — Make Market Data Make Sense*
* **Voiceover / Narasi:**
  > *"Dengan SahamFYP, kami membuktikan bahwa data pasar modal yang rumit bisa didemokratisasi untuk generasi muda tanpa harus mengorbankan integritas data dan analisis risiko. Dari data sekuritas yang kaku, menjadi edukasi visual yang melindungi portofolio Gen Z.*  
  > *Saya Ahmad Ridlo Fadlli Robbi, terima kasih kepada Sectors.app dan dewan juri Sectors Hackathon 2026."*

---

## 📋 Checklist Pengambilan Footage / Aset Video

Sebelum merekam suara dan editing, pastikan Anda telah menyiapkan aset-aset berikut:

- [ ] **Tangkapan Layar Sosmed / Hype (Detik 00:00 - 00:10)**
  - Screenshot obrolan grup Telegram pom-pom saham / ajakan beli tanpa dasar.
  - Screenshot postingan media sosial bertema "saham ini to the moon".
- [ ] **Tangkapan Layar PDF Riset Sekuritas (Detik 00:10 - 00:20)**
  - Buka satu contoh PDF Market Brief harian sekuritas (20+ halaman, chart padat, tabel font kecil) untuk visual pembanding.
- [ ] **Screen Recording Workflow n8n (Detik 01:15 - 01:40)**
  - Tampilkan canvas n8n dengan node-node aktif (Schedule Trigger, HTTP Request Sectors API, LLM Node, Browserless Node).
- [ ] **Screen Recording Terminal / API Call Logs (Detik 01:40 - 02:00)**
  - Tampilkan log eksekusi API (seperti log `/v2/daily/`, `/v2/company/report/`, status 200 OK, response JSON Sectors).
- [ ] **Screen Recording Render & Slide Result (Detik 02:00 - 02:25)**
  - Scroll slide carousel yang memuat Cover, TL;DR, Bedah Data, Matrix Kuadran Fundamental x Teknikal, dan Slide Warning.
- [ ] **Screen Recording Akun Live & Telegram (Detik 02:25 - 02:40)**
  - Tampilan postingan asli di Instagram `@sahamfyp.id` atau platform terkait.
  - Notifikasi bot Telegram yang melaporkan status eksekusi berhasil dan kredit Sectors API yang terpakai.

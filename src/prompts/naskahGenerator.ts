// ============================================================
// Naskah Generator Prompts (LLM 2) — Part 1: Constants
// 6 prompt template — satu per kategori berita
// Output: JSON CarouselData (8 slide)
// ============================================================

/** Tipe kategori yang didukung */
export type CategoryType =
  | 'SINGLE_STOCK'
  | 'MACRO_ECONOMY'
  | 'SECTOR_ANALYSIS'
  | 'CORPORATE_ACTION'
  | 'IPO_RIGHTS_ISSUE'
  | 'SUSPENSION_DELISTING';

/** Struktur output JSON yang diminta dari LLM */
export const OUTPUT_SCHEMA = `{
  "handle": "@sahamfyp",
  "badgeText": "Badge singkat (max 20 char)",
  "badgeBgColor": "#14182B",
  "badgeTextColor": "#FFFFFF",
  "textColor": "#14182B",
  "bgColor": "#F5F1E7",
  "slides": [
    { "template": "cover", "title": "...", "description": "...", "visualIcon": "TrendingUp", "accent": "#F2A93B" },
    { "template": "tldr", "title": "TL;DR", "tldrCards": [{ "icon": "...", "text": "..." }], "accent": "#F2A93B" },
    { "template": "kronologi", "title": "Kronologi", "description": "... (maks 30 kata)", "source": "Nama sumber berita", "visualIcon": "Coins", "accent": "#F2A93B" },
    { "template": "data", "title": "...", "metrics": [{ "icon": "...", "label": "...", "value": "...", "caption": "...", "tone": "amber|sage" }], "accent": "#F2A93B" },
    { "template": "pros", "title": "...", "bullets": [{ "icon": "CheckCircle2", "text": "..." }], "accent": "#4CAF7D" },
    { "template": "cons", "title": "...", "bullets": [{ "icon": "AlertTriangle", "text": "..." }], "accent": "#E4572E" },
    { "template": "standar", "title": "Kesimpulan", "description": "...", "visualIcon": "Scale", "accent": "#F2A93B" },
    { "template": "cta", "title": "Gimana Menurutmu?", "description": "...", "disclaimer": "Do Your Own Research (DYOR).", "visualIcon": "MessageCircle", "accent": "#F2A93B" }
  ]
}`;

/** Aturan umum yang berlaku untuk semua kategori */
export const COMMON_RULES = `
ATURAN WAJIB:
1. Output HARUS JSON valid — tanpa markdown, tanpa teks di luar JSON.
2. Semua field wajib diisi — jangan biarkan string kosong, gunakan "-" jika data tidak tersedia.
3. JANGAN mengarang data. Jika data enrichment tidak ada, skip metrik tersebut atau tulis "Data tidak tersedia".
4. Bahasa: Indonesia informal ala Instagram (gaya @sahamfyp) — "lo", "gue", analogi sehari-hari.
5. Slide 5 & 6 wajib format: Point (bold) + Explanation (1-2 kalimat analogi).
6. Slide 8 (CTA) wajib ada disclaimer DYOR.
7. Total 8 slides persis — jangan lebih, jangan kurang.
8. visualIcon harus salah satu dari: ArrowLeftRight, ArrowRight, AlertTriangle, BadgePercent, BarChart3, ChartNoAxesCombined, CheckCircle2, Coins, DollarSign, Eye, Flame, Gauge, Globe, Handshake, MessageCircle, Pickaxe, Rocket, Scale, Sparkles, ThumbsUp, TrendingUp, Wallet.
9. tone metrics hanya "amber" atau "sage".
10. accent: cover/tldr/kronologi/data/standar/cta = "#F2A93B", pros = "#4CAF7D", cons = "#E4572E".
11. KRONOLOGI (slide 3): description WAJIB MAKSIMAL 30 KATA — JANGAN LEBIH! Cek sendiri word count (split teks by spasi) sebelum output, potong jika lebih. Sumber/gambar kredit set di field "source", NUN di description.
`;


// ============================================================
// Part 2: Prompt Functions per Kategori
// ============================================================

/** Prompt untuk kategori SINGLE_STOCK */
function promptSingleStock(title: string, content: string, data: Record<string, any>): string {
  return `
Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita analisis emiten tunggal.

BERITA:
- Judul: ${title}
- Isi: ${content}

DATA ENRICHMENT (dari Sectors.app):
${JSON.stringify(data, null, 2)}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (angka kunci wajib ada)
3. KRONOLOGI — Narasi konteks berita + sumber
4. BEDAH_DATA — 4-6 metrik dari enrichment (PER, PBV, ROE, EPS, dll)
5. PROS — 2-3 sisi positif (point + explanation)
6. CONS — 2-3 sisi risiko (point + explanation)
7. KESIMPULAN — Rangkuman netral, cocok buat tipe investor apa
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

${COMMON_RULES}

FORMAT OUTPUT:
${OUTPUT_SCHEMA}
`;
}

/** Prompt untuk kategori MACRO_ECONOMY */
function promptMacroEconomy(title: string, content: string, data: Record<string, any>): string {
  return `
Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita makro ekonomi & tren pasar.

BERITA:
- Judul: ${title}
- Isi: ${content}

DATA ENRICHMENT (dari Sectors.app):
${JSON.stringify(data, null, 2)}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (angka kunci: IHSG, market cap, suku bunga)
3. KRONOLOGI — Narasi konteks berita + sumber
4. DAMPAK_PASAR — 4-6 metrik (IHSG, total market cap, top gainer/loser, most traded)
5. DIUNTUNGKAN — 2-3 sektor/sisi yang diuntungkan (point + explanation)
6. PERLU_DIWASPADAI — 2-3 risiko/tantangan (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

${COMMON_RULES}

FORMAT OUTPUT:
${OUTPUT_SCHEMA}
`;
}

/** Prompt untuk kategori SECTOR_ANALYSIS */
function promptSectorAnalysis(title: string, content: string, data: Record<string, any>): string {
  return `
Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita rotasi/sektor analisis.

BERITA:
- Judul: ${title}
- Isi: ${content}

DATA ENRICHMENT (dari Sectors.app):
${JSON.stringify(data, null, 2)}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (PE sektor, top gainer, YTD return)
3. KRONOLOGI — Narasi konteks berita + sumber
4. DATA_SEKTOR — 4-6 metrik (PE median, PBV, market cap sektor, top gainer, YTD)
5. SAHAM_JAGOAN — 2-3 saham yang menonjol di sektor (point + explanation)
6. PERLU_DIWASPADAI — 2-3 risiko sektor (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

${COMMON_RULES}

FORMAT OUTPUT:
${OUTPUT_SCHEMA}
`;
}


/** Prompt untuk kategori CORPORATE_ACTION */
function promptCorporateAction(title: string, content: string, data: Record<string, any>): string {
  return `
Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita aksi korporat (dividen, RUPS, buyback, stock split).

BERITA:
- Judul: ${title}
- Isi: ${content}

DATA ENRICHMENT (dari Sectors.app):
${JSON.stringify(data, null, 2)}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (jenis aksi, nilai, jadwal)
3. KRONOLOGI — Narasi konteks berita + sumber
4. DETAIL_AKSI — 4-6 metrik (jenis, nilai, yield, payout ratio, ex-date, buyback)
5. UNTUNG_BUAT_INVESTOR — 2-3 keuntungan buat investor (point + explanation)
6. PERLU_DIPERHATIKAN — 2-3 hal yang perlu diperhatikan (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

${COMMON_RULES}

FORMAT OUTPUT:
${OUTPUT_SCHEMA}
`;
}

/** Prompt untuk kategori IPO_RIGHTS_ISSUE */
function promptIpoRightsIssue(title: string, content: string, data: Record<string, any>, ticker: string | null): string {
  if (!ticker) {
    return `
Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita IPO baru (calon emiten belum listing).

BERITA:
- Judul: ${title}
- Isi: ${content}

CATATAN: Ini IPO BARU — belum ada data enrichment dari Sectors.app.
Semua data diambil 100% dari isi berita. JANGAN panggil API, JANGAN mengarang data.

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (bisnis, afiliasi, target dana)
3. PROFIL_PERUSAHAAN — Sekilas model bisnis, klien, posisi industri
4. DETAIL_PENAWARAN — 4-6 metrik (harga IPO, jumlah saham, target dana, penggunaan dana, jadwal listing)
5. KENAPA_MENARIK — 2-3 alasan menarik (point + explanation)
6. RISIKO — 2-3 risiko IPO baru (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

${COMMON_RULES}

FORMAT OUTPUT:
${OUTPUT_SCHEMA}
`;
  }

  return `
Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita Right Issue / Stock Split.

BERITA:
- Judul: ${title}
- Isi: ${content}

DATA ENRICHMENT (dari Sectors.app):
${JSON.stringify(data, null, 2)}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (jenis, rasio, harga pelaksanaan, target dana)
3. KRONOLOGI — Narasi konteks berita + sumber
4. SKEMA_AKSI — 4-6 metrik (jenis, jumlah saham baru, harga, rasio, target dana, record date)
5. UNTUNG_BUAT_INVESTOR — 2-3 keuntungan (point + explanation)
6. PERLU_DIWASPADAI — 2-3 risiko/dilusi (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

${COMMON_RULES}

FORMAT OUTPUT:
${OUTPUT_SCHEMA}
`;
}

/** Prompt untuk kategori SUSPENSION_DELISTING */
function promptSuspensionDelisting(title: string, content: string, data: Record<string, any>): string {
  return `
Kamu adalah AI Content Writer untuk @sahamfyp — akun edukasi saham Indonesia.
Tugasmu: tulis naskah carousel 8 slide untuk berita suspensi/delisting saham.

BERITA:
- Judul: ${title}
- Isi: ${content}

DATA ENRICHMENT (dari Sectors.app):
${JSON.stringify(data, null, 2)}

STRUKTUR 8 SLIDE:
1. COVER — Headline menarik + sub judul (hook pertanyaan)
2. TLDR — 3-4 poin ringkasan (tanggal, alasan, jenis suspensi, harga terakhir)
3. KRONOLOGI — Narasi konteks berita + sumber (link PDF resmi BEI jika ada)
4. FAKTA_SUSPENSI — 4-6 metrik (tanggal, alasan, harga, 52w range, market cap, sektor)
5. APA_ITU_SUSPENSI — 2-3 edukasi mekanisme suspensi (point + explanation)
6. YANG_PERLU_DILAKUKAN — 2-3 langkah yang harus diambil investor (point + explanation)
7. KESIMPULAN — Rangkuman netral
8. CTA_DYOR — Ajakan diskusi + disclaimer DYOR

${COMMON_RULES}

FORMAT OUTPUT:
${OUTPUT_SCHEMA}
`;
}

// ============================================================
// Part 3: Factory Function
// ============================================================

/** Pilih prompt berdasarkan kategori */
export function buildNaskahPrompt(
  category: CategoryType,
  title: string,
  content: string,
  enrichmentData: Record<string, any>,
  ticker: string | null,
): string {
  switch (category) {
    case 'SINGLE_STOCK':
      return promptSingleStock(title, content, enrichmentData);
    case 'MACRO_ECONOMY':
      return promptMacroEconomy(title, content, enrichmentData);
    case 'SECTOR_ANALYSIS':
      return promptSectorAnalysis(title, content, enrichmentData);
    case 'CORPORATE_ACTION':
      return promptCorporateAction(title, content, enrichmentData);
    case 'IPO_RIGHTS_ISSUE':
      return promptIpoRightsIssue(title, content, enrichmentData, ticker);
    case 'SUSPENSION_DELISTING':
      return promptSuspensionDelisting(title, content, enrichmentData);
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

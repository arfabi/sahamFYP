// Templates data for TemplatesPage
import type { TemplateId } from '../Templates';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  layout: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  templates: string[];
  api: string;
  apiEndpoint: string;
  promptStrategy: string;
}

export const TEMPLATES: TemplateInfo[] = [
  { id: 'cover', name: 'Cover', description: 'Headline + sub-headline + visual', icon: '🎨', layout: 'Header + Title + Description + VisualSlot + Footer' },
  { id: 'tldr', name: 'TL;DR', description: 'Ringkasan cepat 3-4 poin', icon: '📝', layout: 'Header + Title + Card List (icon + text) + Footer' },
  { id: 'kronologi', name: 'Kronologi', description: 'Konteks berita + sumber', icon: '📅', layout: 'Header + Title + Image + Source + Description + Footer' },
  { id: 'data', name: 'Bedah Data', description: 'Kartu metrik dan angka', icon: '📊', layout: 'Header + Title + Metric Cards (label + value + caption) + Source + Footer' },
  { id: 'pros', name: 'Pros', description: 'Sisi positif / keuntungan', icon: '👍', layout: 'Header + Title + Center Icon + Bullet List + Footer' },
  { id: 'cons', name: 'Cons', description: 'Sisi negatif / risiko', icon: '⚠️', layout: 'Header + Title + Center Icon + Bullet List + Footer' },
  { id: 'standar', name: 'Kesimpulan', description: 'Judul + visual + deskripsi', icon: '📌', layout: 'Header + Title + VisualSlot + Description + Source + Footer' },
  { id: 'cta', name: 'CTA', description: 'Call to action penutup', icon: '💬', layout: 'Header + Title + VisualSlot + Description + Disclaimer + Footer' },
];

export const CONTENT_CATEGORIES: ContentCategory[] = [
  {
    id: 'single_stock',
    name: 'SINGLE_STOCK',
    icon: '📈',
    description: 'Analisis Emiten Tunggal - kinerja saham individual (contoh: BUMI, BBNI)',
    templates: ['COVER', 'TLDR', 'KRONOLOGI', 'BEDAH_DATA', 'PROS', 'CONS', 'KESIMPULAN', 'CTA_DYOR'],
    api: 'Sectors.app',
    apiEndpoint: 'fetch-company-report + fetch-foreign-flow',
    promptStrategy: 'Focus on PER, PBV, ROE, EPS, foreign flow, valuation vs peer',
  },
  {
    id: 'macro_economy',
    name: 'MACRO_ECONOMY',
    icon: '🌍',
    description: 'Makro Ekonomi & Tren Pasar - suku bunga, IHSG, inflasi',
    templates: ['COVER', 'TLDR', 'KRONOLOGI', 'DAMPAK_PASAR', 'DIUNTUNGKAN', 'PERLU_DIWASPADAI', 'KESIMPULAN', 'CTA_DYOR'],
    api: 'Sectors.app',
    apiEndpoint: 'fetch-index-daily + fetch-company-report',
    promptStrategy: 'Focus on BI rate impact, IHSG movement, market cap',
  },
  {
    id: 'sector_analysis',
    name: 'SECTOR_ANALYSIS',
    icon: '🏭',
    description: 'Analisis Sektoral - perbandingan antar sektor',
    templates: ['COVER', 'TLDR', 'KRONOLOGI', 'DATA_SEKTOR', 'SAHAM_JAGOAN', 'PERLU_DIWASPADAI', 'KESIMPULAN', 'CTA_DYOR'],
    api: 'Sectors.app',
    apiEndpoint: 'fetch-subsector-report + fetch-company-report',
    promptStrategy: 'Focus on sector comparison, top performers',
  },
  {
    id: 'corporate_action',
    name: 'CORPORATE_ACTION',
    icon: '🏢',
    description: 'Aksi Korporasi - stock split, buyback, M&A',
    templates: ['COVER', 'TLDR', 'KRONOLOGI', 'DETAIL_AKSI', 'UNTUNG_BUAT_INVESTOR', 'PERLU_DIPERHATIKAN', 'KESIMPULAN', 'CTA_DYOR'],
    api: 'Sectors.app',
    apiEndpoint: 'fetch-corporate-actions + fetch-company-report',
    promptStrategy: 'Focus on action type, impact to shareholders, timeline',
  },
  {
    id: 'ipo_rights_issue',
    name: 'IPO_RIGHTS_ISSUE',
    icon: '🚀',
    description: 'IPO & Rights Issue - penawaran saham perdana dan tambahan',
    templates: ['COVER', 'TLDR', 'PROFIL_PERUSAHAAN', 'DETAIL_PENAWARAN', 'KENAPA_MENARIK', 'RISIKO', 'KESIMPULAN', 'CTA_DYOR'],
    api: 'Sectors.app',
    apiEndpoint: 'fetch-ipo-performance + fetch-company-report',
    promptStrategy: 'Focus on IPO price, listing performance, dilution impact',
  },
  {
    id: 'suspension_delisting',
    name: 'SUSPENSION_DELISTING',
    icon: '⚠️',
    description: 'Suspensi & Delisting - penghentian perdagangan saham',
    templates: ['COVER', 'TLDR', 'KRONOLOGI', 'FAKTA_SUSPENSI', 'APA_ITU_SUSPENSI', 'YANG_PERLU_DILAKUKAN', 'KESIMPULAN', 'CTA_DYOR'],
    api: 'Sectors.app',
    apiEndpoint: 'fetch-suspensions + fetch-company-report',
    promptStrategy: 'Focus on suspension reason, BEI announcement, investor action',
  },
];

export const SAMPLE_DATA: Record<TemplateId, any> = {
  cover: { title: 'BBNI Kok Bisa Naik Terus?', description: 'Analisis singkat pergerakan saham BBCA' },
  tldr: {
    title: 'Ringkasan Cepat',
    tldrCards: [
      { id: '1', icon: 'TrendingUp', text: 'BBNI naik 5% dalam 1 hari' },
      { id: '2', icon: 'BarChart3', text: 'Volume transaksi 2x rata-rata' },
      { id: '3', icon: 'CheckCircle2', text: 'Analyst merekomendasikan BUY' },
    ],
  },
  kronologi: { title: 'Kronologi Kejadian', description: '4 Sept 2026: BBNI mulai menguat' },
  data: {
    title: 'Bedah Data',
    metrics: [
      { id: '1', icon: 'TrendingUp', label: 'Harga', value: 'Rp9,800', caption: '+5.2%', tone: 'sage' },
      { id: '2', icon: 'BarChart3', label: 'Volume', value: '125M', caption: 'Di atas rata-rata', tone: 'amber' },
    ],
  },
  pros: {
    title: 'Sisi Positif',
    bullets: [
      { id: '1', icon: 'CheckCircle2', text: 'Fundamental kuat' },
      { id: '2', icon: 'ThumbsUp', text: 'Analyst bullish' },
    ],
  },
  cons: {
    title: 'Sisi Negatif',
    bullets: [
      { id: '1', icon: 'AlertTriangle', text: 'Valuasi mahal' },
      { id: '2', icon: 'TrendingDown', text: 'Tekanan jual' },
    ],
  },
  standar: { title: 'Kesimpulan', description: 'BBNI memiliki prospek jangka menengah yang positif.' },
  cta: { title: 'Follow untuk Info Selanjutnya!', description: 'Like, Share dan Follow!' },
};
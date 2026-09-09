// Manual Editor Data & Types
import type { TemplateId } from '../Templates';

export type ContentCategory = 'SINGLE_STOCK' | 'MACRO_ECONOMY' | 'SECTOR_ANALYSIS' | 'CORPORATE_ACTION' | 'IPO_RIGHTS_ISSUE' | 'SUSPENSION_DELISTING';

export interface ManualSlideData {
  template: TemplateId;
  title: string;
  description: string;
  icon: string;
  tldrCards: Array<{ id: string; icon: string; text: string }>;
  metrics: Array<{ id: string; icon: string; label: string; value: string; caption: string; tone: 'amber' | 'sage' }>;
  bullets: Array<{ id: string; icon: string; text: string }>;
  source: string;
  disclaimer: string;
}

export const CATEGORIES: { id: ContentCategory; name: string; icon: string }[] = [
  { id: 'SINGLE_STOCK', name: 'Single Stock', icon: '📈' },
  { id: 'MACRO_ECONOMY', name: 'Macro Economy', icon: '🌍' },
  { id: 'SECTOR_ANALYSIS', name: 'Sector Analysis', icon: '🏭' },
  { id: 'CORPORATE_ACTION', name: 'Corporate Action', icon: '🏢' },
  { id: 'IPO_RIGHTS_ISSUE', name: 'IPO & Rights Issue', icon: '🚀' },
  { id: 'SUSPENSION_DELISTING', name: 'Suspension & Delisting', icon: '⚠️' },
];

export const TEMPLATE_ICONS = ['TrendingUp', 'BarChart3', 'CheckCircle2', 'Coins', 'Gauge', 'Rocket', 'AlertTriangle', 'ThumbsUp'];

export const uid = () => Math.random().toString(36).slice(2, 10);

export const createEmptySlide = (template: TemplateId): ManualSlideData => ({
  template,
  title: '',
  description: '',
  icon: 'TrendingUp',
  tldrCards: [],
  metrics: [],
  bullets: [],
  source: '',
  disclaimer: 'DYOR - Do Your Own Research',
});

export const DEFAULT_SLIDES: ManualSlideData[] = [
  { ...createEmptySlide('cover'), title: 'Headline', description: 'Sub-headline', icon: 'TrendingUp' },
  { ...createEmptySlide('tldr'), title: 'Ringkasan Cepat', tldrCards: [
    { id: uid(), icon: 'TrendingUp', text: '' },
    { id: uid(), icon: 'BarChart3', text: '' },
    { id: uid(), icon: 'CheckCircle2', text: '' },
  ]},
  { ...createEmptySlide('kronologi'), title: 'Kronologi', description: 'Narasi singkat', source: 'Sumber' },
  { ...createEmptySlide('data'), title: 'Bedah Data', metrics: [
    { id: uid(), icon: 'TrendingUp', label: 'Harga', value: '', caption: '', tone: 'sage' },
    { id: uid(), icon: 'BarChart3', label: 'Volume', value: '', caption: '', tone: 'amber' },
  ]},
  { ...createEmptySlide('pros'), title: 'Sisi Positif', bullets: [
    { id: uid(), icon: 'CheckCircle2', text: '' },
    { id: uid(), icon: 'ThumbsUp', text: '' },
  ]},
  { ...createEmptySlide('cons'), title: 'Sisi Negatif', bullets: [
    { id: uid(), icon: 'AlertTriangle', text: '' },
    { id: uid(), icon: 'TrendingDown', text: '' },
  ]},
  { ...createEmptySlide('standar'), title: 'Kesimpulan', description: 'Rangkuman' },
  { ...createEmptySlide('cta'), title: 'Follow untuk Info Selanjutnya!', description: 'Like, Share dan Follow!', disclaimer: 'DYOR' },
];
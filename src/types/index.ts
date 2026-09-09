// ============================================================
// Carousel Data Types — Output dari Naskah Generator (LLM 2)
// Cocok dengan TemplateBaseProps di Templates.tsx
// ============================================================

import type { TemplateId, CardItem, MetricCard, VisualMode } from '../Templates';

/** Data per-slide yang di-generate oleh LLM Naskah Generator */
export interface SlideData {
  template: TemplateId;
  title: string;
  description?: string;
  source?: string;
  disclaimer?: string;
  visualMode?: VisualMode;
  visualIcon?: string;
  illustrationUrl?: string | null;
  accent?: string;
  tldrCards?: CardItem[];
  metrics?: MetricCard[];
  bullets?: CardItem[];
}

/** Seluruh data carousel — output akhir dari Naskah Generator */
export interface CarouselData {
  handle: string;
  badgeText: string;
  badgeBgColor: string;
  badgeTextColor: string;
  textColor: string;
  bgColor: string;
  slides: SlideData[];
}

/** Input untuk Naskah Generator */
export interface NaskahInput {
  category: string;
  ticker: string | null;
  sector: string | null;
  title: string;
  content: string;
  source: string;
  enrichmentData: Record<string, any>;
}

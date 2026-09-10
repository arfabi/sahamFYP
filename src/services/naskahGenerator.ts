// ============================================================
// Naskah Generator Service (LLM 2)
// Menghubungkan prompt builder dengan Gemini API
// Output: CarouselData (8 slide) yang siap dirender
// ============================================================

import { generateContent } from './gemini';
import { buildNaskahPrompt, type CategoryType } from '../prompts/naskahGenerator';
import type { CarouselData } from '../types';

/** Default values untuk carousel */
const DEFAULTS = {
  handle: '@sahamfyp',
  badgeBgColor: '#14182B',
  badgeTextColor: '#FFFFFF',
  textColor: '#14182B',
  bgColor: '#F5F1E7',
};

/** Validasi dan repair output JSON dari LLM */
function validateAndRepair(data: any): CarouselData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid naskah: not an object');
  }

  // Pastikan slides array ada dan tepat 8
  if (!Array.isArray(data.slides) || data.slides.length !== 8) {
    throw new Error(`Invalid naskah: expected 8 slides, got ${data.slides?.length}`);
  }

  // Validasi setiap slide punya template
  const validTemplates = ['cover', 'tldr', 'data', 'kronologi', 'standar', 'pros', 'cons', 'cta'];
  for (let i = 0; i < data.slides.length; i++) {
    const slide = data.slides[i];
    if (!slide.template || !validTemplates.includes(slide.template)) {
      throw new Error(`Invalid naskah: slide ${i + 1} missing valid template`);
    }
    if (!slide.title) {
      slide.title = '-';
    }
  }

  return {
    handle: data.handle || DEFAULTS.handle,
    badgeText: data.badgeText || 'SAHAMFYP',
    badgeBgColor: data.badgeBgColor || DEFAULTS.badgeBgColor,
    badgeTextColor: data.badgeTextColor || DEFAULTS.badgeTextColor,
    textColor: data.textColor || DEFAULTS.textColor,
    bgColor: data.bgColor || DEFAULTS.bgColor,
    slides: data.slides,
  };
}

/** Extract JSON string dari response LLM (handle markdown wrapping) */
function extractJson(raw: string): any {
  // Coba parse langsung
  try {
    return JSON.parse(raw);
  } catch {
    // Coba extract dari markdown code block
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim());
    }
    // Coba cari objek JSON pertama
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  }
}

/** Financial terms dictionary with Gen Z translations */
export const FINANCIAL_TERMS: Record<string, { name: string; genZ: string }> = {
  PBV: { name: 'Price to Book Value', genZ: 'Banding Harga vs Nilai Buku' },
  PER: { name: 'Price to Earnings Ratio', genZ: 'Banding Harga vs Laba' },
  ROE: { name: 'Return on Equity', genZ: 'Efek Uang Kembali' },
  EPS: { name: 'Earnings Per Share', genZ: 'Lep saham' },
  ROA: { name: 'Return on Assets', genZ: 'Efek Aset' },
  DER: { name: 'Debt to Equity Ratio', genZ: 'Banding Utang vs Modal' },
  DY: { name: 'Dividend Yield', genZ: 'Hasil Dividen' },
  DPS: { name: 'Dividend Per Share', genZ: 'Lep Dividen' },
  NPL: { name: 'Non Performing Loan', genZ: 'Kredit Macet' },
  LDR: { name: 'Loan to Deposit Ratio', genZ: 'Banding Kredit vs Simpanan' },
  CAR: { name: 'Capital Adequacy Ratio', genZ: 'Cukup Modal' },
  BOPO: { name: 'Operating Expenses to Income', genZ: 'Banding Biaya vs Pendapatan' },
  NIM: { name: 'Net Interest Margin', genZ: 'Lep Bersih' },
  GDP: { name: 'Gross Domestic Product', genZ: 'Produk Domestik Bruto' },
  CAGR: { name: 'Compound Annual Growth Rate', genZ: 'Efek Pertumbuhan Tahunan' },
  PB: { name: 'Price to Book', genZ: 'Banding Harga vs Buku' },
  PE: { name: 'Price to Earnings', genZ: 'Banding Harga vs Laba' },
  ROI: { name: 'Return on Investment', genZ: 'Efek Uang Kembali Investasi' },
  EPS_GROWTH: { name: 'EPS Growth', genZ: 'Efek Pertumbuhan Laba per Saham' },
  YOY: { name: 'Year over Year', genZ: 'Tahun ke Tahun' },
  QOQ: { name: 'Quarter over Quarter', genZ: 'Triwulan ke Triwulan' },
  MOM: { name: 'Month over Month', genZ: 'Bulan ke Bulan' },
};

/** Parameter untuk generate naskah */
export interface GenerateNaskahParams {
  category: CategoryType;
  title: string;
  content: string;
  enrichmentData: Record<string, any>;
  ticker: string | null;
  image?: string;
  siteName?: string;
}

/** Generate naskah carousel dari berita + data enrichment */
export async function generateNaskah(params: GenerateNaskahParams): Promise<CarouselData> {
  const { category, title, content, enrichmentData, ticker, image, siteName } = params;

  // 1. Build prompt sesuai kategori
  const prompt = buildNaskahPrompt(category, title, content, enrichmentData, ticker);

  // 2. Call Gemini API
  const rawOutput = await generateContent(prompt);

  // 3. Parse JSON
  const parsed = extractJson(rawOutput);

  // 4. Validate & repair
  const result = validateAndRepair(parsed);

  // 5. Inject image into cover and kronologi slides, fix CTA icon
  if (image && result.slides) {
    // Cover slide (index 0)
    if (result.slides[0] && result.slides[0].template === 'cover') {
      result.slides[0].visualMode = 'image';
      result.slides[0].illustrationUrl = image;
      result.slides[0].source = siteName || '';
    }
    // Kronologi slide (index 2)
    if (result.slides[2] && result.slides[2].template === 'kronologi') {
      result.slides[2].visualMode = 'image';
      result.slides[2].illustrationUrl = image;
    }
  }

  // Fix CTA slide icon - always use MessageCircle (comment icon)
  if (result.slides && result.slides[7] && result.slides[7].template === 'cta') {
    result.slides[7].visualIcon = 'MessageCircle';
    result.slides[7].visualMode = 'icon';
  }

  return result;
}

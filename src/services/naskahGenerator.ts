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

/** Parameter untuk generate naskah */
export interface GenerateNaskahParams {
  category: CategoryType;
  title: string;
  content: string;
  enrichmentData: Record<string, any>;
  ticker: string | null;
}

/** Generate naskah carousel dari berita + data enrichment */
export async function generateNaskah(params: GenerateNaskahParams): Promise<CarouselData> {
  const { category, title, content, enrichmentData, ticker } = params;

  // 1. Build prompt sesuai kategori
  const prompt = buildNaskahPrompt(category, title, content, enrichmentData, ticker);

  // 2. Call Gemini API
  const rawOutput = await generateContent(prompt);

  // 3. Parse JSON
  const parsed = extractJson(rawOutput);

  // 4. Validate & repair
  return validateAndRepair(parsed);
}

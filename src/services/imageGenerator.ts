// ============================================================
// Image Generation Service
// Render 8 slide carousel ke PNG menggunakan html-to-image
// ============================================================

import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { toPng } from 'html-to-image';
import TemplateRenderer from '../Templates';
import type { CarouselData } from '../types';

/** Build render props for a specific slide (same as FormWizard) */
function buildRenderProps(data: CarouselData, slideIndex: number) {
  const slide = data.slides[slideIndex];
  return {
    template: slide.template,
    handle: data.handle,
    badgeText: data.badgeText,
    badgeBgColor: data.badgeBgColor,
    badgeTextColor: data.badgeTextColor,
    textColor: data.textColor,
    accentColor: slide.accent || '#F2A93B',
    bgColor: data.bgColor,
    title: slide.title,
    description: slide.description || '',
    source: slide.source || '',
    disclaimer: slide.disclaimer || '',
    visualMode: 'icon' as const,
    visualIcon: slide.visualIcon || 'TrendingUp',
    illustrationUrl: null,
    tldrCards: slide.tldrCards || [],
    metrics: slide.metrics || [],
    bullets: slide.bullets || [],
    slideIndex,
  };
}

/** Result dari image generation */
export interface GeneratedImage {
  slideIndex: number;
  dataUrl: string;
  width: number;
  height: number;
}

/** Generate single slide ke PNG */
async function generateSingleSlide(
  data: CarouselData,
  slideIndex: number,
): Promise<GeneratedImage> {
  // Create offscreen container for this slide
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '400px';
  container.style.height = '500px';
  document.body.appendChild(container);

  const root: Root = createRoot(container);

  try {
    // Render slide
    const props = buildRenderProps(data, slideIndex);
    root.render(React.createElement(TemplateRenderer, props));

    // Wait for render
    await new Promise(r => setTimeout(r, 200));

    // Convert to PNG
    const dataUrl = await toPng(container.firstElementChild as HTMLElement, {
      pixelRatio: 2,
      width: 400,
      height: 500,
      backgroundColor: data.bgColor,
    });

    return {
      slideIndex,
      dataUrl,
      width: 800,
      height: 1000,
    };
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

/** Generate semua 8 slide ke PNG secara sequential */
export async function generateAllSlides(
  data: CarouselData,
  onProgress?: (current: number, total: number) => void,
): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = [];

  for (let i = 0; i < 8; i++) {
    onProgress?.(i + 1, 8);
    const image = await generateSingleSlide(data, i);
    results.push(image);
  }

  return results;
}

/** Download single image */
export function downloadImage(image: GeneratedImage, prefix = 'sahamfyp') {
  const link = document.createElement('a');
  link.download = `${prefix}-slide-${image.slideIndex + 1}.png`;
  link.href = image.dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Download semua images secara sequential dengan delay */
export async function downloadAllImages(
  images: GeneratedImage[],
  prefix = 'sahamfyp',
  delayMs = 300,
) {
  for (const image of images) {
    downloadImage(image, prefix);
    await new Promise(r => setTimeout(r, delayMs));
  }
}

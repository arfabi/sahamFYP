// ============================================================
// Slide HTML Builder
// Convert slide objects ke HTML string untuk Browserless.io screenshot
// ============================================================

const ICONS: Record<string, string> = {
  TrendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  MessageCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
  CheckCircle2: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  AlertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  Scale: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`
};

const ICON_COLORS: Record<string, string> = {
  TrendingUp: '#F2A93B', MessageCircle: '#F2A93B', CheckCircle2: '#4CAF7D', AlertTriangle: '#E4572E', Scale: '#F2A93B'
};

const ACCENT: Record<string, string> = {
  cover: '#F2A93B', tldr: '#F2A93B', kronologi: '#F2A93B', data: '#F2A93B', pros: '#4CAF7D', cons: '#E4572E', standar: '#F2A93B', cta: '#F2A93B'
};

export interface SlideObject {
  template: string; title?: string; description?: string; visualIcon?: string; visualMode?: string;
  illustrationUrl?: string; source?: string; accent?: string; disclaimer?: string;
  tldrCards?: Array<{ icon?: string; text: string }>;
  metrics?: Array<{ icon?: string; label: string; value: string; caption?: string; tone?: string }>;
  bullets?: Array<{ icon?: string; text: string }>;
}

function iconSvg(name: string): string { return ICONS[name] || ICONS.TrendingUp; }
function iconColor(name: string): string { return ICON_COLORS[name] || '#F2A93B'; }

export function buildBaseStyles(): string {
  return `<style>*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1080px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#14182B;color:#FFF;overflow:hidden}.slide{width:1080px;height:1080px;padding:60px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;position:relative}.title{font-size:56px;font-weight:800;line-height:1.2;margin-bottom:24px;max-width:900px}.description{font-size:32px;line-height:1.5;opacity:.9;max-width:900px}.icon-container{position:absolute;top:60px;right:60px;width:120px;height:120px;display:flex;align-items:center;justify-content:center}.icon-container svg{width:80px;height:80px}.illustration{width:100%;height:400px;object-fit:cover;border-radius:16px;margin-bottom:32px}.source{font-size:18px;opacity:.6;margin-top:16px}.disclaimer{font-size:20px;opacity:.7;margin-top:24px;padding:16px 24px;background:rgba(255,255,255,.1);border-radius:12px;max-width:900px}.card-list{display:flex;flex-direction:column;gap:20px;width:100%;margin-top:32px}.card{display:flex;align-items:flex-start;gap:20px;padding:24px;background:rgba(255,255,255,.08);border-radius:16px;max-width:900px}.card svg{width:40px;height:40px;flex-shrink:0;margin-top:4px}.card-text{font-size:28px;line-height:1.5}.metrics-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;width:100%;margin-top:32px}.metric-card{padding:28px;background:rgba(255,255,255,.08);border-radius:16px;text-align:center}.metric-label{font-size:20px;opacity:.7;margin-bottom:8px}.metric-value{font-size:40px;font-weight:800;color:#F2A93B}.metric-caption{font-size:16px;opacity:.6;margin-top:4px}.bullet-list{display:flex;flex-direction:column;gap:20px;width:100%;margin-top:32px}.bullet{display:flex;align-items:flex-start;gap:16px;font-size:28px;line-height:1.5}.bullet svg{width:32px;height:32px;flex-shrink:0;margin-top:6px}</style>`;
}

export function buildSlideHtml(s: SlideObject): string {
  const accent = s.accent || ACCENT[s.template] || '#F2A93B';
  let c = '';
  switch (s.template) {
    case 'cover': {
      const img = s.illustrationUrl ? `<img class="illustration" src="${s.illustrationUrl}" alt="">` : '';
      const src = s.source ? `<div class="source">Sumber: ${s.source}</div>` : '';
      c = `<div class="slide" style="background:linear-gradient(135deg,#14182B 0%,#1E2A4A 100%)">${img}<h1 class="title" style="color:${accent}">${s.title||''}</h1><p class="description">${s.description||''}</p>${src}</div>`;
      break;
    }
    case 'tldr': {
      const cards = (s.tldrCards||[]).map(x => `<div class="card"><span style="color:${iconColor(x.icon||'TrendingUp')}">${iconSvg(x.icon||'TrendingUp')}</span><span class="card-text">${x.text}</span></div>`).join('');
      c = `<div class="slide"><h1 class="title" style="color:${accent}">${s.title||'TL;DR'}</h1><div class="card-list">${cards}</div></div>`;
      break;
    }
    case 'kronologi': {
      const img = s.illustrationUrl ? `<img class="illustration" src="${s.illustrationUrl}" alt="">` : '';
      c = `<div class="slide"><div class="icon-container" style="color:${accent}">${iconSvg('TrendingUp')}</div>${img}<h1 class="title" style="color:${accent}">${s.title||''}</h1><p class="description">${s.description||''}</p></div>`;
      break;
    }
    case 'data': {
      const ms = (s.metrics||[]).map(m => `<div class="metric-card"><div class="metric-label">${m.label}</div><div class="metric-value" style="color:${m.tone==='sage'?'#4CAF7D':'#F2A93B'}">${m.value}</div>${m.caption?`<div class="metric-caption">${m.caption}</div>`:''}</div>`).join('');
      c = `<div class="slide"><h1 class="title" style="color:${accent}">${s.title||'Data'}</h1><div class="metrics-grid">${ms}</div></div>`;
      break;
    }
    case 'pros': {
      const bs = (s.bullets||[]).map(b => `<div class="bullet"><span style="color:#4CAF7D">${iconSvg('CheckCircle2')}</span><span>${b.text}</span></div>`).join('');
      c = `<div class="slide"><h1 class="title" style="color:#4CAF7D">${s.title||'Kelebihan'}</h1><div class="bullet-list">${bs}</div></div>`;
      break;
    }
    case 'cons': {
      const bs = (s.bullets||[]).map(b => `<div class="bullet"><span style="color:#E4572E">${iconSvg('AlertTriangle')}</span><span>${b.text}</span></div>`).join('');
      c = `<div class="slide"><h1 class="title" style="color:#E4572E">${s.title||'Perhatian'}</h1><div class="bullet-list">${bs}</div></div>`;
      break;
    }
    case 'standar': {
      c = `<div class="slide"><div class="icon-container" style="color:${accent}">${iconSvg('Scale')}</div><h1 class="title" style="color:${accent}">${s.title||'Kesimpulan'}</h1><p class="description">${s.description||''}</p></div>`;
      break;
    }
    case 'cta': {
      const d = s.disclaimer ? `<div class="disclaimer">${s.disclaimer}</div>` : '';
      c = `<div class="slide"><div class="icon-container" style="color:${accent}">${iconSvg('MessageCircle')}</div><h1 class="title" style="color:${accent}">${s.title||'Gimana Menurutmu?'}</h1><p class="description">${s.description||''}</p>${d}</div>`;
      break;
    }
    default:
      c = `<div class="slide"><h1 class="title" style="color:${accent}">${s.title||''}</h1><p class="description">${s.description||''}</p></div>`;
  }
  return `<!DOCTYPE html><html><head>${buildBaseStyles()}</head><body>${c}</body></html>`;
}

export function buildAllSlidesHtml(slides: SlideObject[]): string[] {
  return slides.map(buildSlideHtml);
}

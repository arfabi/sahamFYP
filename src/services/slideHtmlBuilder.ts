// ============================================================
// Slide HTML Builder
// Convert slide objects ke HTML string untuk Browserless.io / Image Screenshot
// ============================================================

export interface SlideObject {
  template: string;
  handle?: string;
  badgeText?: string;
  dateIndonesia?: string;
  slideIndex?: number;
  totalSlides?: number;

  title?: string;
  subtitle?: string;
  description?: string;
  visualIcon?: string;
  visualMode?: string;
  illustrationUrl?: string;
  source?: string;
  accent?: string;
  disclaimer?: string;

  // cover
  newsCount?: number;
  watchlistCount?: number;

  // tldr
  tldrCards?: Array<{ icon?: string; text: string; section?: string }>;

  // data
  metrics?: Array<{ icon?: string; label: string; value: string; caption?: string; tone?: string }>;

  // pros / cons / bullets
  bullets?: Array<{ icon?: string; text: string }>;

  // market
  dataDateIndonesia?: string;
  ihsg?: { price: number; changePct: number };
  topGainers?: Array<{ symbol: string; name: string; price: number; changePct: number }>;
  topLosers?: Array<{ symbol: string; name: string; price: number; changePct: number }>;
  foreignFlow?: { direction: string; netValue: number | null; label?: string };

  // stock
  ticker?: string;
  companyName?: string;
  sector?: string;
  tags?: string[];
  newsTitle?: string;
  newsDescription?: string;
  apa?: string;
  kenapa?: string;
  dampak?: string;
  sumberBerita?: string;
  hargaTerakhir?: number;
  fundamentals?: {
    sector?: string;
    per?: string; perSector?: string; perSignal?: string;
    pbv?: string; pbvSector?: string; pbvSignal?: string;
    roe?: string; roeSector?: string; roeSignal?: string;
    der?: string; derSector?: string; derSignal?: string;
    narasiFundamental?: string;
  };
  technical?: {
    last?: number;
    ma20?: number;
    ma50?: number;
    narasiMa20?: string;
    narasiMa50?: string;
    crossSignal?: string;
    narasiVibe?: string;
    narasiHargaAksi?: string;
    chg1d?: string; chg5d?: string; chg20d?: string; pctFromHigh52w?: string;
    volumeSignal?: string;
    vibeCheck?: string;
    trigger?: string;
  };
  tldrSaham?: {
    dayTrading?: string;
    swing?: string;
    investasi?: string;
  };
  warning?: string;

  // matrix
  stocks?: Array<{ ticker: string; quadrant: 'q1' | 'q2' | 'q3' | 'q4' | string }>;
  q1Label?: string;
  q2Label?: string;
  q3Label?: string;
  q4Label?: string;
  note?: string;
}

const ICONS: Record<string, string> = {
  TrendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  TrendingDown: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>`,
  MessageCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
  CheckCircle2: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  AlertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  Scale: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
  Flame: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>`,
  Newspaper: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>`,
  Eye: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`
};

function iconSvg(name: string): string { return ICONS[name] || ICONS.TrendingUp; }

export function buildBaseStyles(): string {
  return `<style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width: 1080px; height: 1350px;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
      background: #F8F6F0; color: #14182B; overflow: hidden;
    }
    .slide {
      width: 1080px; height: 1350px;
      display: flex; flex-direction: column;
      padding: 40px 52px 36px 52px;
    }

    /* Top Header */
    .top-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 2px solid rgba(20,24,43,0.1); margin-bottom: 4px; flex-shrink: 0; }
    .handle-tag { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 800; color: #14182B; }
    .badge-pill { background: #14182B; color: #FFF; font-size: 16px; font-weight: 800; padding: 4px 16px; border-radius: 20px; letter-spacing: 1px; }
    .brand-title { font-size: 20px; font-weight: 700; color: #64748B; letter-spacing: 0.5px; }

    .bottom-footer { display: flex; justify-content: space-between; align-items: center; width: 100%; border-top: 2px solid rgba(20,24,43,0.1); padding-top: 16px; flex-shrink: 0; margin-top: 4px; }
    .date-tag { font-size: 20px; font-weight: 600; color: #64748B; display: flex; align-items: center; gap: 8px; }
    .page-badge { background: #14182B; color: #FFF; font-weight: 800; font-size: 20px; padding: 6px 18px; border-radius: 20px; }

    .main-body { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; padding: 18px 0 12px 0; gap: 14px; overflow: hidden; min-height: 0; }

    .title { font-size: 46px; font-weight: 900; line-height: 1.2; color: #14182B; }
    .subtitle { font-size: 24px; font-weight: 600; color: #64748B; margin-top: -4px; }
    
    .card-box { background: rgba(20,24,43,0.05); border-radius: 18px; padding: 20px 24px; border: 1px solid rgba(20,24,43,0.08); }

    /* Stock Slide Layout */
    .ticker-badge { background: #14182B; color: #F2A93B; font-weight: 900; display: inline-block; }
    .sector-badge { background: rgba(20,24,43,0.08); color: #475569; font-weight: 700; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag-item { background: rgba(242,169,59,0.15); color: #B45309; font-weight: 700; border-radius: 8px; }

    .news-title-text { font-size: 24px; font-weight: 800; margin-bottom: 8px; color: #14182B; display: flex; align-items: center; gap: 8px; }
    .news-desc-text { font-size: 20px; line-height: 1.45; color: #334155; }
    .point-line { font-size: 19px; line-height: 1.4; margin-top: 6px; color: #1E293B; }
    .point-line b { color: #14182B; }

    .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-header { font-size: 22px; font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
    .metric-row { display: flex; justify-content: space-between; font-size: 19px; padding: 4px 0; }
    .metric-val { font-weight: 800; }

    .narasi-box { background: rgba(242,169,59,0.12); border-left: 5px solid #F2A93B; padding: 16px 20px; border-radius: 12px; font-size: 20px; line-height: 1.45; color: #14182B; }
    
    .strategy-box { background: #14182B; color: #FFF; border-radius: 16px; padding: 18px 24px; display: flex; flex-direction: column; gap: 8px; }
    .strat-row { font-size: 19px; display: flex; gap: 8px; }
    .strat-row b { color: #F2A93B; min-width: 140px; }

    .warning-box { background: rgba(228,87,46,0.15); border: 2px solid #E4572E; color: #9A2C12; border-radius: 14px; padding: 14px 20px; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; }

    /* Matrix Slide Layout */
    .matrix-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 14px; flex: 1; min-height: 0; }
    .matrix-cell { border-radius: 18px; padding: 18px 20px; display: flex; flex-direction: column; justify-content: flex-start; }
    .matrix-cell.q1 { background: rgba(76,175,125,0.12); border: 2px solid #4CAF7D; }
    .matrix-cell.q2 { background: rgba(242,169,59,0.12); border: 2px solid #F2A93B; }
    .matrix-cell.q3 { background: rgba(245,158,11,0.12); border: 2px solid #F59E0B; }
    .matrix-cell.q4 { background: rgba(228,87,46,0.12); border: 2px solid #E4572E; }

    .q-title { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
    .q1 .q-title { color: #2E7D32; }
    .q2 .q-title { color: #D97706; }
    .q3 .q-title { color: #B45309; }
    .q4 .q-title { color: #C2410C; }

    .ticker-chip-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
    .ticker-chip { background: #14182B; color: #FFF; font-weight: 800; font-size: 20px; padding: 8px 18px; border-radius: 10px; }
    .empty-text { font-size: 18px; color: #94A3B8; font-style: italic; }

    /* Market Slide Layout */
    .ihsg-banner { background: #14182B; color: #FFF; border-radius: 18px; padding: 20px 28px; display: flex; justify-content: space-between; align-items: center; }
    .table-list { display: flex; flex-direction: column; gap: 6px; }
    .table-row { display: flex; justify-content: space-between; font-size: 18px; padding: 8px 12px; background: rgba(20,24,43,0.05); border-radius: 10px; font-weight: 600; }
  </style>`;
}

export function buildSlideHtml(s: SlideObject, index: number = 0, total: number = 9): string {
  const currentSlide = (s.slideIndex !== undefined ? s.slideIndex + 1 : index + 1);
  const totalCount = s.totalSlides || total || 9;
  const dateStr = s.dateIndonesia || 'SahamFYP Update';
  const badgeText = s.badgeText || 'OPEN';

  let bodyContent = '';

  switch (s.template) {
    case 'cover': {
      const img = s.illustrationUrl ? `<img class="illustration" src="${s.illustrationUrl}" style="width:100%;height:320px;object-fit:cover;border-radius:18px;" alt="">` : '';
      bodyContent = `
        <div class="main-body" style="justify-content: center; align-items: center; text-align: center; gap: 24px;">
          ${img}
          <h1 class="title" style="font-size: 58px;">${s.title || 'MARKET BRIEF'}</h1>
          <p class="subtitle" style="font-size: 28px; max-width: 800px;">${s.description || 'Yang perlu lo tau sebelum bel bursa bunyi'}</p>
        </div>
      `;
      break;
    }

    case 'tldr': {
      const cards = s.tldrCards || [];

      // Group cards by section (supports both old and new format)
      const marketCards = cards.filter(c => c.section === 'kondisiMarket' || (!c.section && (c.text.includes('IHSG') || c.text.toLowerCase().includes('gainer') || c.text.toLowerCase().includes('loser') || c.text.toLowerCase().includes('asing'))));
      const fillingsCards = cards.filter(c => c.section === 'fillings');
      const katalisCards = cards.filter(c => c.section === 'katalis' || (!c.section && !c.text.toLowerCase().includes('watchlist') && !c.text.includes('IHSG') && !c.text.toLowerCase().includes('gainer') && !c.text.toLowerCase().includes('loser') && !c.text.toLowerCase().includes('asing')));
      const watchlistCard = cards.find(c => c.section === 'watchlist' || c.text.toLowerCase().includes('watchlist'));

      // Watchlist tickers chips
      const watchlistText = watchlistCard ? watchlistCard.text.replace(/watchlist:/i, '').trim() : '';
      const tickerChips = watchlistText.split(/[,\s]+/).filter(t => t.replace('.JK', '').length >= 2 && t.replace('.JK', '').length <= 6);

      const renderSectionCard = (sectionTitle: string, icon: string, accentColor: string, bgColor: string, items: typeof cards) => `
        <div class="card-box" style="padding:14px 20px; background:${bgColor}; border:1px solid ${accentColor};">
          <div style="font-size:17px; font-weight:900; color:${accentColor}; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">${icon} ${sectionTitle}</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${items.map(k => `<div style="font-size:18px; font-weight:600; color:#1E293B; display:flex; gap:8px; align-items:flex-start;"><span style="color:${accentColor}; font-weight:900; flex-shrink:0;">•</span><span>${k.text}</span></div>`).join('')}
          </div>
        </div>`;

      bodyContent = `
        <div class="main-body" style="gap:12px; padding-top:24px;">
          <h1 class="title" style="font-size:40px;">📌 ${s.title || 'TL;DR — Ringkasan Hari Ini'}</h1>
          
          <!-- 1. Kondisi Market -->
          ${marketCards.length > 0 ? renderSectionCard('Kondisi Market Kemarin', '📈', '#14182B', 'rgba(20,24,43,0.06)', marketCards) : ''}

          <!-- 2. Fillings -->
          ${fillingsCards.length > 0 ? renderSectionCard('Fillings & Keterbukaan', '📋', '#2563EB', 'rgba(37,99,235,0.07)', fillingsCards) : ''}

          <!-- 3. Katalis Hari Ini -->
          ${katalisCards.length > 0 ? renderSectionCard('Katalis Hari Ini', '🔥', '#D97706', 'rgba(217,119,6,0.08)', katalisCards) : ''}

          <!-- 4. Watchlist -->
          <div class="card-box" style="padding:14px 20px; background:#14182B; color:#FFF;">
            <div style="font-size:17px; font-weight:900; color:#F2A93B; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">🎯 Watchlist Saham Hari Ini</div>
            <div class="ticker-chip-list">
              ${tickerChips.length > 0
                ? tickerChips.map(t => `<span class="ticker-chip" style="background:#F2A93B; color:#14182B; font-size:22px; padding:8px 20px;">${t.replace('.JK','')}</span>`).join('')
                : `<span style="font-size:18px; color:#94A3B8;">${watchlistText || 'Pantau update berikutnya'}</span>`
              }
            </div>
          </div>
        </div>
      `;
      break;
    }

    case 'market': {
      const ihsgPrice = s.ihsg?.price ? (s.ihsg.price as number).toLocaleString('id-ID') : '-';
      const ihsgChg = s.ihsg?.changePct ? `${(s.ihsg.changePct as number) >= 0 ? '+' : ''}${(s.ihsg.changePct as number).toFixed(2)}%` : '';
      const ff = s.foreignFlow;
      const ffLabel = ff?.label || (ff?.direction === 'buy' ? '🟢 Asing Net Buy' : ff?.direction === 'sell' ? '🔴 Asing Net Sell' : null);
      const ffColor = ff?.direction === 'buy' ? '#2E7D32' : ff?.direction === 'sell' ? '#C2410C' : '#64748B';
      const ffBg = ff?.direction === 'buy' ? 'rgba(76,175,125,0.12)' : ff?.direction === 'sell' ? 'rgba(228,87,46,0.12)' : 'rgba(20,24,43,0.06)';
      const gainers = (s.topGainers || []).slice(0, 5).map((g: any) => {
        const sym = (g.symbol || g.ticker || '').replace('.JK','');
        const name = (g.name || g.companyName || sym).slice(0, 19);
        const chg = (g.changePct || 0);
        return `<div class="table-row" style="padding:10px 14px; font-size:19px;"><span><b>${sym}</b> <span style="font-size:16px; color:#64748B;">(${name})</span></span><span style="color:#2E7D32; font-weight:800;">+${chg.toFixed(2)}%</span></div>`;
      }).join('');

      const losers = (s.topLosers || []).slice(0, 5).map((l: any) => {
        const sym = (l.symbol || l.ticker || '').replace('.JK','');
        const name = (l.name || l.companyName || sym).slice(0, 19);
        const chg = (l.changePct || 0);
        return `<div class="table-row" style="padding:10px 14px; font-size:19px;"><span><b>${sym}</b> <span style="font-size:16px; color:#64748B;">(${name})</span></span><span style="color:#C2410C; font-weight:800;">${chg.toFixed(2)}%</span></div>`;
      }).join('');

      const ihsgColor = (s.ihsg?.changePct as number) >= 0 ? '#4CAF7D' : '#E4572E';
      const ihsgArrow = (s.ihsg?.changePct as number) >= 0 ? '▲' : '▼';

      bodyContent = `
        <div class="main-body" style="gap:14px; justify-content:flex-start; padding-top:28px; padding-bottom:16px;">
          <h1 class="title" style="font-size:40px;">📊 ${s.title || 'Kondisi Market Kemarin'}</h1>

          <!-- IHSG Banner -->
          <div class="ihsg-banner" style="background:#14182B; color:#FFF; border-radius:18px; padding:20px 28px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:22px; font-weight:800; color:#94A3B8; margin-bottom:2px;">IHSG</div>
              <div style="font-size:38px; font-weight:900; color:#F2A93B;">${ihsgPrice}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:28px; font-weight:900; color:${ihsgColor};">${ihsgArrow} ${ihsgChg}</div>
              <div style="font-size:16px; color:#94A3B8; margin-top:4px;">${s.dataDateIndonesia || ''}</div>
            </div>
          </div>

          <!-- Foreign Flow Banner -->
          ${ffLabel ? `
            <div style="background:${ffBg}; border:1.5px solid ${ffColor}; border-radius:14px; padding:14px 20px; display:flex; align-items:center; justify-content:space-between;">
              <div style="font-size:18px; font-weight:800; color:#64748B;">🌍 Foreign Flow</div>
              <div style="font-size:20px; font-weight:900; color:${ffColor};">${ffLabel}</div>
            </div>
          ` : ''}

          <!-- Top Gainers & Losers Grid -->
          <div class="grid-2col">
            <div class="card-box" style="padding:18px 20px;">
              <div class="grid-header" style="color:#2E7D32; font-size:20px; margin-bottom:10px;">🚀 TOP GAINERS</div>
              <div class="table-list" style="gap:6px;">${gainers}</div>
            </div>
            <div class="card-box" style="padding:18px 20px;">
              <div class="grid-header" style="color:#C2410C; font-size:20px; margin-bottom:10px;">🩸 TOP LOSERS</div>
              <div class="table-list" style="gap:6px;">${losers}</div>
            </div>
          </div>
        </div>`;
      break;
    }


    case 'stock': {
      const ticker = s.ticker || 'EMITEN.JK';
      const priceFormatted = s.hargaTerakhir ? `Rp ${s.hargaTerakhir.toLocaleString('id-ID')}` : '';
      const source = s.sumberBerita || 'Sector.app News';
      
      const fund = s.fundamentals || {};
      const tech = s.technical || {};
      const tldr = s.tldrSaham || {};
      const sectorName = s.sector || fund.sector || 'Sektor';

      // Format vs Sector values
      const perVs = fund.perSector ? ` (vs ${fund.perSector})` : '';
      const pbvVs = fund.pbvSector ? ` (vs ${fund.pbvSector})` : '';
      const roeVs = fund.roeSector ? ` (vs ${fund.roeSector})` : '';

      // Explanation for technical signal
      const signalVibe = tech.narasiVibe || (
        tech.crossSignal?.includes('Golden Cross') ? 'MA20 memotong ke atas MA50, sinyal tren naik kuat.' :
        tech.crossSignal?.includes('Death Cross') ? 'MA20 memotong ke bawah MA50, sinyal tren turun.' :
        tech.crossSignal?.includes('Bullish') ? 'Harga bergerak di atas MA20 & MA50 (tren naik).' :
        'Belum ada arah yang jelas, pantau pergerakan harga dan volume.'
      );

      bodyContent = `
        <div class="main-body" style="gap: 24px; justify-content: flex-start; padding-top: 36px; padding-bottom: 20px;">
          <!-- Top Ticker Header with Close Price -->
          <div>
            <div class="ticker-header" style="align-items: center; display: flex; justify-content: space-between;">
              <span class="ticker-badge" style="font-size: 52px; padding: 6px 26px; border-radius: 16px;">${cleanTicker}</span>
              ${formattedPrice ? `<span style="font-size: 44px; font-weight: 900; color: #D97706;">${formattedPrice}</span>` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
              <div style="font-size: 26px; font-weight: 800; color: #14182B; letter-spacing: -0.3px;">
                ${s.companyName || ''}
              </div>
              <span class="sector-badge" style="font-size: 18px; padding: 6px 18px; border-radius: 20px;">Sektor ${sectorName}</span>
            </div>
            ${s.tags && s.tags.length > 0 ? `
              <div class="tag-list" style="margin-top: 10px;">
                ${s.tags.map((tg: string) => `<span class="tag-item" style="font-size: 16px; padding: 4px 14px;">#${tg}</span>`).join('')}
              </div>
            ` : ''}
          </div>

          <!-- News Card -->
          <div class="card-box" style="padding: 24px 28px; border-left: 6px solid #F2A93B; background: #FFFFFF;">
            <div style="font-size: 24px; font-weight: 900; color: #14182B; line-height: 1.35; margin-bottom: 10px;">
              ${s.newsTitle || ''}
            </div>
            <div style="font-size: 20px; color: #334155; line-height: 1.5;">
              ${s.newsDescription || ''}
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #94A3B8; text-align: right; margin-top: 12px;">
              ${displaySource}
            </div>
          </div>

          <!-- Fundamental & Teknikal Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
            <!-- Fundamental Card -->
            <div class="card-box" style="padding: 24px 26px; display: flex; flex-direction: column; justify-content: space-between; min-height: 240px;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 2px solid #F1F5F9; padding-bottom: 8px;">
                  <span style="font-size: 24px; font-weight: 900; color: #14182B;">📊 Fundamental</span>
                </div>
                <div style="font-size: 18px; color: #14182B; display: flex; flex-direction: column; gap: 12px; font-weight: 600;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><b>PER:</b> ${fund.per || '-'}<span style="color:#64748B; font-weight:500;">${perVs}</span></span>
                    ${fund.perSignal ? `<span style="font-size:15px; font-weight:700; color:#1e293b;">${fund.perSignal}</span>` : ''}
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><b>PBV:</b> ${fund.pbv || '-'}<span style="color:#64748B; font-weight:500;">${pbvVs}</span></span>
                    ${fund.pbvSignal ? `<span style="font-size:15px; font-weight:700; color:#1e293b;">${fund.pbvSignal}</span>` : ''}
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><b>ROE:</b> ${fund.roe || '-'}<span style="color:#64748B; font-weight:500;">${roeVs}</span></span>
                    ${fund.roeSignal ? `<span style="font-size:15px; font-weight:700; color:#1e293b;">${fund.roeSignal}</span>` : ''}
                  </div>
                </div>
              </div>
              ${fund.narasiFundamental ? `
                <div style="font-size: 17px; color: #475569; font-style: italic; margin-top: 14px; border-top: 1px dashed #E2E8F0; padding-top: 10px; line-height: 1.45;">
                  💡 ${fund.narasiFundamental}
                </div>
              ` : ''}
            </div>

            <!-- Teknikal Card -->
            <div class="card-box" style="padding: 24px 26px; display: flex; flex-direction: column; justify-content: space-between; min-height: 240px;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 2px solid #F1F5F9; padding-bottom: 8px;">
                  <span style="font-size: 24px; font-weight: 900; color: #14182B;">📈 Teknikal</span>
                </div>
                <div style="font-size: 18px; color: #14182B; display: flex; flex-direction: column; gap: 12px; font-weight: 600;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><b>Sinyal:</b></span>
                    <span style="color:#F2A93B; font-size:17px; font-weight:800;">${tech.crossSignal || 'Konsolidasi 🟡'}</span>
                  </div>
                  <div><b>MA20:</b> Rp ${tech.ma20 ? tech.ma20.toLocaleString('id-ID') : '-'}</div>
                  <div><b>MA50:</b> Rp ${tech.ma50 ? tech.ma50.toLocaleString('id-ID') : '-'}</div>
                </div>
              </div>
              <div style="font-size: 17px; color: #475569; font-style: italic; margin-top: 14px; border-top: 1px dashed #E2E8F0; padding-top: 10px; line-height: 1.45;">
                💡 ${signalVibe}
              </div>
            </div>
          </div>

          <!-- Key Takeaway Banner -->
          <div class="card-box" style="padding: 24px 28px; background: #14182B; color: #FFFFFF; border-radius: 20px;">
            <div style="font-size: 22px; font-weight: 900; color: #F2A93B; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              💡 Key Takeaway:
            </div>
            <div style="font-size: 19px; color: #F8FAFC; line-height: 1.45; font-weight: 500;">
              ${tldr.swing || tldr.investasi || tldr.dayTrading || tech.trigger || 'Pantau pergerakan volume dan support MA20 untuk menentukan titik entry.'}
            </div>
          </div>
        </div>
      `;
      break;
    }

    case 'matrix': {
      const stocks = s.stocks || [];
      const getQuadrantTickers = (q: string) => stocks.filter(x => x.quadrant === q).map(x => x.ticker);

      const renderChips = (tickers: string[]) => {
        if (!tickers || tickers.length === 0) return `<span class="empty-text">Tidak ada emiten</span>`;
        return `<div class="ticker-chip-list">${tickers.map(t => `<span class="ticker-chip" style="font-size:26px; padding:10px 22px;">${t.replace('.JK','')}</span>`).join('')}</div>`;
      };

      bodyContent = `
        <div class="main-body" style="gap: 20px; justify-content: flex-start; padding-top: 36px; padding-bottom: 20px;">
          <div>
            <h1 class="title">🧩 ${s.title || 'Kesimpulan Watchlist Hari Ini'}</h1>
            <div class="subtitle">${s.subtitle || 'Framework: Matrix Fundamental × Teknikal'}</div>
          </div>

          <div class="matrix-grid">
            <div class="matrix-cell q1">
              <div class="q-title">🟢 Q1: Fund ✅ + Tech ✅</div>
              ${s.q1Label ? `<div style="font-size:15px; color:#2E7D32; font-weight:600; margin-bottom:10px; font-style:italic;">${s.q1Label}</div>` : `<div style="font-size:15px; color:#2E7D32; font-weight:600; margin-bottom:10px; font-style:italic;">Cocok: Investasi & Swing Trading</div>`}
              ${renderChips(getQuadrantTickers('q1'))}
            </div>
            <div class="matrix-cell q2">
              <div class="q-title">🟡 Q2: Fund ✅ + Tech ⚠️</div>
              ${s.q2Label ? `<div style="font-size:15px; color:#D97706; font-weight:600; margin-bottom:10px; font-style:italic;">${s.q2Label}</div>` : `<div style="font-size:15px; color:#D97706; font-weight:600; margin-bottom:10px; font-style:italic;">Cocok: Value Investing, tunggu teknikal</div>`}
              ${renderChips(getQuadrantTickers('q2'))}
            </div>
            <div class="matrix-cell q3">
              <div class="q-title">🟠 Q3: Fund ⚠️ + Tech ✅</div>
              ${s.q3Label ? `<div style="font-size:15px; color:#B45309; font-weight:600; margin-bottom:10px; font-style:italic;">${s.q3Label}</div>` : `<div style="font-size:15px; color:#B45309; font-weight:600; margin-bottom:10px; font-style:italic;">Trading momentum jangka pendek SAJA</div>`}
              ${renderChips(getQuadrantTickers('q3'))}
            </div>
            <div class="matrix-cell q4">
              <div class="q-title">🔴 Q4: Fund ⚠️ + Tech ⚠️</div>
              ${s.q4Label ? `<div style="font-size:15px; color:#C2410C; font-weight:600; margin-bottom:10px; font-style:italic;">${s.q4Label}</div>` : `<div style="font-size:15px; color:#C2410C; font-weight:600; margin-bottom:10px; font-style:italic;">Hindari dulu, tunggu pemulihan</div>`}
              ${renderChips(getQuadrantTickers('q4'))}
            </div>
          </div>

          ${s.note ? `<div style="font-size:18px; color:#64748B; font-style:italic; margin-top:8px;">💡 ${s.note}</div>` : ''}
        </div>
      `;
      break;
    }

    case 'kamus': {
      const kamusItems = (s as any).items || [
        { term: 'PER', category: 'fundamental', definition: 'Berapa tahun balik modal dari laba perusahaan.', analogi: 'Beli HP Rp15jt, untung Rp1jt/thn → PER 15x. Makin kecil = makin cepet balik modal!' },
        { term: 'PBV', category: 'fundamental', definition: 'Bayar berapa kali lipat dari aset bersih perusahaan.', analogi: 'PBV < 1 = beli aset di bawah nilai buku = diskon! PBV tinggi = lo bayar premium buat brand/ekspektasi.' },
        { term: 'ROE & DER', category: 'fundamental', definition: 'Efisiensi modal (ROE) vs beban utang (DER).', analogi: 'ROE tinggi = jago putar modal. DER < 1x = aman dari utang. DER > 3x = hati-hati paylater membengkak!' },
        { term: 'MA20 & MA50', category: 'teknikal', definition: 'Rata-rata harga 20 & 50 hari — patokan support/resistance.', analogi: 'MA20 = mood pasar bulan ini. MA50 = mood 2.5 bulan terakhir. Harga di atas keduanya = on top vibes!' },
        { term: 'Golden & Death Cross', category: 'teknikal', definition: 'Sinyal pembalikan tren dari perpotongan MA20 vs MA50.', analogi: 'Golden Cross 🚀 = MA20 naik ke atas MA50 (bullish!). Death Cross ☠️ = MA20 turun ke bawah MA50 (waspada!).' },
        { term: 'Foreign Flow', category: 'teknikal', definition: 'Arus dana investor asing — net buy (masuk) atau net sell (keluar).', analogi: 'Asing net buy = influencer besar borong = sentimen positif. Net sell = mereka kabur = layak waspada, tapi jangan buru panik!' },
      ];

      // Split into fundamental and teknikal
      const fundItems = kamusItems.filter((k: any) => k.category === 'fundamental' || !k.category);
      const techItems = kamusItems.filter((k: any) => k.category === 'teknikal');

      const renderKamusItem = (k: any, borderColor: string) => `
        <div class="card-box" style="padding:14px 18px; border-left:4px solid ${borderColor};">
          <div style="font-size:19px; font-weight:900; color:#14182B; margin-bottom:3px;">${k.term}</div>
          <div style="font-size:15px; color:#64748B; font-weight:600; margin-bottom:6px;">${k.definition}</div>
          <div style="font-size:16px; color:#334155; font-style:italic; line-height:1.4;">💡 ${k.analogi}</div>
        </div>`;

      bodyContent = `
        <div class="main-body" style="gap:12px; justify-content: flex-start; padding-top: 28px; padding-bottom: 16px;">
          <div>
            <h1 class="title" style="font-size:40px;">📖 ${s.title || 'Kamus Ala Gen Z'}</h1>
            <div class="subtitle" style="font-size:20px;">${s.subtitle || 'Biar lo ngerti semua istilah di slide sebelumnya 👆'}</div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:4px;">
            <!-- Fundamental Column -->
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div style="font-size:15px; font-weight:900; color:#2563EB; text-transform:uppercase; letter-spacing:0.6px; padding:4px 0;">📊 Fundamental</div>
              ${fundItems.map((k: any) => renderKamusItem(k, '#2563EB')).join('')}
            </div>
            <!-- Teknikal Column -->
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div style="font-size:15px; font-weight:900; color:#F2A93B; text-transform:uppercase; letter-spacing:0.6px; padding:4px 0;">📈 Teknikal</div>
              ${techItems.map((k: any) => renderKamusItem(k, '#F2A93B')).join('')}
            </div>
          </div>
        </div>
      `;
      break;
    }

    case 'cta': {
      bodyContent = `
        <div class="main-body" style="justify-content: center; align-items: center; text-align: center; gap: 24px; padding-top: 36px; padding-bottom: 20px;">
          <div style="color:#F2A93B">${iconSvg('MessageCircle')}</div>
          <h1 class="title" style="font-size: 56px;">${s.title || 'Gimana Menurutmu?'}</h1>
          <p class="subtitle" style="font-size: 28px; max-width: 800px; color:#334155;">${s.description || 'Drop pendapatmu di kolom komentar! 👇'}</p>
          <div style="background:#14182B; color:#F2A93B; font-size:26px; font-weight:900; padding:16px 36px; border-radius:30px; margin-top:16px;">
            Follow @sahamfyp 🚀
          </div>
          ${s.disclaimer ? `<div style="font-size:18px; color:#94A3B8; margin-top:20px;">${s.disclaimer}</div>` : ''}
        </div>
      `;
      break;
    }

    default: {
      bodyContent = `
        <div class="main-body" style="padding-top: 36px; padding-bottom: 20px;">
          <h1 class="title">${s.title || ''}</h1>
          <p class="subtitle">${s.description || ''}</p>
        </div>
      `;
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${buildBaseStyles()}
</head>
<body>
  <div class="slide">
    <!-- Top Header -->
    <div class="top-header">
      <div class="handle-tag">
        <span>${s.handle || '@sahamfyp'}</span>
        <span class="badge-pill">${badgeText}</span>
      </div>
      <div class="brand-title">Daily Market Brief</div>
    </div>

    <!-- Main Content Body -->
    ${bodyContent}

    <!-- Bottom Footer -->
    <div class="bottom-footer">
      <div class="date-tag">
        🗓️ <span>${dateStr}</span>
      </div>
      <div class="page-badge">
        ${currentSlide}/${totalCount}
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function buildAllSlidesHtml(slides: SlideObject[]): string[] {
  const total = slides.length;
  return slides.map((s, idx) => buildSlideHtml(s, idx, total));
}

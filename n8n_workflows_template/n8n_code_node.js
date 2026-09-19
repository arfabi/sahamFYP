// ============================================================
// n8n Code Node — Generate Slide HTML (Berdasarkan generate.ts)
// Mode: Run Once for Each Item
// Input: Setiap item adalah 1 objek slide + data global (badgeText, handle, dll)
// Output: { html: string, index: number }
// ============================================================

const s = $json;

// ── Global Meta ─────────────────────────────────────────────
const slideIndex = s.slideIndex !== undefined ? s.slideIndex : $itemIndex;
const totalCount = s.totalSlides || 8;

// Mengambil Ticker/Badge dari node 'Generate' secara dinamis
let badgeText = 'SAHAMFYP';
try { badgeText = $('Generate').first().json.classification.ticker || $('Generate').first().json.naskah.badgeText; } catch(e) {}
if (s.badgeText) badgeText = s.badgeText;

const handle     = s.handle || '@sahamfyp';
const template   = String(s.template || '').toLowerCase().trim();

// Palette sesuai Templates.tsx
const PALETTE = {
  navy: "#14182B",
  amber: "#F2A93B",
  sage: "#4CAF7D",
  brick: "#E4572E",
  cream: "#F5F1E7",
  card: "#EDE6D8",
};

// ── Helpers ─────────────────────────────────────────────────
// Render Markdown Bold (**teks**) jadi <strong>
function renderBold(text) {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Skala ukuran font berdasarkan panjang teks (mencegah overflow)
function getFontSize(text, max, min, threshold = 28) {
  const len = (text || "").trim().length;
  if (!len) return max;
  if (len <= threshold) return max;
  const ratio = Math.min((len - threshold) / threshold, 1);
  return Math.max(Math.round(max - (max - min) * ratio), min);
}

// ── CSS Base Styles ─────────────────────────────────────────
function buildBaseStyles() {
  return `<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800;900&family=Inter:wght@400;500;600&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    strong { font-weight: 800; }
    
    body {
      width: 1080px; height: 1350px;
      background: #F8F6F0;
      font-family: 'Inter', sans-serif;
      color: ${PALETTE.navy};
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .shell {
      background-color: ${PALETTE.cream};
      color: ${PALETTE.navy};
      width: 1080px; 
      height: 1350px;
      display: flex; 
      flex-direction: column; 
      position: relative;
      padding: 60px 80px;
    }
    
    /* Header */
    .header {
      display: flex; justify-content: space-between; align-items: center;
      flex-shrink: 0;
    }
    .handle { font-weight: 600; font-size: 28px; display: flex; align-items: center; gap: 12px;}
    .badge {
      background-color: ${PALETTE.navy};
      color: #FFFFFF;
      padding: 10px 32px;
      border-radius: 40px;
      font-weight: 800;
      font-size: 24px;
      letter-spacing: 1px;
    }
    
    /* Footer Pagination */
    .footer {
      display: flex; justify-content: space-between; align-items: center;
      flex-shrink: 0; padding-top: 30px;
    }
    .dots { display: flex; gap: 12px; align-items: center; }
    .dot { border-radius: 50%; display: inline-block; }
    .dot.active { background-color: ${PALETTE.amber}; width: 24px; height: 24px; }
    .dot.inactive { border: 3px solid ${PALETTE.navy}; opacity: 0.45; width: 18px; height: 18px; }
    .swipe-text { display: flex; items-center; gap: 8px; font-weight: 600; font-size: 24px; }
    
    /* Content Layout */
    .content {
      flex: 1; display: flex; flex-direction: column;
      padding-top: 60px;
    }
    
    .title { font-family: 'Outfit', sans-serif; font-weight: 800; line-height: 1.1; letter-spacing: -1px; }
    .desc { font-weight: 500; opacity: 0.85; line-height: 1.5; margin-top: 16px; }
    .source { font-size: 20px; font-style: italic; opacity: 0.6; margin-top: auto; }
    
    /* TLDR & Lists */
    .card-list { display: flex; flex-direction: column; gap: 24px; margin-top: 40px; }
    .tldr-card {
      background-color: ${PALETTE.card};
      border-radius: 28px;
      padding: 28px 36px;
      display: flex; align-items: center; gap: 24px;
    }
    .tldr-num {
      background-color: ${PALETTE.amber}; color: ${PALETTE.cream};
      min-width: 64px; height: 64px; border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 28px;
    }
    
    /* Metrics */
    .metrics-grid { display: flex; flex-direction: column; gap: 24px; margin-top: 40px; }
    .metric-card {
      background-color: ${PALETTE.card};
      border-radius: 28px; border-left: 12px solid ${PALETTE.amber};
      padding: 28px 36px;
    }
    .metric-header { display: flex; justify-content: space-between; align-items: center; opacity: 0.7; font-weight: 600; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
    .metric-val { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 64px; margin-top: 8px; margin-bottom: 8px; }
    .metric-cap { font-weight: 500; font-size: 26px; line-height: 1.4; opacity: 0.9;}
    
    /* Pros/Cons */
    .bullet-card {
      background-color: ${PALETTE.card};
      border-radius: 28px; padding: 24px 32px;
      display: flex; align-items: flex-start; gap: 24px;
    }
    .bullet-icon {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #FFF; margin-top: 4px;
    }
  </style>`;
}

// Render footer / pagination
function renderPagination() {
  const isLast = slideIndex >= (totalCount - 1);
  return `
    <div class="footer">
      <div class="dots">
        <!-- Progress bar / dots dihapus sesuai permintaan -->
      </div>
      <div class="swipe-text">
        ${isLast ? '<i data-lucide="rotate-ccw" width="32" height="32"></i>' : '<span>Geser</span> <i data-lucide="arrow-right" width="32" height="32"></i>'}
      </div>
    </div>
  `;
}

// Header
function renderHeader() {
  return `
    <div class="header">
      <span class="handle">${handle}</span>
      <span class="badge">${badgeText}</span>
    </div>
  `;
}

// ── Template Builder ─────────────────────────────────────────
let bodyContent = '';

switch (template) {
  case 'cover': {
    const tSize = getFontSize(s.title, 86, 60, 40);
    const dSize = getFontSize(s.description, 40, 32, 50);
    bodyContent = `
      <div class="content" style="text-align: left;">
        <h2 class="title" style="font-size: ${tSize}px;">${renderBold(s.title)}</h2>
        ${s.description ? `<p class="desc" style="font-size: ${dSize}px;">${renderBold(s.description)}</p>` : ''}
        
        <div style="flex:1; margin-top:40px; border-radius:32px; overflow:hidden; position:relative; background-color:${PALETTE.card}; display:flex; align-items:center; justify-content:center;">
          ${s.illustrationUrl 
            ? `<img src="${s.illustrationUrl}" style="width:100%; height:100%; object-fit:cover;">` 
            : `<i data-lucide="${s.visualIcon || 'trending-up'}" width="200" height="200" color="${PALETTE.amber}"></i>`
          }
        </div>
      </div>`;
    break;
  }

  case 'tldr': {
    const tSize = getFontSize(s.title, 76, 60);
    const cardsHtml = (s.tldrCards || []).map((card, idx) => {
      const cSize = getFontSize(card.text, 36, 28, 50);
      return `
        <div class="tldr-card">
          <div class="tldr-num">${idx + 1}</div>
          <p style="font-size: ${cSize}px; font-weight: 500;">${renderBold(card.text)}</p>
        </div>`;
    }).join('');
    
    bodyContent = `
      <div class="content" style="text-align: center;">
        <h2 class="title" style="font-size: ${tSize}px;">${renderBold(s.title)}</h2>
        <div class="card-list" style="text-align: left;">${cardsHtml}</div>
      </div>`;
    break;
  }

  case 'kronologi': {
    const tSize = getFontSize(s.title, 76, 50);
    const dSize = getFontSize(s.description, 36, 28, 50);
    bodyContent = `
      <div class="content" style="text-align: center; align-items: center;">
        <h2 class="title" style="font-size: ${tSize}px; margin-bottom: 30px;">${renderBold(s.title)}</h2>
        
        <div style="flex:1; width:100%; max-height:450px; border-radius:32px; overflow:hidden; background-color:${PALETTE.card}; display:flex; align-items:center; justify-content:center;">
          ${s.illustrationUrl 
            ? `<img src="${s.illustrationUrl}" style="width:100%; height:100%; object-fit:cover;">` 
            : `<span style="font-size:32px; color:#94A3B8;">Foto Kronologi</span>`
          }
        </div>
        
        <p class="desc" style="font-size: ${dSize}px; margin-top: 30px; max-width: 900px;">${renderBold(s.description)}</p>
        ${s.source ? `<div class="source" style="margin-top:40px;">Sumber: ${s.source}</div>` : ''}
      </div>`;
    break;
  }

  case 'data': {
    const tSize = getFontSize(s.title, 76, 60);
    const metricsHtml = (s.metrics || []).slice(0, 4).map(m => {
      const toneColor = m.tone === 'sage' ? PALETTE.sage : PALETTE.amber;
      return `
        <div class="metric-card" style="border-color: ${toneColor};">
          <div class="metric-header" style="color: ${toneColor};">
            <span>${m.label}</span>
            <i data-lucide="${m.icon || 'bar-chart-3'}" width="36" height="36"></i>
          </div>
          <div class="metric-val" style="color: ${toneColor};">${m.value}</div>
          <div class="metric-cap">${renderBold(m.caption)}</div>
        </div>`;
    }).join('');

    bodyContent = `
      <div class="content" style="text-align: center;">
        <h2 class="title" style="font-size: ${tSize}px;">${renderBold(s.title)}</h2>
        <div class="metrics-grid" style="text-align: left;">${metricsHtml}</div>
      </div>`;
    break;
  }

  case 'pros':
  case 'cons': {
    const tSize = getFontSize(s.title, 76, 60);
    const isPros = template === 'pros';
    const bgColor = isPros ? PALETTE.sage : PALETTE.brick;
    const mainIcon = isPros ? 'check-circle-2' : 'x-circle';
    
    const bulletsHtml = (s.bullets || []).map(b => {
      const cSize = getFontSize(b.text, 36, 28, 50);
      return `
        <div class="bullet-card">
          <div class="bullet-icon" style="background-color: ${bgColor};">
            <i data-lucide="${mainIcon}" width="32" height="32"></i>
          </div>
          <p style="font-size: ${cSize}px; font-weight: 500;">${renderBold(b.text)}</p>
        </div>`;
    }).join('');

    bodyContent = `
      <div class="content" style="text-align: center;">
        <h2 class="title" style="font-size: ${tSize}px;">${renderBold(s.title)}</h2>
        <div style="margin: 30px auto; width: 120px; height: 120px; background-color: ${bgColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
          <i data-lucide="${mainIcon}" width="64" height="64"></i>
        </div>
        <div class="card-list" style="text-align: left; margin-top:20px;">${bulletsHtml}</div>
      </div>`;
    break;
  }

  case 'standar': {
    const tSize = getFontSize(s.title, 86, 60);
    const dSize = getFontSize(s.description, 42, 32, 60);
    bodyContent = `
      <div class="content" style="text-align: center; align-items: center;">
        <h2 class="title" style="font-size: ${tSize}px;">${renderBold(s.title)}</h2>
        
        <div style="margin: 60px 0;">
          <i data-lucide="${s.visualIcon || 'info'}" width="240" height="240" color="${PALETTE.amber}"></i>
        </div>
        
        <p class="desc" style="font-size: ${dSize}px; max-width: 900px;">${renderBold(s.description)}</p>
      </div>`;
    break;
  }

  case 'cta': {
    const tSize = getFontSize(s.title, 86, 60);
    const dSize = getFontSize(s.description, 46, 36, 50);
    bodyContent = `
      <div class="content" style="text-align: center; align-items: center; justify-content: center;">
        <h2 class="title" style="font-size: ${tSize}px;">${renderBold(s.title)}</h2>
        
        <div style="margin: 60px 0;">
          <i data-lucide="${s.visualIcon || 'message-circle'}" width="280" height="280" color="${PALETTE.amber}"></i>
        </div>
        
        <p class="desc" style="font-size: ${dSize}px; max-width: 900px;">${renderBold(s.description)}</p>
        
        ${s.disclaimer ? `
          <div style="margin-top: 60px; background-color: ${PALETTE.amber}; padding: 16px 48px; border-radius: 50px; font-weight: 800; font-size: 24px; color: ${PALETTE.navy};">
            ${s.disclaimer}
          </div>
        ` : ''}
      </div>`;
    break;
  }

  default: {
    bodyContent = `
      <div class="content">
        <h2 class="title">${s.title || ''}</h2>
        <p class="desc">${s.description || ''}</p>
      </div>`;
  }
}

// ── HTML Wrapper ─────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <script src="https://unpkg.com/lucide@latest"></script>
  ${buildBaseStyles()}
</head>
<body>
  <div class="shell">
    ${renderHeader()}
    ${bodyContent}
    ${renderPagination()}
  </div>
  
  <script>
    // Initialize Lucide icons
    lucide.createIcons();
  </script>
</body>
</html>`;

return { html, index: slideIndex, name: `slide_${slideIndex + 1}.jpg` };

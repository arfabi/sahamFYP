import React, { useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { type LucideIcon } from "lucide-react";

// ================= TYPES =================
export type TemplateId =
  | "cover"
  | "tldr"
  | "data"
  | "kronologi"
  | "standar"
  | "pros"
  | "cons"
  | "cta";

export interface CardItem {
  id: string;
  icon: string;
  text: string;
}

export interface MetricCard {
  id: string;
  icon: string;
  label: string;
  value: string;
  caption: string;
  tone: "amber" | "sage";
}

export type VisualMode = "icon" | "image";

export interface TemplateBaseProps {
  template: TemplateId;
  handle: string;
  badgeText: string;
  badgeBgColor: string;
  badgeTextColor: string;
  textColor: string;
  accentColor: string;
  bgColor: string;
  title: string;
  description: string;
  source?: string;
  disclaimer?: string;
  visualMode: VisualMode;
  visualIcon: string;
  illustrationUrl: string | null;
  tldrCards: CardItem[];
  metrics: MetricCard[];
  bullets: CardItem[];
  slideIndex: number; // 0..7 -> posisi dot 1..8
}

// ================= HELPERS =================
// Auto font-size: makin panjang teks, makin kecil font-nya (dengan batas
// maksimal) supaya layout tidak pernah overflow.
export function scaleFont(
  text: string,
  max: number,
  min: number,
  longThreshold = 28
): number {
  const len = (text || "").trim().length;
  if (!len) return max;
  if (len <= longThreshold) return max;
  const ratio = Math.min((len - longThreshold) / longThreshold, 1);
  return Math.max(Math.round(max - (max - min) * ratio), min);
}

export const PALETTE = {
  navy: "#14182B",
  amber: "#F2A93B",
  sage: "#4CAF7D",
  brick: "#E4572E",
  cream: "#F5F1E7",
  card: "#EDE6D8",
} as const;

// Curated icons that definitely exist in Lucide React
export const ICONS = {
  // Finance & Trending
  TrendingUp: "TrendingUp",
  TrendingDown: "TrendingDown",
  BarChart3: "BarChart3",
  LineChart: "LineChart",
  PieChart: "PieChart",
  Coins: "Coins",
  DollarSign: "DollarSign",
  Banknote: "Banknote",
  Wallet: "Wallet",
  CreditCard: "CreditCard",
  // Status & Actions
  CheckCircle2: "CheckCircle2",
  XCircle: "XCircle",
  AlertTriangle: "AlertTriangle",
  Info: "Info",
  Shield: "Shield",
  ShieldCheck: "ShieldCheck",
  Target: "Target",
  Award: "Award",
  Trophy: "Trophy",
  // Business
  Building2: "Building2",
  Factory: "Factory",
  Briefcase: "Briefcase",
  Handshake: "Handshake",
  Users: "Users",
  UserCheck: "UserCheck",
  // Growth & Performance
  Rocket: "Rocket",
  Zap: "Zap",
  Flame: "Flame",
  Sparkles: "Sparkles",
  Gauge: "Gauge",
  Activity: "Activity",
  // Documents
  FileText: "FileText",
  ScrollText: "ScrollText",
  Newspaper: "Newspaper",
  BookOpen: "BookOpen",
  // Misc
  Globe: "Globe",
  MapPin: "MapPin",
  Calendar: "Calendar",
  Clock: "Clock",
  Lightbulb: "Lightbulb",
  Heart: "Heart",
  ThumbsUp: "ThumbsUp",
  ThumbsDown: "ThumbsDown",
  Star: "Star",
  Crown: "Crown",
  Gem: "Gem",
  // Arrows
  ArrowUpRight: "ArrowUpRight",
  ArrowDownRight: "ArrowDownRight",
  ChevronRight: "ChevronRight",
  ChevronsUp: "ChevronsUp",
} as const;

export type IconName = keyof typeof ICONS;

// Safe icon rendering with guaranteed fallback
export function renderIcon(name: string, size = 24, color: string = PALETTE.navy) {
  const iconName = (ICONS as Record<string, string>)[name] || "TrendingUp";
  const C = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
  if (C) return <C size={size} color={color} strokeWidth={2.2} />;
  // Ultimate fallback
  return <LucideIcons.TrendingUp size={size} color={color} strokeWidth={2.2} />;
}

// Get safe icon name (for LLM-generated names that might not exist)
export function getSafeIconName(name: string): string {
  if ((ICONS as Record<string, string>)[name]) return name;
  return "TrendingUp";
}
// ================= SHARED UI =================
function Shell({
  bgColor,
  textColor,
  tint,
  children,
}: {
  bgColor: string;
  textColor: string;
  tint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="w-[400px] h-[500px] rounded-3xl shadow-xl flex flex-col relative overflow-hidden select-none font-sans p-7"
    >
      {tint && (
        <div
          className="absolute top-0 left-0 right-0 h-[45%]"
          style={{ backgroundColor: tint }}
        />
      )}
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  );
}

function CardHeader({
  handle,
  badgeText,
  badgeBgColor,
  badgeTextColor,
}: {
  handle: string;
  badgeText: string;
  badgeBgColor: string;
  badgeTextColor: string;
}) {
  return (
    <div className="flex justify-between items-center shrink-0">
      <span className="font-semibold text-[13px]">{handle}</span>
      {badgeText && (
        <span
          style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}
          className="px-4 py-1.5 rounded-full font-bold text-[11px] tracking-wide"
        >
          {badgeText}
        </span>
      )}
    </div>
  );
}

function CardFooter({
  slideIndex,
  textColor,
  accentColor,
}: {
  slideIndex: number;
  textColor: string;
  accentColor: string;
}) {
  const isLast = slideIndex >= 7;
  return (
    <div className="flex justify-between items-center shrink-0 pt-3">
      {/* Pagination: 8 dot, dot aktif = nomor slide */}
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            style={
              i === slideIndex
                ? { backgroundColor: accentColor, width: 10, height: 10 }
                : {
                    border: "1.5px solid " + textColor,
                    opacity: 0.45,
                    width: 8,
                    height: 8,
                  }
            }
            className="rounded-full inline-block"
          />
        ))}
      </div>
      <div className="flex items-center gap-1 font-semibold text-[11px]">
        {isLast ? (
          <LucideIcons.RotateCcw size={13} />
        ) : (
          <>
            <span>Geser</span>
            <LucideIcons.ArrowRight size={14} />
          </>
        )}
      </div>
    </div>
  );
}

// Render text dengan support **bold** markdown
export function renderTextWithBold(text: string, className?: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

// Slot visual tunggal: 1 gambar ATAU 1 ikon per slide (biar seragam)
function VisualSlot({
  visualMode,
  visualIcon,
  illustrationUrl,
  accentColor,
  iconSize,
  className,
}: {
  visualMode: VisualMode;
  visualIcon: string;
  illustrationUrl: string | null;
  accentColor: string;
  iconSize?: number;
  className?: string;
}) {
  if (visualMode === "image" && illustrationUrl) {
    return (
      <div className={"flex items-center justify-center overflow-hidden " + (className || "")}>
        <img
          src={illustrationUrl}
          alt="Ilustrasi"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }
  return (
    <div className={"flex items-center justify-center " + (className || "")}>
      <div className="flex items-center justify-center rounded-2xl p-4 w-full h-full">
        {renderIcon(visualIcon, iconSize ?? 56, accentColor)}
      </div>
    </div>
  );
}
// ================= TEMPLATE 1: COVER =================
function CoverTemplate(p: TemplateBaseProps) {
  const titleSize = scaleFont(p.title, 28, 18);
  const descSize = scaleFont(p.description, 13, 11);
  const showImage = p.visualMode === "image" && p.illustrationUrl;
  return (
    <Shell bgColor={p.bgColor} textColor={p.textColor}>
      <CardHeader
        handle={p.handle}
        badgeText={p.badgeText}
        badgeBgColor={p.badgeBgColor}
        badgeTextColor={p.badgeTextColor}
      />
      <div className="flex-1 flex flex-col pt-3">
        <h2
          className="font-display font-extrabold leading-tight tracking-tight"
          style={{ fontSize: titleSize, color: p.textColor }}
        >
          {renderTextWithBold(p.title)}
        </h2>
        {p.description && (
          <p
            className="mt-1.5 font-medium opacity-80 leading-relaxed"
            style={{ fontSize: descSize }}
          >
            {renderTextWithBold(p.description)}
          </p>
        )}
        {showImage ? (
          <div className="flex-1 relative overflow-hidden mt-3 rounded-xl">
            <img
              src={p.illustrationUrl ?? ""}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {p.source && (
              <span className="absolute bottom-2 right-3 text-[9px] text-white/70 italic bg-black/30 px-2 py-0.5 rounded">
                Sumber Foto: {p.source}
              </span>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center mt-3">
            <VisualSlot
              visualMode={p.visualMode}
              visualIcon={p.visualIcon}
              illustrationUrl={p.illustrationUrl}
              accentColor={p.accentColor}
              iconSize={100}
              className="h-[140px] w-full max-w-[240px]"
            />
          </div>
        )}
      </div>
      <CardFooter
        slideIndex={p.slideIndex}
        textColor={p.textColor}
        accentColor={p.accentColor}
      />
    </Shell>
  );
}

// ================= TEMPLATE 5: STANDAR (Judul + 1 visual + deskripsi) =================
function StandarTemplate(p: TemplateBaseProps) {
  const titleSize = scaleFont(p.title, 30, 19);
  // Dynamic font scaling based on word count - fewer words = bigger font
  const wordCount = p.description.trim().split(/\s+/).length;
  let descSize = 14;
  if (wordCount <= 5) {
    descSize = 20; // Very few words - large font
  } else if (wordCount <= 10) {
    descSize = 16; // Few words - medium-large font
  } else if (wordCount <= 20) {
    descSize = 14; // Medium words - normal font
  } else if (wordCount <= 30) {
    descSize = 12; // Many words - smaller font
  } else {
    descSize = 10; // Very many words - smallest font
  }
  return (
    <Shell bgColor={p.bgColor} textColor={p.textColor}>
      <CardHeader
        handle={p.handle}
        badgeText={p.badgeText}
        badgeBgColor={p.badgeBgColor}
        badgeTextColor={p.badgeTextColor}
      />
      <div className="flex-1 flex flex-col items-center text-center pt-5 gap-3">
        <h2
          className="font-display font-extrabold leading-tight tracking-tight"
          style={{ fontSize: titleSize, color: p.textColor }}
        >
          {renderTextWithBold(p.title)}
        </h2>
        <VisualSlot
          visualMode={p.visualMode}
          visualIcon={p.visualIcon}
          illustrationUrl={p.illustrationUrl}
          accentColor={p.accentColor}
          iconSize={96}
          className="h-[140px] w-full max-w-[290px] shrink-0"
        />
        {p.description && (
          <p
            className="font-medium opacity-85 leading-relaxed max-w-[320px]"
            style={{ fontSize: descSize }}
          >
            {renderTextWithBold(p.description)}
          </p>
        )}
        {p.source && (
          <span className="text-[11px] italic opacity-60">{p.source}</span>
        )}
      </div>
      <CardFooter
        slideIndex={p.slideIndex}
        textColor={p.textColor}
        accentColor={p.accentColor}
      />
    </Shell>
  );
}
// ================= TEMPLATE 4: KRONOLOGI (Foto + Deskripsi) =================
function KronologiTemplate(p: TemplateBaseProps) {
  const titleSize = scaleFont(p.title, 30, 19);
  const descSize = scaleFont(p.description, 13, 10.5);
  const hasImage = p.illustrationUrl;
  return (
    <Shell bgColor={p.bgColor} textColor={p.textColor}>
      <CardHeader
        handle={p.handle}
        badgeText={p.badgeText}
        badgeBgColor={p.badgeBgColor}
        badgeTextColor={p.badgeTextColor}
      />
      <div className="flex-1 flex flex-col items-center text-center pt-3">
        <h2
          className="font-display font-extrabold leading-tight tracking-tight"
          style={{ fontSize: titleSize, color: p.textColor }}
        >
          {renderTextWithBold(p.title)}
        </h2>

        {hasImage ? (
          <div className="flex-1 w-full relative overflow-hidden py-2">
            <img
              src={p.illustrationUrl ?? ""}
              alt="Ilustrasi"
              className="w-full h-full object-cover rounded-xl"
            />
            {p.source && (
              <span className="absolute bottom-2 right-3 text-[9px] text-white/70 italic bg-black/30 px-2 py-0.5 rounded">
                Sumber: {p.source}
              </span>
            )}
          </div>
        ) : (
          <div className="flex-1 w-full flex items-center justify-center py-4">
            <div className="w-full h-[180px] rounded-xl bg-slate-100 flex items-center justify-center">
              <span className="text-sm text-slate-400">Foto Kronologi</span>
            </div>
          </div>
        )}
        {p.description && (
          <p
            className="font-medium opacity-85 leading-relaxed max-w-[320px] mt-2"
            style={{ fontSize: descSize }}
          >
            {renderTextWithBold(p.description)}
          </p>
        )}
      </div>
      <CardFooter
        slideIndex={p.slideIndex}
        textColor={p.textColor}
        accentColor={p.accentColor}
      />
    </Shell>
  );
}
// ================= TEMPLATE 8: CTA (Penutup)= =================
function CtaTemplate(p: TemplateBaseProps) {
  const titleSize = scaleFont(p.title, 30, 19);
  const descSize = scaleFont(p.description, 14, 11);
  // Default icon for CTA is MessageCircle (comment)
  const ctaIcon = p.visualIcon || "MessageCircle";
  return (
    <Shell bgColor={p.bgColor} textColor={p.textColor}>
      <CardHeader
        handle={p.handle}
        badgeText={p.badgeText}
        badgeBgColor={p.badgeBgColor}
        badgeTextColor={p.badgeTextColor}
      />
      <div className="flex-1 flex flex-col items-center text-center pt-4">
        <h2
          className="font-display font-extrabold leading-tight tracking-tight"
          style={{ fontSize: titleSize, color: p.textColor }}
        >
          {renderTextWithBold(p.title)}
        </h2>
        <VisualSlot
          visualMode={p.visualMode}
          visualIcon="MessageCircle"
          illustrationUrl={p.illustrationUrl}
          accentColor={p.accentColor}
          iconSize={110}
          className="h-[140px] w-full max-w-[260px] shrink-0 mt-2"
        />
        {p.description && (
          <p
            className="font-medium opacity-85 leading-relaxed max-w-[320px] mt-3"
            style={{ fontSize: descSize }}
          >
            {renderTextWithBold(p.description)}
          </p>
        )}
        {p.disclaimer && (
          <span
            className="mt-4 px-4 py-2 rounded-full text-[10.5px] font-semibold"
            style={{ backgroundColor: p.accentColor, color: p.textColor, opacity: 0.92 }}
          >
            {p.disclaimer}
          </span>
        )}
        <div className="mt-4 pt-3 border-t border-current/10 w-full">
          <p className="text-[11px] font-medium opacity-70">
            Like, Share dan Follow Untuk mendapatkan informasi menarik seperti ini.
          </p>
        </div>
      </div>
      <CardFooter
        slideIndex={p.slideIndex}
        textColor={p.textColor}
        accentColor={p.accentColor}
      />
    </Shell>
  );
}
// ================= TEMPLATE 2: TL;DR (Tumpukan Card) =================
function TldrTemplate(p: TemplateBaseProps) {
  const titleSize = scaleFont(p.title,28,  19);
  return (
    <Shell bgColor={p.bgColor} textColor={p.textColor}>
      <CardHeader
        handle={p.handle}
        badgeText={p.badgeText}
        badgeBgColor={p.badgeBgColor}
        badgeTextColor={p.badgeTextColor}
      />
      <div className="flex-1 flex flex-col pt-5">
        <h2
          className="font-display font-extrabold leading-tight tracking-tight text-center"
          style={{ fontSize: titleSize, color: p.textColor }}
        >
          {renderTextWithBold(p.title)}
        </h2>
        <div className="flex-1 flex flex-col justify-center gap-3 py-3">
          {p.tldrCards.map((card, idx) => {
            const cardTextSize = scaleFont(card.text,13,10);
            return (
              <div
                key={card.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ backgroundColor: PALETTE.card }}
              >
                <div
                  className="flex items-center justify-center rounded-xl shrink-0 font-bold"
                  style={{ width: 36, height: 36, backgroundColor: p.accentColor, color: PALETTE.cream, fontSize: 16 }}
                >
                  {idx + 1}
                </div>
                <p className="font-medium leading-snug" style={{ fontSize: cardTextSize }}>
                  {renderTextWithBold(card.text)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <CardFooter
        slideIndex={p.slideIndex}
        textColor={p.textColor}
        accentColor={p.accentColor}
      />
    </Shell>
  );
}
// ================= TEMPLATE 3: DATA (Bedah Data — Kartu Metrik)= =================
function DataTemplate(p: TemplateBaseProps) {
  const titleSize = scaleFont(p.title, 28, 19);
  // Dynamic sizing based on number of metrics
  const displayMetrics = p.metrics.slice(0, 5);
  const count = displayMetrics.length;
  // Adjust sizing: more items = smaller to fit without covering dots
  const isCompact = count >= 4;
  const isVeryCompact = count >= 5;
  return (
    <Shell bgColor={p.bgColor} textColor={p.textColor}>
      <CardHeader
        handle={p.handle}
        badgeText={p.badgeText}
        badgeBgColor={p.badgeBgColor}
        badgeTextColor={p.badgeTextColor}
      />
      <div className="flex-1 flex flex-col pt-4">
        <h2
          className="font-display font-extrabold leading-tight tracking-tight text-center"
          style={{ fontSize: titleSize, color: p.textColor }}
        >
          {renderTextWithBold(p.title)}
        </h2>
        <div className={"flex-1 flex flex-col justify-center " + (isVeryCompact ? "gap-1 py-0.5" : isCompact ? "gap-1.5 py-1" : "gap-2 py-2")}>
          {displayMetrics.map((m) => {
            const valueSize = scaleFont(m.value, isVeryCompact ? 18 : isCompact ? 22 : 28, 16, 10);
            const captionSize = scaleFont(m.caption, isVeryCompact ? 8 : isCompact ? 9 : 10, 7, 40);
            const toneColor = m.tone === "sage" ? PALETTE.sage : p.accentColor;
            return (
              <div
                key={m.id}
                className={"rounded-xl border " + (isVeryCompact ? "px-2 py-1" : isCompact ? "px-2.5 py-1.5" : "px-3 py-2")}
                style={{
                  backgroundColor: PALETTE.card,
                  borderColor: toneColor,
                  borderLeftWidth: 4,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={"font-semibold uppercase tracking-wide opacity-70 " + (isVeryCompact ? "text-[8px]" : isCompact ? "text-[9px]" : "text-[10px]")}>
                    {m.label}
                  </span>
                  {renderIcon(m.icon, isVeryCompact ? 10 : isCompact ? 12 : 14, toneColor)}
                </div>
                <div
                  className="font-display font-extrabold"
                  style={{ fontSize: valueSize, color: toneColor }}
                >
                  {m.value}
                </div>
                <p className="font-medium leading-snug" style={{ fontSize: captionSize }}>
                  {renderTextWithBold(m.caption)}
                </p>
              </div>
            );
          })}
        </div>
        <span className={"text-center mt-1 pb-1 italic opacity-60 " + (isVeryCompact ? "text-[8px]" : "text-[10px]")}>
          Sumber Data: sector.app
        </span>
      </div>
      <CardFooter
        slideIndex={p.slideIndex}
        textColor={p.textColor}
        accentColor={p.accentColor}
      />
    </Shell>
  );
}
// ================= TEMPLATE 6 & 7: PROS / CONS (Lista Bullet) =================
// Simple SVG check and X icons - bright white for visibility
function SimpleCheckIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SimpleXIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ProsConsTemplate(
  p: TemplateBaseProps,
  tint: string,
  isPros: boolean
) {
  const titleSize = scaleFont(p.title, 28, 19);
  const IconComponent = isPros ? SimpleCheckIcon : SimpleXIcon;
  const bgColor = isPros ? PALETTE.sage : PALETTE.brick;
  return (
    <Shell bgColor={p.bgColor} textColor={p.textColor} tint={tint + "26"}>
      <CardHeader
        handle={p.handle}
        badgeText={p.badgeText}
        badgeBgColor={p.badgeBgColor}
        badgeTextColor={p.badgeTextColor}
      />
      <div className="flex-1 flex flex-col pt-5">
        <h2
          className="font-display font-extrabold leading-tight tracking-tight text-center"
          style={{ fontSize: titleSize, color: p.textColor }}
        >
          {renderTextWithBold(p.title)}
        </h2>
        <div className="flex items-center justify-center my-3">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 64, height: 64, backgroundColor: bgColor }}
          >
            <IconComponent size={32} color="#FFFFFF" />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-2.5">
          {p.bullets.map((b) => {
            const textSize = scaleFont(b.text,13,10,50);
            return (
              <div
                key={b.id}
                className="flex items-start gap-3 px-4 py-2.5 rounded-2xl"
                style={{ backgroundColor: PALETTE.card }}
              >
                <div
                  className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
                  style={{ width: 28, height: 28, backgroundColor: bgColor }}
                >
                  <IconComponent size={16} color="#FFFFFF" />
                </div>
                <p className="font-medium leading-snug" style={{ fontSize: textSize }}>
                  {renderTextWithBold(b.text)}
                </p>
              </div>
            );
          })}
        </div>
        {p.source && (
          <span className="text-[11px] italic opacity-60 text-center mt-1">
            {p.source}
          </span>
        )}
      </div>
      <CardFooter
        slideIndex={p.slideIndex}
        textColor={p.textColor}
        accentColor={p.accentColor}
      />
    </Shell>
  );
}

function ProsTemplate(p: TemplateBaseProps) {
  return ProsConsTemplate(p, PALETTE.sage, true);
}
function ConsTemplate(p: TemplateBaseProps) {
  return ProsConsTemplate(p, PALETTE.brick, false);
}

// ================= RENDERER PRINCIPAL =================
export default function TemplateRenderer(p: TemplateBaseProps) {
  switch (p.template) {
    case "tldr":
      return TldrTemplate(p);
    case "data":
      return DataTemplate(p);
    case "kronologi":
      return KronologiTemplate(p);
    case "standar":
      return StandarTemplate(p);
    case "pros":
      return ProsTemplate(p);
    case "cons":
      return ConsTemplate(p);
    case "cta":
      return CtaTemplate(p);
    case "cover":
    default:
      return CoverTemplate(p);
  }
}
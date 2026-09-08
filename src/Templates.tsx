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

export function renderIcon(name: string, size = 24, color: string = PALETTE.navy) {
  const C = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  return C ? (<C size={size} color={color} strokeWidth={2.2} />) : null;
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

// Slot visual tunggal: 1 gambar ATAU 1 ikon per slide (biar seragam)
function VisualSlot({
  visualMode,
  visualIcon,
  illustrationUrl,
  accentColor,
  iconSize,
  className,
  placeholder,
}: {
  visualMode: VisualMode;
  visualIcon: string;
  illustrationUrl: string | null;
  accentColor: string;
  iconSize?: number;
  className?: string;
  placeholder?: string;
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
    <div className={"flex flex-col items-center justify-center gap-2 " + (className || "")}>
      <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-current opacity-40 p-4 w-full h-full">
        {renderIcon(visualIcon, iconSize ?? 56, accentColor)}
      </div>
      {placeholder && (
        <span className="text-[10px] text-center opacity-50">{placeholder}</span>
      )}
    </div>
  );
}
// ================= TEMPLATE 1: COVER =================
function CoverTemplate(p: TemplateBaseProps) {
  const titleSize = scaleFont(p.title, 32, 19);
  const descSize = scaleFont(p.description, 14, 11);
  return (
    <Shell bgColor={p.bgColor} textColor={p.textColor}>
      <CardHeader
        handle={p.handle}
        badgeText={p.badgeText}
        badgeBgColor={p.badgeBgColor}
        badgeTextColor={p.badgeTextColor}
      />
      <div className="flex-1 flex flex-col justify-center items-center text-center px-1 my-1">
        <h2
          className="font-display font-extrabold leading-tight tracking-tight"
          style={{ fontSize: titleSize, color: p.textColor }}
        >
          {p.title}
        </h2>
        <p
          className="mt-2.5 font-medium opacity-85 leading-relaxed max-w-[320px]"
          style={{ fontSize: descSize }}
        >
          {p.description}
        </p>
      </div>
      <VisualSlot
        visualMode={p.visualMode}
        visualIcon={p.visualIcon}
        illustrationUrl={p.illustrationUrl}
        accentColor={p.accentColor}
        iconSize={130}
        className="h-[150px] shrink-0"
        placeholder="Upload ilustrasi atau pilih 1 ikon"
      />
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
  const descSize = scaleFont(p.description, 14, 11);
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
          {p.title}
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
            {p.description}
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
// ================= TEMPLATE 4: KRONOLOGI (Timeline)= =================
const TIMELINE_NODES = ["Coins", "Handshake", "TrendingUp"];

function KronologiTemplate(p: TemplateBaseProps) {
  const titleSize = scaleFont(p.title,30, 19);
  const descSize = scaleFont(p.description,13, 10.5);
  const showImage = p.visualMode === "image" && p.illustrationUrl;
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
          {p.title}
        </h2>

        {showImage ? (
          <div className="flex items-center justify-center flex-1 w-full overflow-hidden py-2">
            <img
              src={p.illustrationUrl ?? ""}
              alt="Ilustrasi"
              className="max-h-full max-w-[85%] object-contain"
            />
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-center py-4">
            {/* Timeline: 3 node bulat terhubung garis amber */}
            <div className="relative w-full max-w-[300px] flex items-center justify-between">
              <div
                className="absolute top-1/2 left-0 right-0 h-0.5"
                style={{ backgroundColor: p.accentColor, opacity: 0.5 }}
              />
              {TIMELINE_NODES.map((icon, i) => (
                <div
                  key={i}
                  className="relative flex items-center justify-center rounded-full border-2"
                  style={{
                    width: 44,
                    height: 44,
                    borderColor: p.accentColor,
                    backgroundColor: p.bgColor,
                  }}
                >
                  {renderIcon(icon, 20, p.accentColor)}
                </div>
              ))}
            </div>
            <span className="text-[10px] mt-3 opacity-60">
              Upload gambar atau pilih 1 ikon untuk ganti visual
            </span>
          </div>
        )}
        {p.description && (
          <p
            className="font-medium opacity-85 leading-relaxed max-w-[320px] mt-3"
            style={{ fontSize: descSize }}
          >
            {p.description}
          </p>
        )}
        {p.source && (
          <span className="text-[11px] italic opacity-60 mt-2">{p.source}</span>
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
  const titleSize = scaleFont(p.title,30,  19);
  const descSize = scaleFont(p.description,14,  11);
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
          {p.title}
        </h2>
        <VisualSlot
          visualMode={p.visualMode}
          visualIcon={p.visualIcon}
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
            {p.description}
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
          {p.title}
        </h2>
        <div className="flex-1 flex flex-col justify-center gap-3 py-3">
          {p.tldrCards.map((card) => {
            const cardTextSize = scaleFont(card.text,13,10);
            return (
              <div
                key={card.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ backgroundColor: PALETTE.card }}
              >
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{ width: 36, height:  36, backgroundColor: p.accentColor, opacity:  0.18 }}
                >
                  {renderIcon(card.icon, 18, p.accentColor)}
                </div>
                <p className="font-medium leading-snug" style={{ fontSize: cardTextSize }}>
                  {card.text}
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
          {p.title}
        </h2>
        <div className="flex-1 flex flex-col justify-center gap-3 py-3">
          {p.metrics.map((m) => {
            const valueSize = scaleFont(m.value,34,22,10);
            const captionSize = scaleFont(m.caption,11,9.5,40);
            const toneColor = m.tone === "sage" ? PALETTE.sage : p.accentColor;
            return (
              <div
                key={m.id}
                className="px-4 py-3 rounded-2xl border"
                style={{
                  backgroundColor: PALETTE.card,
                  borderColor: toneColor,
                  borderLeftWidth: 5,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    {m.label}
                  </span>
                  {renderIcon(m.icon, 16, toneColor)}
                </div>
                <div
                  className="font-display font-extrabold mt-1"
                  style={{ fontSize: valueSize, color: toneColor }}
                >
                  {m.value}
                </div>
                <p className="font-medium leading-snug mt-0.5" style={{ fontSize: captionSize }}>
                  {m.caption}
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
// ================= TEMPLATE 6 & 7: PROS / CONS (Lista Bullet) =================
function ProsConsTemplate(
  p: TemplateBaseProps,
  tint: string,
  bulletIcon: string
) {
  const titleSize = scaleFont(p.title, 28, 19);
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
          {p.title}
        </h2>
        <VisualSlot
          visualMode={p.visualMode}
          visualIcon={p.visualIcon}
          illustrationUrl={p.illustrationUrl}
          accentColor={p.accentColor}
          iconSize={64}
          className="h-[96px] w-full max-w-[220px] shrink-0 mt-2"
        />
        <div className="flex-1 flex flex-col justify-center gap-2.5">
          {p.bullets.map((b) => {
            const textSize = scaleFont(b.text,13,10,50);
            return (
              <div
                key={b.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
                style={{ backgroundColor: PALETTE.card }}
              >
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 26, height: 26, backgroundColor: p.accentColor, opacity: 0.25 }}
                >
                  {renderIcon(bulletIcon, 15, p.accentColor)}
                </div>
                <p className="font-medium leading-snug" style={{ fontSize: textSize }}>
                  {b.text}
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
  return ProsConsTemplate(p, PALETTE.sage, "CheckCircle2");
}
function ConsTemplate(p: TemplateBaseProps) {
  return ProsConsTemplate(p, PALETTE.brick, "AlertTriangle");
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
import React, { useState, useRef, ChangeEvent } from "react";
import * as LucideIcons from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { toPng } from "html-to-image";
import TemplateRenderer, {
  PALETTE,
  type TemplateId,
  type CardItem,
  type MetricCard,
  type VisualMode,
  type TemplateBaseProps,
} from "./Templates";

// ================= ICON LIST & HELPERS =================
const ICON_OPTIONS = [
  "ArrowLeftRight",
  "ArrowRight",
  "AlertTriangle",
  "BadgePercent",
  "BarChart3",
  "ChartNoAxesCombined",
  "CheckCircle2",
  "Coins",
  "DollarSign",
  "Eye",
  "Flame",
  "Gauge",
  "Globe",
  "Handshake",
  "MessageCircle",
  "Pickaxe",
  "Rocket",
  "Scale",
  "Sparkles",
  "ThumbsUp",
  "TrendingUp",
  "Wallet",
].sort();

const localIcon = (name: string, size = 18, color = "#64748b") => {
  const C = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  return C ? <C size={size} color={color} strokeWidth={2.2} /> : null;
};

const uid = () => Math.random().toString(36).slice(2, 10);

// ================= TEMPLATE METADATA & DEFAULTS =================
interface TemplateMeta {
  id: TemplateId;
  label: string;
  icon: string;
}
const TEMPLATES: TemplateMeta[] = [
  { id: "cover", label: "Cover", icon: "LayoutTemplate" },
  { id: "tldr", label: "TL;DR Cards", icon: "List" },
  { id: "data", label: "Bedah Data", icon: "ChartNoAxesCombined" },
  { id: "kronologi", label: "Kronologi", icon: "ScrollText" },
  { id: "standar", label: "Standar", icon: "Image" },
  { id: "pros", label: "Pros", icon: "ThumbsUp" },
  { id: "cons", label: "Cons", icon: "AlertTriangle" },
  { id: "cta", label: "CTA", icon: "MessageCircle" },
];

interface ContentD {
  title?: string;
  description?: string;
  source?: string;
  disclaimer?: string;
  visualIcon?: string;
  accent?: string;
}
const TEMPLATE_DEFAULTS: Record<TemplateId, ContentD> = {
  cover: {
    title: "Ada Apa dengan BUMI? 👀",
    description:
      "Akuisisi tambang emas Rp1 triliun di Australia — auto cuan atau cuma gimmick?",
    visualIcon: "TrendingUp",
    accent: PALETTE.amber,
  },
  tldr: { title: "TL;DR (Rangkuman Cepat)", visualIcon: "Handshake", accent: PALETTE.amber },
  data: {
    title: "Bedah Data Sectors.app",
    source: "Sumber Data: Sectors.app",
    visualIcon: "Gauge",
    accent: PALETTE.amber,
  },
  kronologi: {
    title: "Kronologi Kejadian",
    description:
      "4 Sept 2026: BUMI lewat anak usaha di Australia resmi kelarin akuisisi 100% saham Loyal Metals senilai Rp1 triliun. Bagian dari ekspansi ke bisnis emas & tembaga, di tengah laba bersih yang lagi melesat.",
    source: "Sumber: Kontan.co.id",
    visualIcon: "Coins",
    accent: PALETTE.amber,
  },
  standar: {
    title: "Judul Utama",
    description: "Deskripsi singkat di sini.",
    source: "",
    visualIcon: "TrendingUp",
    accent: PALETTE.amber,
  },
  pros: {
    title: "Sisi Positif (Pros)",
    source: "Sumber Data: Sectors.app",
    visualIcon: "ThumbsUp",
    accent: PALETTE.sage,
  },
  cons: {
    title: "Sisi Risiko (Cons)",
    source: "Sumber Data: Sectors.app",
    visualIcon: "Scale",
    accent: PALETTE.brick,
  },
  cta: {
    title: "Gimana Menurutmu?",
    description: "Kalau kamu punya modal, tertarik nyicil BUMI gak? Komentar di bawah! 👇",
    disclaimer: "DYOR: Konten ini murni edukasi, bukan ajakan jual/beli.",
    visualIcon: "MessageCircle",
    accent: PALETTE.amber,
  },
};

const TLDR_DEFAULT: CardItem[] = [
  { id: uid(), icon: "Handshake", text: "BUMI resmi akuisisi 100% Loyal Metals, tambang emas Australia" },
  { id: uid(), icon: "Rocket", text: "Laba bersih Q2-2026 melesat +1.266% YoY" },
  { id: uid(), icon: "Scale", text: "Tapi valuasi (PER & PBV) udah jauh di atas rata-rata peer" },
];
const METRICS_DEFAULT: MetricCard[] = [
  { id: uid(), icon: "Gauge", label: "PER (waktu balik modal)", value: "38,13x", caption: "Peer rata-rata cuma 11,67x — lebih 'mahal' dari tetangganya", tone: "amber" },
  { id: uid(), icon: "Scale", label: "PBV (harga vs aset bersih)", value: "2,62x", caption: "Peer rata-rata 1,36x", tone: "amber" },
  { id: uid(), icon: "ArrowLeftRight", label: "Foreign Flow (1 bulan)", value: "+Rp47,4 M", caption: "Net inflow asing, meski kecil vs market cap Rp78 T", tone: "sage" },
];
const PROS_DEFAULT: CardItem[] = [
  { id: uid(), icon: "CheckCircle2", text: "Ekspansi ke emas & tembaga nyata — Loyal Metals & Wolfram udah jalan" },
  { id: uid(), icon: "CheckCircle2", text: "Kinerja lagi ngebut: laba bersih +1.266% YoY, EPS growth +24,36%" },
];
const CONS_DEFAULT: CardItem[] = [
  { id: uid(), icon: "AlertTriangle", text: "Valuasi udah premium: PER 38,13x & PBV 2,62x jauh di atas rata-rata peer" },
  { id: uid(), icon: "AlertTriangle", text: "Profitabilitas tipis (ROE 2,81%) dan belum ada dividen" },
];
export default function CardGenerator() {
  // State
  const [template, setTemplate] = useState<TemplateId>("cover");
  const cardRef = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState("@sahamfyp");
  const [badgeText, setBadgeText] = useState("BUMI");
  const [badgeBgColor, setBadgeBgColor] = useState<string>(PALETTE.amber);
  const [badgeTextColor, setBadgeTextColor] = useState<string>(PALETTE.navy);
  const [title, setTitle] = useState(TEMPLATE_DEFAULTS.cover.title ?? "");
  const [description, setDescription] = useState(
    TEMPLATE_DEFAULTS.cover.description ?? ""
  );
  const [source, setSource] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [bgColor, setBgColor] = useState<string>(PALETTE.cream);
  const [textColor, setTextColor] = useState<string>(PALETTE.navy);
  const [accentColor, setAccentColor] = useState<string>(PALETTE.amber);
  const [visualMode, setVisualMode] = useState<VisualMode>("icon");
  const [visualIcon, setVisualIcon] = useState("TrendingUp");
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null);
  const [tldrCards, setTldrCards] = useState<CardItem[]>(() => TLDR_DEFAULT);
  const [metrics, setMetrics] = useState<MetricCard[]>(() => METRICS_DEFAULT);
  const [prosBullets, setProsBullets] = useState<CardItem[]>(() => PROS_DEFAULT);
  const [consBullets, setConsBullets] = useState<CardItem[]>(() => CONS_DEFAULT);

  // Download states
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const slideIndex = TEMPLATES.findIndex((t) => t.id === template);
  const activeBullets = template === "cons" ? consBullets : prosBullets;

  // Handler ganti template -> reset content sesuai default template itu
  const handleTemplateChange = (id: TemplateId) => {
    if (id === template) return;
    const d = TEMPLATE_DEFAULTS[id];
    setTemplate(id);
    setTitle(d.title ?? "");
    setDescription(d.description ?? "");
    setSource(d.source ?? "");
    setDisclaimer(d.disclaimer ?? "");
    setVisualIcon(d.visualIcon ?? "TrendingUp");
    if (d.accent) setAccentColor(d.accent);
  };

  // Handler array (TLDR / Bullet)
  const patchCard = (
    set: (fn: (prev: CardItem[]) => CardItem[]) => void,
    id: string,
    patch: Partial<Omit<CardItem, "id">>
  ) => set((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeCard = (set: (fn: (prev: CardItem[]) => CardItem[]) => void, id: string) =>
    set((prev) => prev.filter((c) => c.id !== id));
  const addCard = (set: (fn: (prev: CardItem[]) => CardItem[]) => void, icon: string) =>
    set((prev) => [...prev, { id: uid(), icon, text: "" }]);

  // Handler Metric
  const patchMetric = (id: string, patch: Partial<Omit<MetricCard, "id">>) =>
    setMetrics((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const removeMetric = (id: string) =>
    setMetrics((prev) => prev.filter((m) => m.id !== id));
  const addMetric = () =>
    setMetrics((prev) => [
      ...prev,
      { id: uid(), icon: "Gauge", label: "Metrik", value: "0x", caption: "", tone: "amber" as const },
    ]);

  // Upload ilustrasi -> data URL (supaya html-to-image tidak gagal)
  const handleIllustrationUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setIllustrationUrl(reader.result as string);
    reader.onerror = () =>
      setDownloadError("Gagal membaca file ilustrasi. Coba file lain.");
    reader.readAsDataURL(file);
  };

  // Download PNG
  const handleDownload = async () => {
    const node = cardRef.current;
    if (node === null || downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      let dataUrl: string;
      try {
        dataUrl = await toPng(node, { pixelRatio: 2 });
      } catch (err) {
        console.warn("Export PNG gagal dengan font, retry tanpa fonts:", err);
        dataUrl = await toPng(node, { pixelRatio: 2, skipFonts: true });
      }
      const link = document.createElement("a");
      link.download = `${badgeText || "card"}-slide-${slideIndex + 1}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal mendownload gambar:", err);
      setDownloadError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat export PNG."
      );
    } finally {
      setDownloading(false);
    }
  };
// Field penting per template
  const usesVisual = template !== "tldr" && template !== "data";
  const usesDescription =
    template === "cover" ||
    template === "kronologi" ||
    template === "standar" ||
    template === "cta";
  const usesSource =
    template === "kronologi" ||
    template === "standar" ||
    template === "data" ||
    template === "pros" ||
    template === "cons";

  const renderProps: TemplateBaseProps = {
    template, handle, badgeText, badgeBgColor, badgeTextColor,
    title, description, source, disclaimer,
    bgColor, textColor, accentColor, visualMode, visualIcon, illustrationUrl,
    tldrCards, metrics, bullets: activeBullets, slideIndex,
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-5 text-slate-800 font-display">
        Instagram Card <span className="text-amber-600">/</span> Carousel Generator
        <span className="text-xs text-slate-400"> — 8 Template</span>
      </h1>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ================= FORM CONTROLS ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 text-slate-700">
            1. Pilih Template (8 Slide)
          </h2>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => {
              const active = t.id === template;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplateChange(t.id)}
                  className={
                    "px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition " +
                    (active
                      ? "border-amber-500 bg-amber-100 text-slate-800"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100")
                  }
                >
                  {localIcon(t.icon, 14, active ? PALETTE.amber : "#94a3b8")}
                  {t.label}
                </button>
              );
            })}
          </div>

          <h2 className="text-lg font-semibold border-b pb-2 text-slate-700">
            Kustomisasi Content
          </h2>

          {/* Handle & Badge */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Username / Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Badge Text
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Judul Utama */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Judul / Headline{" "}
              <span className="text-slate-400">(auto-shrink saat teks panjang)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                BG Card
              </label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-9 p-1 rounded-lg border cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teks Card
              </label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-9 p-1 rounded-lg border cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Warna Aksen / Icon
              </label>
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                className="w-full h-9 p-1 rounded-lg border cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                BG Badge
              </label>
              <input type="color" value={badgeBgColor} onChange={(e) => setBadgeBgColor(e.target.value)}
                className="w-full h-9 p-1 rounded-lg border cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teks Badge
              </label>
              <input type="color" value={badgeTextColor} onChange={(e) => setBadgeTextColor(e.target.value)}
                className="w-full h-9 p-1 rounded-lg border cursor-pointer" />
            </div>
          </div>

          {/* Deskripsi */}
          {usesDescription && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Deskripsi / Caption
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Sumber */}
          {usesSource && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teks Sumber / Citasi
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Disclaimer (CTA) */}
          {template === "cta" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Disclaimer / DYOR
              </label>
              <input
                type="text"
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
{/* Visual tunggal: 1 gambar ATAU 1 ikon */}
          {usesVisual && (
            <div className="border border-slate-200 rounded-xl p-3">
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Visual (per slide: cukup 1 gambar ATAU 1 ikon)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVisualMode("icon")}
                  className={"px-3 py-1.5 rounded-lg border text-xs " + (visualMode === "icon" ? "border-amber-500 bg-amber-100" : "border-slate-300 hover:bg-slate-100")}
                >
                  Ikon
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode("image")}
                  className={"px-3 py-1.5 rounded-lg border text-xs " + (visualMode === "image" ? "border-amber-500 bg-amber-100" : "border-slate-300 hover:bg-slate-100")}
                >
                  Gambar Upload
                </button>
                {illustrationUrl && (
                  <button
                    type="button"
                    onClick={() => setIllustrationUrl(null)}
                    className="px-3 py-1.5 rounded-lg border text-xs text-slate-500 hover:bg-slate-100"
                  >
                    Hapus Gambar
                  </button>
                )}
              </div>

              {visualMode === "icon" && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-h-28 overflow-auto">
                  {ICON_OPTIONS.map((name) => (
                    <button
                      key={name}
                      title={name}
                      type="button"
                      onClick={() => setVisualIcon(name)}
                      className={
                        "p-1.5 rounded-md border flex items-center justify-center " +
                        (visualIcon === name ? "border-amber-500 bg-amber-100" : "border-slate-200 hover:bg-slate-100")
                      }
                    >
                      {localIcon(name, 16, visualIcon === name ? accentColor : "#94a3b8")}
                    </button>
                  ))}
                </div>
              )}

              {visualMode === "image" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIllustrationUpload}
                  className="w-full mt-2 text-sm text-slate-500 border border-slate-300 rounded-lg cursor-pointer"
                />
              )}
            </div>
          )}
{/* TL;DR Card Editor */}
          {template === "tldr" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Cards TL;DR (editable)
              </label>
              <div className="space-y-2">
                {tldrCards.map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5">
                    <select
                      value={c.icon}
                      onChange={(e) => patchCard(setTldrCards, c.id, { icon: e.target.value })}
                      className="border rounded-lg text-xs py-1.5"
                    >
                      {ICON_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={c.text}
                      onChange={(e) => patchCard(setTldrCards, c.id, { text: e.target.value })}
                      className="flex-1 w-full px-2 py-1.5 text-sm border rounded-lg border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeCard(setTldrCards, c.id)}
                      title="Hapus"
                      className="p-1.5 rounded-lg border text-slate-400 hover:bg-slate-100"
                    >
                      <LucideIcons.Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addCard(setTldrCards, "Handshake")}
                className="mt-2 px-3 py-1.5 rounded-lg border text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1"
              >
                <LucideIcons.Plus size={15} /> Tambah Card
              </button>
            </div>
          )}

          {/* Data Metric Editor */}
          {template === "data" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Kartu Bedah Data (editable)
              </label>
              <div className="space-y-3">
                {metrics.map((m) => (
                  <div key={m.id} className="border rounded-lg p-2 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={m.icon}
                        onChange={(e) => patchMetric(m.id, { icon: e.target.value })}
                        className="border rounded-lg text-xs py-1"
                      >
                        {ICON_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                      <select
                        value={m.tone}
                        onChange={(e) => patchMetric(m.id, { tone: e.target.value === "sage" ? "sage" : "amber" })}
                        className="border rounded-lg text-xs py-1"
                      >
                        <option value="amber">Amber</option>
                        <option value="sage">Sage</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeMetric(m.id)}
                        title="Hapus"
                        className="p-1.5 rounded-lg border text-slate-400 hover:bg-slate-100"
                      >
                        <LucideIcons.Trash2 size={15} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => patchMetric(m.id, { label: e.target.value })}
                      placeholder="Label metrik"
                      className="w-full px-2 py-1.5 text-sm border rounded-lg border-slate-300"
                    />
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => patchMetric(m.id, { value: e.target.value })}
                      placeholder="Jumlah besar"
                      className="w-full px-2 py-1.5 text-lg font-bold border rounded-lg border-slate-300"
                    />
                    <input
                      type="text"
                      value={m.caption}
                      onChange={(e) => patchMetric(m.id, { caption: e.target.value })}
                      placeholder="Caption"
                      className="w-full px-2 py-1.5 text-sm border rounded-lg border-slate-300"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addMetric}
                className="mt-2 px-3 py-1.5 rounded-lg border text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1"
              >
                <LucideIcons.Plus size={15} /> Tambah Kartu
              </button>
            </div>
          )}
{/* Pros / Cons Bullet Editor */}
          {(template === "pros" || template === "cons") && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                {template === "pros" ? "Bullet Pros (check)" : "Bullet Cons (warning)"}
              </label>
              {activeBullets.map((b) => (
                <div key={b.id} className="flex items-center gap-1.5">
                  {localIcon(template === "cons" ? "AlertTriangle" : "CheckCircle2", 16, accentColor)}
                  <input
                    type="text"
                    value={b.text}
                    onChange={(e) => patchCard(template === "cons" ? setConsBullets : setProsBullets, b.id, { text: e.target.value })}
                    className="flex-1 w-full px-2 py-1.5 text-sm border rounded-lg border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeCard(template === "cons" ? setConsBullets : setProsBullets, b.id)}
                    title="Hapus"
                    className="p-1.5 rounded-lg border text-slate-400 hover:bg-slate-100"
                  >
                    <LucideIcons.Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addCard(template === "cons" ? setConsBullets : setProsBullets, template === "cons" ? "AlertTriangle" : "CheckCircle2")}
                className="mt-2 px-3 py-1.5 rounded-lg border text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1"
              >
                <LucideIcons.Plus size={15} /> Tambah Bullet
              </button>
            </div>
          )}

          {/* Error Message */}
          {downloadError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <LucideIcons.AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>Gagal mendownload gambar: {downloadError}</span>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <LucideIcons.Loader2 size={18} className="animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <LucideIcons.Download size={18} />
                Download Gambar (PNG)
              </>
            )}
          </button>
        </div>
{/* ================= LIVE PREVIEW ================= */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Live Preview — Slide {slideIndex + 1}/8 (4:5)
          </span>
          <div ref={cardRef} className="relative">
            <TemplateRenderer {...renderProps} />
          </div>
        </div>
      </div>
    </main>
  );
}
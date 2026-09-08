# Card Generator — Core Framework & Styling Architecture

> Status: **PLAN / SAVED ONLY — no code yet**
> Note: This file captures the chosen tech stack and workflow. Do NOT generate implementation code
> until explicitly asked.

---

## 1. Frontend Framework

- **Next.js (React)** / **React (Vite)** — Main framework for building the form-input interface
  and the real-time card-layout preview.
  - Real-time preview: edits to form fields update the card layout immediately.

## 2. Styling

- **Tailwind CSS** — Accelerates styling for:
  - Card layout
  - Typography
  - Background colors
  - Rounded corners
  - Flexible element placement

## 3. Image Generation Engine (pick one)

### Option A — Client-Side Rendering (recommended)
- **html-to-image** / **html2canvas**
  - Renders the HTML/React element directly in the user's browser into a PNG/JPEG.
  - Very efficient — no server load.
  - Runs smoothly on Vercel without timeout issues.

### Option B — Server-Side / Edge Function
- **@vercel/og**
  - Uses Vercel's Satori utility to convert JSX/HTML into PNG dynamically
    at server/edge level.

## 4. Icon & Assets Library

- **lucide-react** / **react-icons**
  - Ideal for UI icons:
    - ArrowRight (Geser → navigation arrows)
    - Carousel dot indicators
    - Badges
    - Mini graphic decorations (coins, charts, gold mining/pickaxe, etc.)

## 5. Main Illustration Solution (Vector Characters)

> Important: `lucide-react` only provides line/symbol icons — NOT human-character
> illustrations like those shown in the reference image. For human characters or
> investment-themed visual assets:

- **Download SVG assets from unDraw / Storyset / Freepik**
  - Download SVG files manually from free platforms (unDraw or Storyset/Freepik —
    Freepik/Storyset allow SVG color customization).
  - Save the SVGs to `public/illustrations/` **or** convert them into
    React SVG components so clothing/element colors can be changed dynamically via code.

- **react-undraw (alternative library wrapper)**
  - NPM library wrapping some unDraw illustrations into ready-made React components.
  - Collection is limited compared to manually downloading SVG files from unDraw's website.

## 6. Recommended Workflow for Image Generation

1. **Next.js + Tailwind CSS** to compose the card template layout:
   - Header `@sahamfyp`
   - `BUMI` badge
   - Large title
   - Description
   - Illustration area
2. **Download several finance/investment-themed SVG characters** from Storyset or unDraw,
   save them as React SVG components.
3. **Use `lucide-react`** for additional decorative icons around the character
   (e.g., spark/star icons, mini charts, "Geser →" navigation arrows).
4. **Use `html-to-image`** to convert that React container element into a `.png`
   file when the Download button is clicked.

---

## Summary of Stack

| Layer                 | Choice                                             |
|-----------------------|----------------------------------------------------|
| Framework             | Next.js (React) / React (Vite)                     |
| Styling               | Tailwind CSS                                       |
| Image generation      | html-to-image / html2canvas (client-side, preferred) |
| Icon library          | lucide-react / react-icons                         |
| Character illustrations| Manual SVG from unDraw / Storyset / Freepik (or react-undraw) |
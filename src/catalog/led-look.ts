// The LED look options every LED card shares (LedMatrix, PixelFont, PixelSprite, LedEyes, LedBoard): one list, one
// reader, so the five Options panels stay the same.
import type { PlaygroundOption } from "./spec.ts";

export interface LedLookValues { shape: string; color: string; gap: number; bloom: number; ghost: number; scanlines: boolean; panel: string }

export const LED_LOOK: PlaygroundOption<LedLookValues>[] = [
  { key: "color", label: "Renk (color)", default: "rgb", options: [{ value: "rgb", label: "RGB" }, { value: "amber", label: "kehribar" }, { value: "green", label: "yeşil" }, { value: "red", label: "kırmızı" }, { value: "blue", label: "mavi" }, { value: "white", label: "beyaz" }, { value: "theme", label: "tema" }] },
  { key: "shape", label: "LED biçimi (shape)", default: "round", options: [{ value: "round", label: "yuvarlak" }, { value: "square", label: "kare piksel" }, { value: "tube", label: "tüp" }] },
  { key: "gap", label: "Boşluk (gap)", default: 0.18, min: 0, max: 0.6, step: 0.02 },
  { key: "bloom", label: "Işıma (bloom)", default: 6, min: 0, max: 16, step: 1, unit: "px", toCode: (v) => (v === 6 ? null : v === 0 ? "{false}" : `{${v}}`) },
  { key: "ghost", label: "Sönük LED izi (ghost)", default: 0.1, min: 0, max: 0.4, step: 0.02 },
  { key: "scanlines", label: "Tarama çizgileri (scanlines)", default: false },
  { key: "panel", label: "Panel (panel)", default: "dark", options: [{ value: "dark", label: "koyu" }, { value: "theme", label: "tema yüzeyi" }, { value: "none", label: "yok" }] },
];

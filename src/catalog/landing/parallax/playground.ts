import { definePlayground } from "../../spec.ts";

interface Values { sample: number; text: string; depth: number; pointer: number }

// sample layers for the raw component in MarchIDE (plain JSON: images of the showcase, far → near); `depth` scales their speed
const SAMPLE = [
  { src: "/media/dusk.jpg", alt: "", speed: 1.4 },
  { src: "/media/hadi-waves.jpg", alt: "", speed: 0.8, opacity: 0.45, blend: "screen" },
  { src: "/media/hadi-waves.jpg", alt: "", speed: 0.4, opacity: 0.3, blend: "overlay" },
  { src: "/media/dusk.jpg", alt: "", speed: -0.6, opacity: 0.2, blend: "soft-light", bleed: "20%" },
];

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample layers: a layers array cannot come from a slider
    {
      key: "sample", label: "Örnek katmanlar", default: 4, min: 0, max: 4, step: 1, prop: "layers",
      toCode: (n, v) => (!Number(n) ? null : `{${JSON.stringify(SAMPLE.slice(0, Number(n) || 0).map((l) => ({ ...l, speed: Math.round(l.speed * Number(v.depth ?? 0.35) * 100) / 100 })))}}`),
    },
    { key: "text", label: "Öndeki içerik (children)", default: "Derinlik, yalnız transform", kind: "text", prop: "children" },
    { key: "depth", label: "Derinlik (kaydırma hızı)", default: 0.35, min: 0, max: 0.8, step: 0.05, toCode: () => null },
    { key: "pointer", label: "Fare izleme", default: 1, min: 0, max: 2, step: 0.25 },
  ],
});

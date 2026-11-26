import { definePlayground } from "../../spec.ts";

interface Values { shape: string; innerRadius: number; gap: number; rounded: boolean; track: boolean; labels: boolean; center: string;
  max: string; animate: string; legend: string; height: number; title: string }

const ANGLES: Record<string, [number, number]> = { quarter: [0, 270], full: [0, 360], gauge: [-135, 135] };

export default definePlayground<Values>({
  options: [
    { key: "shape", label: "Biçim (startAngle / endAngle)", default: "quarter", options: [{ value: "quarter", label: "üç çeyrek" }, { value: "full", label: "tam daire" }, { value: "gauge", label: "gösterge" }],
      toProps: (v) => { const [startAngle, endAngle] = ANGLES[String(v)] ?? [0, 270]; return { startAngle, endAngle }; },
      toCode: (v) => (v === "full" ? { endAngle: "{360}" } : v === "gauge" ? { startAngle: "{-135}", endAngle: "{135}" } : null) },
    { key: "max", label: "Tam tur (max / rowMax)", default: "row", options: [{ value: "row", label: "her satırın hedefi" }, { value: "auto", label: "en büyük değer" }, { value: "fixed", label: "10000" }],
      toProps: (v) => (v === "row" ? { rowMax: "goal" } : v === "fixed" ? { max: 10000 } : {}), toCode: (v) => (v === "row" ? { rowMax: "\"goal\"" } : v === "fixed" ? { max: "{10000}" } : null) },
    { key: "innerRadius", label: "Ortadaki boşluk (innerRadius)", default: 0.3, min: 0, max: 0.7, step: 0.05, toCode: (v) => (v === 0.3 ? null : `{${v}}`) },
    { key: "gap", label: "Halka arası (gap)", default: 0.28, min: 0, max: 0.7, step: 0.02, toCode: (v) => (v === 0.28 ? null : `{${v}}`) },
    { key: "rounded", label: "Yuvarlak uç (rounded)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "track", label: "İz halkası (track)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "labels", label: "Etiketler (labels)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "center", label: "Orta (center)", default: "auto", options: [{ value: "auto", label: "etkin halka" }, { value: "percent", label: "yüzde" }, { value: "off", label: "yok" }],
      toProp: (v) => (v === "auto" ? undefined : v === "off" ? false : (p: { share: number }) => `%${Math.round(p.share * 100)}`),
      toCode: { auto: null, off: "{false}", percent: "{(p) => `%${Math.round(p.share * 100)}`}" } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 90 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 90 }}" } },
    { key: "legend", label: "Açıklama (legend)", default: "none", options: [{ value: "none", label: "yok" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { none: null } },
    { key: "height", label: "Yükseklik (height)", default: 320, min: 220, max: 480, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Bugünün hedefleri", kind: "text" },
  ],
});

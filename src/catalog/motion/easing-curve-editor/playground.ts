import { definePlayground } from "../../spec.ts";

interface Values { value: string; preview: string; duration: number; presets: boolean; readonly: boolean; compact: boolean; inputs: boolean; cssLine: boolean; grid: boolean; handleColors: string }

export default definePlayground<Values>({
  options: [
    { key: "value", label: "Eğri (value)", default: "cubic-bezier(.34, 1.56, .64, 1)", kind: "text" },
    { key: "preview", label: "Önizleme", default: "move", kind: "segmented", options: [{ value: "move", label: "kayma" }, { value: "scale", label: "büyüme" }, { value: "fade", label: "belirme" }, { value: "none", label: "yok" }] },
    { key: "duration", label: "Süre", default: 900, min: 300, max: 2400, step: 100, unit: "ms", visibleWhen: (v) => v.preview !== "none" },
    // presets: the engine's curves (true leaves the prop out) or none
    { key: "presets", label: "Hazır eğriler", default: true, toCode: { true: null, false: "{false}" } },
    { key: "inputs", label: "Sayı alanları", default: true, toCode: { false: "{false}" } },
    { key: "cssLine", label: "CSS satırı", default: true, toCode: { false: "{false}" } },
    { key: "grid", label: "Izgara çizgileri", default: true, toCode: { false: "{false}" } },
    { key: "compact", label: "Sıkışık (denetçi için)", default: false },
    { key: "handleColors", label: "Tutamak renkleri (handleColors, JSON)", default: '["brand-orange","brand-blue"]', kind: "json", toCode: (x) => `{${String(x)}}` },
    { key: "readonly", label: "Salt okunur", default: false },
  ],
});

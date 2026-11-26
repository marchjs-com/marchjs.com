import { definePlayground } from "../../spec.ts";

interface Values { shape: string; orientation: string; names: boolean; showValue: boolean; showShare: boolean; showConversion: boolean; dropoff: boolean;
  color: string; gap: number; format: string; animate: string; legend: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "shape", label: "Biçim (shape)", default: "funnel", options: [{ value: "funnel", label: "huni" }, { value: "bars", label: "çubuklar" }, { value: "pyramid", label: "piramit" }] },
    { key: "orientation", label: "Yön (orientation)", default: "vertical", options: [{ value: "vertical", label: "dikey" }, { value: "horizontal", label: "yatay" }] },
    { key: "names", label: "Aşama adları (names)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "showValue", label: "Değer (showValue)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "showShare", label: "İlk aşamaya göre pay (showShare)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "showConversion", label: "Adım dönüşümü (showConversion)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "dropoff", label: "Kayıp (dropoff)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "color", label: "Renk (color)", default: "", options: [{ value: "", label: "palet" }, { value: "primary", label: "vurgu tonları" }, { value: "brand-blue", label: "mavi tonları" }, { value: "brand-orange", label: "turuncu tonları" }],
      toProp: (v) => (v || undefined), toCode: (v) => (v ? JSON.stringify(v) : null) },
    { key: "gap", label: "Aşama arası (gap)", default: 6, min: 0, max: 24, step: 2, unit: "px" },
    { key: "format", label: "Değer biçimi (format)", default: "number", options: [{ value: "number", label: "sayı" }, { value: "compact", label: "kısa (18 B)" }], toCode: { number: null } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v), toCode: { spring: null, out: "\"out\"", stagger: "{{ stagger: 60 }}", off: "{false}" } },
    { key: "legend", label: "Açıklama (legend)", default: "none", options: [{ value: "none", label: "yok" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { none: null } },
    { key: "height", label: "Yükseklik (height)", default: 300, min: 180, max: 460, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Satın alma hunisi", kind: "text" },
  ],
});

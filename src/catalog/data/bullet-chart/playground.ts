import { definePlayground } from "../../spec.ts";

interface Values { orientation: string; compact: boolean; rangeTone: string; axis: boolean; showValue: boolean; names: boolean; previous: boolean;
  color: string; rowHeight: number; animate: string; legend: string; title: string }

export default definePlayground<Values>({
  options: [
    { key: "orientation", label: "Yön (orientation)", default: "horizontal", options: [{ value: "horizontal", label: "satırlar" }, { value: "vertical", label: "sütunlar" }], toCode: { horizontal: null } },
    { key: "compact", label: "Sıkı (compact)", default: false },
    { key: "rangeTone", label: "Aralık tonu (rangeTone)", default: "neutral", options: [{ value: "neutral", label: "gri tonlar" }, { value: "traffic", label: "trafik ışığı" }], toCode: { neutral: null } },
    { key: "axis", label: "Çentikler (axis)", default: true, visibleWhen: (v) => !v.compact, toCode: { true: null, false: "{false}" } },
    { key: "showValue", label: "Değer yazısı (showValue)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "names", label: "Adlar (names)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "previous", label: "Geçen çeyrek (previous)", default: true, toProp: (v) => (v ? "previous" : () => null), toCode: { true: null, false: "{() => null}" } },
    { key: "color", label: "Çubuk rengi (color)", default: "", options: [{ value: "", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "success", label: "yeşil" }, { value: "brand-purple", label: "mor" }],
      toProp: (v) => (v || undefined), toCode: (v) => (v ? JSON.stringify(v) : null) },
    { key: "rowHeight", label: "Satır yüksekliği (rowHeight)", default: 58, min: 40, max: 90, step: 2, unit: "px", visibleWhen: (v) => v.orientation === "horizontal" && !v.compact,
      toCode: (v) => (v === 58 ? null : `{${v}}`) },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v), toCode: { spring: null, out: "\"out\"", stagger: "{{ stagger: 60 }}", off: "{false}" } },
    { key: "legend", label: "Açıklama (legend)", default: "none", options: [{ value: "none", label: "yok" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { none: null } },
    { key: "title", label: "Başlık (title)", default: "Çeyrek hedefleri", kind: "text" },
  ],
});

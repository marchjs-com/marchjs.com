import { definePlayground } from "../../spec.ts";

interface Values { maxDepth: number; innerRadius: number; padAngle: number; labels: boolean; drill: boolean; breadcrumbs: boolean; center: string;
  format: string; animate: string; legend: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "maxDepth", label: "Görünen düzey (maxDepth)", default: 3, options: [{ value: 1, label: "1" }, { value: 2, label: "2" }, { value: 3, label: "3" }, { value: 4, label: "4" }], toCode: (v) => (v === 3 ? null : `{${v}}`) },
    { key: "innerRadius", label: "Ortadaki boşluk (innerRadius)", default: 0.3, min: 0, max: 0.6, step: 0.05, toCode: (v) => (v === 0.3 ? null : `{${v}}`) },
    { key: "padAngle", label: "Yay arası (padAngle)", default: 0.006, min: 0, max: 0.04, step: 0.002, toCode: (v) => (v === 0.006 ? null : `{${v}}`) },
    { key: "labels", label: "Etiketler (labels)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "drill", label: "İçine girme (drill)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "breadcrumbs", label: "Yol satırı (breadcrumbs)", default: true, visibleWhen: (v) => v.drill, toCode: (v) => (v ? null : "{false}") },
    { key: "center", label: "Orta (center)", default: "auto", options: [{ value: "auto", label: "ad ve değer" }, { value: "share", label: "toplamdaki pay" }, { value: "off", label: "yok" }],
      toProp: (v) => (v === "auto" ? undefined : v === "off" ? false : (p: { total: number }) => `%${Math.round(p.total * 100)}`),
      toCode: { auto: null, off: "{false}", share: "{(p) => `%${Math.round(p.total * 100)}`}" } },
    { key: "format", label: "Değer biçimi (format)", default: "money", options: [{ value: "money", label: "para (TRY)" }, { value: "compact", label: "kısa (1,2 B)" }, { value: "number", label: "sayı" }],
      toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { money: "{[\"money\", \"TRY\"]}", number: null } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 140 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 140 }}" } },
    { key: "legend", label: "Açıklama (legend)", default: "bottom", options: [{ value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { bottom: null, none: "{false}" } },
    { key: "height", label: "Yükseklik (height)", default: 360, min: 240, max: 520, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Aylık harcama", kind: "text" },
  ],
});

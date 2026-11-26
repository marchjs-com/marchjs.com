import { definePlayground } from "../../spec.ts";

interface Values { start: boolean; subtotal: boolean; totals: boolean; connectors: boolean; labels: boolean; orientation: string; palette: string;
  marks: string; format: string; animate: string; legend: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "start", label: "Başlangıç sütunu (start)", default: true, toProp: (v) => (v ? 84000 : undefined), toCode: { true: "{84000}", false: null } },
    // the showcase card's own: a subtotal row in the data (a row with total: true)
    { key: "subtotal", label: "Ara toplam satırı (total)", default: true, prop: false },
    { key: "totals", label: "Sonda toplam (totals)", default: true, toProp: (v) => (v ? "end" : undefined), toCode: { true: "\"end\"", false: null } },
    { key: "connectors", label: "Bağlantılar (connectors)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "labels", label: "Değer yazıları (labels)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "orientation", label: "Yön (orientation)", default: "vertical", options: [{ value: "vertical", label: "dikey" }, { value: "horizontal", label: "yatay" }], toCode: { vertical: null } },
    { key: "palette", label: "Renkler (upColor, downColor, totalColor)", default: "theme", options: [{ value: "theme", label: "tema (iyi / kötü / nötr)" }, { value: "brand", label: "HADİ renkleri" }], prop: false,
      toProps: (v) => (v === "brand" ? { upColor: "brand-blue", downColor: "brand-orange", totalColor: "brand-purple" } : {}) },
    { key: "marks", label: "İşaret (marks)", default: "none", options: [{ value: "none", label: "yok" }, { value: "goal", label: "hedef çizgisi" }, { value: "average", label: "ortalama" }],
      visibleWhen: (v) => v.orientation === "vertical", toProp: (v) => (v === "goal" ? [{ y: 100000, label: "Hedef 100 B", color: "brand-green" }] : v === "average" ? [{ y: "average" }] : undefined),
      toCode: { none: null, goal: "{[{ y: 100000, label: \"Hedef 100 B\", color: \"brand-green\" }]}", average: "{[{ y: \"average\" }]}" } },
    { key: "format", label: "Değer biçimi (format)", default: "compact", options: [{ value: "compact", label: "kısa (42 B)" }, { value: "money", label: "para (TRY)" }, { value: "number", label: "sayı" }],
      toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { compact: "\"compact\"", number: null, money: "{[\"money\", \"TRY\"]}" } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v), toCode: { spring: null, out: "\"out\"", stagger: "{{ stagger: 60 }}", off: "{false}" } },
    { key: "legend", label: "Açıklama (legend)", default: "none", options: [{ value: "none", label: "yok" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { none: null } },
    { key: "height", label: "Yükseklik (height)", default: 300, min: 200, max: 460, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Kâr köprüsü", kind: "text" },
  ],
});

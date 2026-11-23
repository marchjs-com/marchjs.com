import { definePlayground } from "../../spec.ts";

interface Values { series: string; stacked: boolean; horizontal: boolean; animate: string; grid: boolean; legend: string; format: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    // the showcase card's own: how many series the week shows
    { key: "series", label: "Seriler", default: "both", options: [{ value: "one", label: "bir seri" }, { value: "both", label: "iki seri" }], prop: false },
    { key: "stacked", label: "Yığılmış (stacked)", default: false, visibleWhen: (v) => v.series === "both" },
    { key: "horizontal", label: "Yatay (horizontal)", default: false },
    { key: "animate", label: "Veri değişince (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "off", label: "yerinde" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v), toCode: { spring: "", off: null } },
    { key: "grid", label: "Izgara (grid)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "legend", label: "Açıklama (legend)", default: "auto", options: [{ value: "auto", label: "birden çok seride" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v === "auto" ? undefined : v), toCode: { auto: null, none: "{false}" } },
    { key: "format", label: "Değer biçimi (format)", default: "number", options: [{ value: "number", label: "sayı" }, { value: "money", label: "para (TRY)" }, { value: "compact", label: "kısa (1,2 B)" }],
      toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { number: null, money: "{[\"money\", \"TRY\"]}" } },
    { key: "height", label: "Yükseklik (height)", default: 260, min: 160, max: 420, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Haftalık satış", kind: "text" },
  ],
});

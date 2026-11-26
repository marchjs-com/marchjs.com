import { definePlayground } from "../../spec.ts";

interface Values { series: string; stacked: boolean; horizontal: boolean; labels: string; marks: string; animate: string; grid: boolean; legend: string; format: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    // the showcase card's own: how many series the week shows
    { key: "series", label: "Seriler", default: "both", options: [{ value: "one", label: "bir seri" }, { value: "both", label: "iki seri" }], prop: false },
    { key: "stacked", label: "Yığılmış (stacked)", default: false, visibleWhen: (v) => v.series === "both" },
    { key: "horizontal", label: "Yatay (horizontal)", default: false },
    { key: "labels", label: "Değer etiketleri (labels)", default: "off", options: [{ value: "off", label: "yok" }, { value: "outside", label: "dışta" }, { value: "inside", label: "içte" }],
      toProp: (v) => (v === "off" ? false : v), toCode: { off: null } },
    { key: "marks", label: "Referanslar (marks)", default: "target", options: [{ value: "none", label: "yok" }, { value: "target", label: "hedef" }, { value: "average", label: "ortalama" }], prop: false, visibleWhen: (v) => !v.horizontal },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 70 } : v), toCode: { spring: null, out: "\"out\"", stagger: "{{ stagger: 70 }}", off: "{false}" } },
    { key: "grid", label: "Izgara (grid)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "legend", label: "Açıklama (legend)", default: "auto", options: [{ value: "auto", label: "birden çok seride" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v === "auto" ? undefined : v), toCode: { auto: null, none: "{false}" } },
    { key: "format", label: "Değer biçimi (format)", default: "number", options: [{ value: "number", label: "sayı" }, { value: "money", label: "para (TRY)" }, { value: "compact", label: "kısa (1,2 B)" }],
      toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { number: null, money: "{[\"money\", \"TRY\"]}" } },
    { key: "height", label: "Yükseklik (height)", default: 260, min: 160, max: 420, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Haftalık satış", kind: "text" },
  ],
});

import { definePlayground } from "../../spec.ts";

interface Values { kind: string; series: string; stacked: boolean; zoom: boolean; grid: string; legend: string; zero: boolean; format: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    // the showcase card's own: line or area (AreaChart); in MarchIDE the example names the component
    { key: "kind", label: "Grafik", default: "line", options: [{ value: "line", label: "çizgi (LineChart)" }, { value: "area", label: "alan (AreaChart)" }], prop: false },
    { key: "series", label: "Seriler", default: "both", options: [{ value: "one", label: "bir seri" }, { value: "both", label: "iki seri" }], prop: false },
    { key: "stacked", label: "Yığılmış (stacked, alan)", default: false, visibleWhen: (v) => v.kind === "area" && v.series === "both" },
    { key: "zoom", label: "Sürükleyerek yakınlaştır (zoom)", default: true },
    { key: "grid", label: "Izgara (grid)", default: "y", options: [{ value: "y", label: "yatay" }, { value: "both", label: "iki yön" }, { value: "x", label: "dikey" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "y" ? true : v === "none" ? false : v), toCode: { y: null, none: "{false}" } },
    { key: "legend", label: "Açıklama (legend)", default: "auto", options: [{ value: "auto", label: "birden çok seride" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v === "auto" ? undefined : v), toCode: { auto: null, none: "{false}" } },
    { key: "zero", label: "0'dan başla (zero)", default: false },
    { key: "format", label: "Değer biçimi (format)", default: "number", options: [{ value: "number", label: "sayı" }, { value: "money", label: "para (TRY)" }, { value: "compact", label: "kısa (1,2 B)" }],
      toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { number: null, money: "{[\"money\", \"TRY\"]}" } },
    { key: "height", label: "Yükseklik (height)", default: 260, min: 160, max: 420, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Gelir ve gider", kind: "text" },
  ],
});

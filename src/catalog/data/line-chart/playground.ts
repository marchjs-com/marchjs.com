import { definePlayground } from "../../spec.ts";

interface Values { kind: string; series: string; stacked: boolean; offset: string; curve: string; markers: string; gaps: string; marks: string; window: string; navigator: boolean;
  zoom: boolean; grid: string; legend: string; zero: boolean; format: string; animate: string; exportable: boolean; height: number; title: string }

export default definePlayground<Values>({
  options: [
    // the showcase card's own: line, area (AreaChart) or bars + line (ComboChart); in MarchIDE the example names the component
    { key: "kind", label: "Grafik", default: "line", options: [{ value: "line", label: "çizgi (LineChart)" }, { value: "area", label: "alan (AreaChart)" }, { value: "combo", label: "karma (ComboChart)" }], prop: false },
    { key: "series", label: "Seriler", default: "both", options: [{ value: "one", label: "bir seri" }, { value: "both", label: "iki seri" }], prop: false, visibleWhen: (v) => v.kind !== "combo" },
    { key: "stacked", label: "Yığılmış (stacked)", default: false, visibleWhen: (v) => v.kind === "area" && v.series === "both" },
    { key: "offset", label: "Yığın tabanı (offset)", default: "zero", options: [{ value: "zero", label: "sıfır" }, { value: "expand", label: "%100" }, { value: "silhouette", label: "ortalı" }, { value: "wiggle", label: "akış" }],
      visibleWhen: (v) => v.kind === "area" && v.series === "both" && v.stacked, toCode: { zero: null } },
    { key: "curve", label: "Eğri (curve)", default: "linear", options: [{ value: "linear", label: "düz" }, { value: "smooth", label: "yumuşak" }, { value: "step", label: "basamak" }, { value: "step-after", label: "basamak sonra" }], toCode: { linear: null } },
    { key: "markers", label: "İşaretler (markers)", default: "off", options: [{ value: "off", label: "yok" }, { value: "auto", label: "az noktada" }, { value: "circle", label: "daire" }, { value: "square", label: "kare" }, { value: "diamond", label: "baklava" }],
      toProp: (v) => (v === "off" ? false : v), toCode: { off: null } },
    { key: "gaps", label: "Kapalı günler", default: "gap", options: [{ value: "gap", label: "boşluk" }, { value: "connect", label: "birleştir (connectNulls)" }], prop: false },
    { key: "marks", label: "Referanslar (marks)", default: "target", options: [{ value: "none", label: "yok" }, { value: "target", label: "hedef" }, { value: "stats", label: "ortalama, en yüksek" }, { value: "band", label: "dönem ve not" }], prop: false },
    { key: "window", label: "Canlı pencere (window)", default: "all", options: [{ value: "all", label: "hepsi" }, { value: "14", label: "son 14 gün" }, { value: "7", label: "son 7 gün" }],
      toProp: (v) => (v === "all" ? undefined : Number(v)), toCode: { all: null, "14": "{14}", "7": "{7}" } },
    { key: "navigator", label: "Aralık gezgini (navigator)", default: false },
    { key: "zoom", label: "Sürükleyerek yakınlaştır (zoom)", default: true },
    { key: "grid", label: "Izgara (grid)", default: "y", options: [{ value: "y", label: "yatay" }, { value: "both", label: "iki yön" }, { value: "x", label: "dikey" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "y" ? true : v === "none" ? false : v), toCode: { y: null, none: "{false}" } },
    { key: "legend", label: "Açıklama (legend)", default: "auto", options: [{ value: "auto", label: "birden çok seride" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v === "auto" ? undefined : v), toCode: { auto: null, none: "{false}" } },
    { key: "zero", label: "0'dan başla (zero)", default: false, visibleWhen: (v) => v.kind === "line" },
    { key: "format", label: "Değer biçimi (format)", default: "number", options: [{ value: "number", label: "sayı" }, { value: "money", label: "para (TRY)" }, { value: "compact", label: "kısa (1,2 B)" }],
      visibleWhen: (v) => v.kind !== "combo", toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { number: null, money: "{[\"money\", \"TRY\"]}" } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "seri seri" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 120 } : v), toCode: { spring: null, out: "\"out\"", stagger: "{{ stagger: 120 }}", off: "{false}" } },
    { key: "exportable", label: "Dışa aktar (export)", default: false, prop: "export" },
    { key: "height", label: "Yükseklik (height)", default: 260, min: 160, max: 420, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Gelir ve gider", kind: "text" },
  ],
});

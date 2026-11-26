import { definePlayground } from "../../spec.ts";

interface Values { colorScale: string; bins: string; labels: string; legend: string; zoom: boolean; tooltip: boolean; missing: boolean; noData: string; animate: string; title: string }

const COLORS = ["#fef3c7", "#f59e0b", "#7c2d12"];

export default definePlayground<Values>({
  options: [
    { key: "colorScale", label: "Renk ölçeği (colorScale)", default: "sequential",
      options: [{ value: "sequential", label: "tek yön" }, { value: "diverging", label: "iki yön" }, { value: "custom", label: "kendi renklerim" }],
      toProp: (v) => (v === "custom" ? COLORS : v), toCode: { sequential: null, diverging: "\"diverging\"", custom: `{${JSON.stringify(COLORS)}}` } },
    { key: "bins", label: "Sınıflar (bins)", default: "classes",
      options: [{ value: "classes", label: "eşiklerle" }, { value: "five", label: "5 eşit sınıf" }, { value: "continuous", label: "sürekli" }],
      toProp: (v) => (v === "five" ? 5 : v === "continuous" ? undefined : [250, 500, 1000, 2000, 4000]),
      toCode: { classes: "{[250, 500, 1000, 2000, 4000]}", five: "{5}", continuous: null } },
    { key: "labels", label: "Etiketler (labels)", default: "none",
      options: [{ value: "none", label: "yok" }, { value: "name", label: "il adı" }, { value: "value", label: "değer" }],
      toProp: (v) => (v === "none" ? undefined : v), toCode: { none: null, name: "", value: "\"value\"" } },
    { key: "legend", label: "Renk açıklaması (legend)", default: "bottom",
      options: [{ value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { bottom: null, none: "{false}" } },
    { key: "zoom", label: "Yakınlaştırma (zoom)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "tooltip", label: "Araç ipucu (tooltip)", default: true, toCode: { true: null, false: "{false}" } },
    // the stage's own: drop every seventh province so the no-data fill shows
    { key: "missing", label: "Eksik veri (bazı iller boş)", default: false, prop: false },
    { key: "noData", label: "Verisiz il dolgusu (noData)", default: "hatch", visibleWhen: (v) => v.missing,
      options: [{ value: "hatch", label: "tarama" }, { value: "gray", label: "gri" }, { value: "none", label: "boş" }],
      toProp: (v) => (v === "gray" ? "--m-surface-3" : v === "none" ? "transparent" : undefined), toCode: { hatch: null, gray: "\"--m-surface-3\"", none: "\"transparent\"" } },
    { key: "animate", label: "Animasyon (animate)", default: "spring",
      options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v),
      toCode: { spring: null, out: "\"out\"", stagger: "{{ stagger: 60 }}", off: "{false}" } },
    { key: "title", label: "Başlık (title)", default: "İllere göre nüfus", kind: "text" },
  ],
});

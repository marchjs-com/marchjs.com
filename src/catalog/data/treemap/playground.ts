import { definePlayground } from "../../spec.ts";

interface Values { depth: number; color: string; colorScale: string; labels: boolean; valueLabels: boolean; padding: number; radius: number; drill: boolean;
  breadcrumbs: boolean; animate: string; legend: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "depth", label: "Seviye (depth)", default: 2, options: [{ value: 1, label: "1 · düz" }, { value: 2, label: "2 · gruplu" }, { value: 3, label: "3" }], toCode: (v) => (v === 2 ? null : `{${v}}`) },
    { key: "color", label: "Renk (colorValue)", default: "branch", options: [{ value: "branch", label: "klasöre göre" }, { value: "change", label: "aylık değişim" }],
      prop: "colorValue", toProp: (v) => (v === "change" ? "change" : undefined), toCode: { branch: null, change: "\"change\"" } },
    { key: "colorScale", label: "Renk ölçeği (colorScale)", default: "diverging", options: [{ value: "diverging", label: "iki yönlü" }, { value: "sequential", label: "tek yönlü" }],
      visibleWhen: (v) => v.color === "change", toCode: { sequential: null } },
    { key: "labels", label: "Adlar (labels)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "valueLabels", label: "Değerler (valueLabels)", default: true, visibleWhen: (v) => v.labels, toCode: (v) => (v ? null : "{false}") },
    { key: "padding", label: "Boşluk (padding)", default: 2, min: 0, max: 8, step: 1, unit: "px", toCode: (v) => (v === 2 ? null : `{${v}}`) },
    { key: "radius", label: "Köşe (radius)", default: 4, min: 0, max: 12, step: 1, unit: "px", toCode: (v) => (v === 4 ? null : `{${v}}`) },
    { key: "drill", label: "İçine girme (drill)", default: true, toCode: (v) => (v ? null : "{false}") },
    { key: "breadcrumbs", label: "Yol satırı (breadcrumbs)", default: true, visibleWhen: (v) => v.drill, toCode: (v) => (v ? null : "{false}") },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 30 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 30 }}" } },
    { key: "legend", label: "Açıklama (legend)", default: "none", options: [{ value: "none", label: "yok" }, { value: "bottom", label: "altta" }, { value: "right", label: "sağda" }],
      toProp: (v) => (v === "none" ? false : v), toCode: { none: null } },
    { key: "height", label: "Yükseklik (height)", default: 320, min: 200, max: 480, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Telefon depolaması", kind: "text" },
  ],
});

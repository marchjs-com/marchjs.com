import { definePlayground } from "../../spec.ts";

interface Values { size: boolean; group: boolean; shape: string; trend: boolean; marks: boolean; grid: string; animate: string; legend: string; height: number; title: string }

export default definePlayground<Values>({
  options: [
    { key: "size", label: "Kabarcık (size)", default: true, toProp: (v) => (v ? "population" : undefined), toCode: (v) => (v ? '"population"' : null) },
    { key: "group", label: "Bölgeye göre renk (group)", default: true, toProp: (v) => (v ? "region" : undefined), toCode: (v) => (v ? '"region"' : null) },
    { key: "shape", label: "Simge (shape)", default: "circle", options: [{ value: "circle", label: "daire" }, { value: "auto", label: "seriye göre" }, { value: "diamond", label: "karo" }, { value: "square", label: "kare" }],
      toCode: { circle: null } },
    { key: "trend", label: "Eğilim çizgisi (trend)", default: true, toProp: (v) => (v ? "linear" : false), toCode: (v) => (v ? '"linear"' : null) },
    { key: "marks", label: "Çeyrek çizgileri (marks)", default: true, toProp: (v) => (v ? [{ x: 40, label: "Orta gelir" }, { y: 6, label: "Mutlu" }] : []),
      toCode: (v) => (v ? '{[{ x: 40, label: "Orta gelir" }, { y: 6, label: "Mutlu" }]}' : null) },
    { key: "grid", label: "Izgara (grid)", default: "both", options: [{ value: "both", label: "iki yön" }, { value: "y", label: "yatay" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "none" ? false : v === "both" ? true : v), toCode: { both: null, none: "{false}" } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 60 }}" } },
    { key: "legend", label: "Açıklama (legend)", default: "bottom", options: [{ value: "bottom", label: "altta" }, { value: "right", label: "sağda" }, { value: "none", label: "yok" }],
      visibleWhen: (v) => v.group, toProp: (v) => (v === "none" ? false : v), toCode: { bottom: null, none: "{false}" } },
    { key: "height", label: "Yükseklik (height)", default: 320, min: 220, max: 460, step: 20, unit: "px" },
    { key: "title", label: "Başlık (title)", default: "Gelir ve mutluluk", kind: "text" },
  ],
});

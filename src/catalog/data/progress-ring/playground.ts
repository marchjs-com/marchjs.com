import { definePlayground } from "../../spec.ts";

interface Values { value: number; max: number; size: number; thickness: number; colors: string; paint: string; color: string; label: string }

export default definePlayground<Values>({
  options: [
    { key: "value", label: "Değer (value; vitrinde ilk halka)", default: 72, min: 0, max: 100, step: 1 },
    { key: "max", label: "Tam puan (max)", default: 100, options: [{ value: 100, label: "100" }, { value: 10, label: "10" }, { value: 5, label: "5" }], toCode: (v) => (v === 100 ? null : `{${v}}`) },
    { key: "size", label: "Çap (size)", default: 72, min: 40, max: 140, step: 4, unit: "px", toCode: (v) => (v === 64 ? null : `{${v}}`) },
    { key: "thickness", label: "Kalınlık (thickness)", default: 8, min: 2, max: 20, step: 1, unit: "px", toCode: (v) => (v === 8 ? null : `{${v}}`) },
    { key: "colors", label: "Renkler (colors)", default: "theme", options: [{ value: "theme", label: "tema" }, { value: "brand", label: "HADİ dört renk" }, { value: "single", label: "tek renk" }],
      toProp: (v) => (v === "theme" ? undefined : v), toCode: { theme: null } },
    { key: "paint", label: "Dizilim (paint)", default: "gradient", options: [{ value: "gradient", label: "gradyan" }, { value: "segments", label: "parçalar" }, { value: "cycle", label: "akan" }],
      visibleWhen: (v) => v.colors === "brand", toCode: { gradient: null } },
    { key: "color", label: "Renk (color)", default: "", options: [{ value: "", label: "düzeye göre" }, { value: "primary", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "success", label: "yeşil" }],
      visibleWhen: (v) => v.colors !== "brand", toProp: (v) => (v || undefined), toCode: (v) => (v ? JSON.stringify(v) : null) },
    { key: "label", label: "Erişilebilir ad (label)", default: "Uyku puanı", kind: "text" },
  ],
});

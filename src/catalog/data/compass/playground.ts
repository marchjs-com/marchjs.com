import { definePlayground } from "../../spec.ts";

interface Values { heading: number; mode: string; bearing: string; points: number; readout: boolean; color: string; size: number; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    // heading is required: the bare Compass in MarchIDE points here
    { key: "heading", label: "Yön (heading)", default: 40, min: 0, max: 359, step: 1, unit: "°", toCode: (x) => `{${x}}` },
    { key: "mode", label: "Dönen parça (mode)", default: "rose", options: [{ value: "rose", label: "gül" }, { value: "needle", label: "ibre" }], toCode: { rose: null } },
    { key: "bearing", label: "Hedef rota (bearing)", default: "none", options: [{ value: "none", label: "yok" }, { value: "120", label: "120°" }, { value: "250", label: "250°" }],
      toCode: (x) => (x === "none" ? null : `{${x}}`), toProp: (x) => (x === "none" ? undefined : Number(x)) },
    { key: "points", label: "Yön sayısı (points)", default: 4, options: [{ value: 4, label: "4" }, { value: 8, label: "8" }], toCode: (x) => (x === 4 ? null : `{${x}}`), toProp: (x) => Number(x) },
    { key: "readout", label: "Gösterge (readout)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "color", label: "Renk (color)", default: "danger", options: [{ value: "danger", label: "kırmızı" }, { value: "brand-blue", label: "mavi" }, { value: "success", label: "yeşil" }, { value: "brand-orange", label: "turuncu" }],
      toCode: { danger: null } },
    { key: "size", label: "Genişlik (size)", default: 220, min: 140, max: 320, step: 10, unit: "px", toCode: (x) => (x === 220 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true },
    { key: "label", label: "Erişilebilir ad (label)", default: "Pusula", kind: "text" },
  ],
});

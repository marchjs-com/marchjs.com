import { definePlayground } from "../../spec.ts";

interface Values { effect: string; color: string; front: boolean; opacity: number; inset: number; blend: string }

export default definePlayground<Values>({
  options: [
    { key: "effect", label: "Efekt", default: "mesh", kind: "grid", options: ["glass", "gradient", "mesh", "noise", "vignette", "spotlight", "grid", "dots"] },
    { key: "color", label: "Efekt rengi", default: "theme", kind: "chips", options: [{ value: "theme", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], visibleWhen: (v) => ["spotlight", "dots", "grid", "vignette"].includes(v.effect), prop: "m:color", toCode: { theme: null } },
    { key: "front", label: "İçeriğin önünde", default: false },
    { key: "opacity", label: "Opaklık", default: 1, min: 0.2, max: 1, step: 0.1 },
    { key: "inset", label: "Kenar boşluğu (inset, 0–8)", default: 0, min: 0, max: 8, step: 1 },
    { key: "blend", label: "Karışım (blend)", default: "normal", options: ["normal", "multiply", "screen", "overlay"] },
  ],
});

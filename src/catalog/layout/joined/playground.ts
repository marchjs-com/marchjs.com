import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";

interface Values { direction: string; radius: number; border: boolean; dividers: boolean; parts: number }

export default definePlayground<Values>({
  options: [
    { key: "direction", label: "Yön", default: "vertical", options: [{ value: "vertical", label: "dikey" }, { value: "horizontal", label: "yatay" }] },
    { key: "radius", label: "Köşe", default: 2, min: 0, max: 4, step: 1 },
    { key: "border", label: "Çerçeve", default: true, toCode: { true: null, false: "{false}" } },
    { key: "dividers", label: "Aradaki çizgi", default: true, toCode: { true: null, false: "{false}" } },
    // MarchIDE: the bare Joined gets this many sample cards
    { key: "parts", label: "Parça sayısı", default: 3, min: 2, max: 5, prop: "children",
      toProp: (n) => Array.from({ length: Number(n) }, (_, i) => el("div", "m-card", el("div", "m-card-body", `Parça ${i + 1}`))), toCode: (n) => `{parts.slice(0, ${String(n)})}` },
  ],
});

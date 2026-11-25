import { definePlayground } from "../../spec.ts";

interface Values { input: string; value: number; effect: string; color: string; gain: number; intensity: number; smoothing: number; motion: boolean }

export default definePlayground<Values>({
  stage: "center",
  options: [
    // the required `source`: the synthesized loop, or a number 0–1 (a number is a source too)
    { key: "input", label: "Kaynak (source)", default: "demo", options: [{ value: "demo", label: "demo ses" }, { value: "value", label: "sayı" }],
      prop: "source", toCode: (x, v) => (x === "demo" ? "{voice}" : `{${v.value / 100}}`), toProp: (x, v) => (x === "demo" ? "demo" : v.value / 100) },
    { key: "value", label: "Değer (sayı kaynağı)", default: 50, min: 0, max: 100, step: 1, unit: "%", visibleWhen: (v) => v.input === "value", prop: false },
    { key: "effect", label: "Efekt (effect)", default: "ring", options: [{ value: "ring", label: "halka" }, { value: "pulse", label: "nabız" }, { value: "glow", label: "ışıltı" }, { value: "bounce", label: "zıplama" }, { value: "ring+glow", label: "halka + ışıltı" }],
      toCode: { "ring+glow": '{["ring", "glow"]}' }, toProp: (x) => (x === "ring+glow" ? ["ring", "glow"] : x) },
    { key: "color", label: "Renk (color)", default: "brand-green", options: [{ value: "", label: "vurgu" }, { value: "brand-green", label: "yeşil" }, { value: "brand-blue", label: "mavi" }, { value: "brand-pink", label: "pembe" }],
      toProp: (x) => (x || undefined), toCode: (x) => (x ? JSON.stringify(x) : null) },
    { key: "gain", label: "Kazanç (gain)", default: 2, min: 0.5, max: 4, step: 0.25, toCode: (x) => (x === 1 ? null : `{${x}}`) },
    { key: "intensity", label: "Güç (intensity)", default: 1, min: 0, max: 2, step: 0.1, toCode: (x) => (x === 1 ? null : `{${x}}`) },
    { key: "smoothing", label: "Düşüş yumuşatma (smoothing)", default: 0, min: 0, max: 0.95, step: 0.05, toCode: (x) => (x ? `{${x}}` : null) },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
  ],
  code: {
    children: '<Avatar name="Ada Yılmaz" size="xl" />',
  },
});

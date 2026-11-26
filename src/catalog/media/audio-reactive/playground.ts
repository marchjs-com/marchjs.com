import { definePlayground } from "../../spec.ts";

/** The "ritim" source: a number accessor, a beat twice a second that rises at once and fades (the stage uses it too). */
export const beat = (): number => { const t = (performance.now() % 500) / 500; return Math.max(0.1, 1 - t * 1.6); };
const BEAT_CODE = "() => { const t = (performance.now() % 500) / 500; return Math.max(0.1, 1 - t * 1.6) }";

interface Values { input: string; value: number; effect: string; color: string; gain: number; intensity: number; smoothing: number; motion: boolean }

export default definePlayground<Values>({
  stage: "center",
  options: [
    // the required `source`: a number 0–1 (a number is a source too: no permission, it runs at once, so every option
    // shows), a beat (a number accessor that pulses), or the synthesized loop (it waits for "Ada konuşsun"). In
    // MarchIDE an instance's values hold only what was changed: the number's default is filled in here
    { key: "input", label: "Kaynak (source)", default: "value", options: [{ value: "value", label: "sayı" }, { value: "beat", label: "ritim" }, { value: "demo", label: "demo ses" }],
      prop: "source", toCode: (x, v) => (x === "demo" ? "{voice}" : x === "beat" ? `{${BEAT_CODE}}` : `{${(v.value ?? 50) / 100}}`),
      toProp: (x, v) => (x === "demo" ? "demo" : x === "beat" ? beat : (v.value ?? 50) / 100) },
    { key: "value", label: "Değer (sayı kaynağı)", default: 50, min: 0, max: 100, step: 1, unit: "%", visibleWhen: (v) => v.input === "value", prop: false },
    { key: "effect", label: "Efekt (effect)", default: "ring", options: [{ value: "ring", label: "halka" }, { value: "pulse", label: "nabız" }, { value: "glow", label: "ışıltı" }, { value: "bounce", label: "zıplama" }, { value: "ring+glow", label: "halka + ışıltı" }],
      toCode: { "ring+glow": '{["ring", "glow"]}' }, toProp: (x) => (x === "ring+glow" ? ["ring", "glow"] : x) },
    // "vurgu" is the accent's own token (primary), written: an instance whose code has a colour takes it too
    { key: "color", label: "Renk (color)", default: "brand-green", options: [{ value: "primary", label: "vurgu" }, { value: "brand-green", label: "yeşil" }, { value: "brand-blue", label: "mavi" }, { value: "brand-pink", label: "pembe" }],
      toCode: (x) => (x === "primary" ? null : JSON.stringify(x)), toProp: (x) => x },
    { key: "gain", label: "Kazanç (gain)", default: 2, min: 0.5, max: 4, step: 0.25, toCode: (x) => (x === 1 ? null : `{${x}}`) },
    { key: "intensity", label: "Güç (intensity)", default: 1, min: 0, max: 2, step: 0.1, toCode: (x) => (x === 1 ? null : `{${x}}`) },
    { key: "smoothing", label: "Düşüş yumuşatma (smoothing)", default: 0, min: 0, max: 0.95, step: 0.05, toCode: (x) => (x ? `{${x}}` : null) },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
  ],
  code: {
    children: '<Avatar name="Ada Yılmaz" size="xl" />',
  },
});

import { definePlayground } from "../../spec.ts";

interface Values { input: string; left: number; right: number; reference: string; panel: string; peak: number; peakHold: number; needle: string;
  size: number; caption: string; lights: boolean; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  options: [
    // the input: a steady tone (a number is a source: no permission, it runs at once, so every option shows), two
    // numbers through `value`, or the synthesized loop (it waits for "Müziği başlat")
    { key: "input", label: "Giriş", default: "tone", options: [{ value: "tone", label: "sabit ton (source)" }, { value: "value", label: "sayılar (value)" }, { value: "demo", label: "demo müzik (source)" }],
      prop: "source", toCode: { tone: "{0.5}", demo: "{song}", value: null },
      toProp: (x) => (x === "demo" ? "demo" : x === "tone" ? 0.5 : undefined) },
    // two numbers 0–1 through `value` (each slider writes the pair; an instance in MarchIDE holds only changed values)
    { key: "left", label: "Sol (value[0])", default: 55, min: 0, max: 100, step: 1, unit: "%", visibleWhen: (v) => v.input === "value", prop: "value",
      toCode: (x, v) => `{[${Number(x) / 100}, ${(v.right ?? 40) / 100}]}`, toProp: (x, v) => [Number(x) / 100, (v.right ?? 40) / 100] },
    { key: "right", label: "Sağ (value[1])", default: 40, min: 0, max: 100, step: 1, unit: "%", visibleWhen: (v) => v.input === "value", prop: "value",
      toCode: (x, v) => `{[${(v.left ?? 55) / 100}, ${Number(x) / 100}]}`, toProp: (x, v) => [(v.left ?? 55) / 100, Number(x) / 100] },
    { key: "reference", label: "0 VU düzeyi (reference)", default: "0.5", options: [{ value: "0.5", label: "−6 dBFS" }, { value: "0.126", label: "−18 dBFS (stüdyo)" }],
      toCode: { "0.5": null, "0.126": "{0.126}" }, toProp: (x) => Number(x) },
    { key: "panel", label: "Panel (panel)", default: "metal", options: [{ value: "metal", label: "metal" }, { value: "dark", label: "koyu" }, { value: "wood", label: "ahşap" }] },
    { key: "peak", label: "Tepe ışığı düzeyi (peak)", default: 1, min: -10, max: 3, step: 1, unit: "VU", toCode: (x) => (x === 1 ? null : `{${x}}`) },
    { key: "peakHold", label: "Tepe bekleme (peakHold; 0 = basılana dek)", default: 1200, min: 0, max: 4000, step: 200, unit: "ms", toCode: (x) => (x === 1200 ? null : `{${x}}`) },
    { key: "needle", label: "İbre (needle)", default: "vu", options: [{ value: "vu", label: "VU" }, { value: "spring", label: "yay" }, { value: "none", label: "atlar" }], toCode: { vu: null } },
    { key: "size", label: "Genişlik (size)", default: 220, min: 140, max: 320, step: 10, unit: "px", toCode: (x) => (x === 220 ? null : `{${x}}`) },
    { key: "caption", label: "Kadran yazısı (caption)", default: "VU", options: [{ value: "VU", label: "VU" }, { value: "dB", label: "dB" }, { value: "none", label: "yok" }],
      toCode: { VU: null, dB: '"dB"', none: "{false}" }, toProp: (x) => (x === "none" ? false : x) },
    { key: "lights", label: "Tepe ışıkları (parts.lights)", default: true, prop: "parts", toCode: (x) => (x ? null : "{{ lights: false }}"), toProp: (x) => ({ lights: !!x }) },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "label", label: "Erişilebilir ad (label)", default: "Ana çıkış", kind: "text" },
  ],
});

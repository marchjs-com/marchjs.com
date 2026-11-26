import { definePlayground } from "../../spec.ts";

interface Values { input: string; level: number; mode: string; look: string; trigger: boolean; timebase: number; persistence: number; grid: string;
  color: string; lineWidth: number; glow: number; gain: number; height: number; motion: boolean; label: string; idleText: string }

export default definePlayground<Values>({
  options: [
    // the stage's input: a number (a tone whose loudness is `level`: live at once, no click, no permission), the
    // synthesized loop (starts from its button), or nothing (the idle screen)
    { key: "input", label: "Kaynak (source)", default: "tone", options: [{ value: "tone", label: "ton (sayı)" }, { value: "demo", label: "demo müzik" }, { value: "none", label: "yok" }],
      prop: "source", toCode: { demo: "{song}", tone: "{() => $level / 100}", none: null }, toProp: (x) => (x === "none" ? undefined : x === "tone" ? 0.6 : "demo") },
    { key: "level", label: "Ses (sayı kaynağında)", default: 60, min: 0, max: 100, step: 5, unit: "%", visibleWhen: (v) => v.input === "tone", prop: false },
    { key: "mode", label: "Kip (mode)", default: "wave", options: [{ value: "wave", label: "dalga" }, { value: "xy", label: "XY (Lissajous)" }] },
    { key: "look", label: "Görünüm (look)", default: "modern", options: [{ value: "modern", label: "modern" }, { value: "crt", label: "retro CRT" }] },
    { key: "trigger", label: "Tetik (trigger)", default: true, visibleWhen: (v) => v.mode === "wave" && v.input !== "none", toCode: (x) => (x ? null : "{false}") },
    { key: "timebase", label: "Zaman ekseni (timebase)", default: 20, min: 5, max: 40, step: 1, unit: "ms", visibleWhen: (v) => v.mode === "wave" && v.input !== "none", toCode: (x) => (x === 20 ? null : `{${x}}`) },
    { key: "persistence", label: "Fosfor izi (persistence)", default: 55, min: 0, max: 95, step: 5, unit: "%", visibleWhen: (v) => v.input !== "none" && v.motion,
      toCode: (x) => (x === 55 ? null : `{${Number(x) / 100}}`), toProp: (x) => Number(x) / 100 },
    { key: "grid", label: "Izgara (grid)", default: "on", options: [{ value: "on", label: "10 × 8" }, { value: "fine", label: "16 × 10" }, { value: "off", label: "yok" }],
      toCode: { on: null, off: "{false}", fine: "{{ x: 16, y: 10 }}" }, toProp: (x) => (x === "off" ? false : x === "fine" ? { x: 16, y: 10 } : true) },
    { key: "color", label: "Renk (color)", default: "", options: [{ value: "", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }, { value: "success", label: "yeşil" }],
      toProp: (x) => (x || undefined), toCode: (x) => (x ? JSON.stringify(x) : null) },
    { key: "lineWidth", label: "Kalınlık (lineWidth)", default: 2, min: 1, max: 6, step: 0.5, unit: "px", toCode: (x) => (x === 2 ? null : `{${x}}`) },
    { key: "glow", label: "Parıltı (glow; 0 = yok)", default: 8, min: 0, max: 24, step: 2, unit: "px", visibleWhen: (v) => v.input !== "none",
      toCode: (x) => (x === 8 ? null : x ? `{${x}}` : "{false}"), toProp: (x) => (x ? x : false) },
    { key: "gain", label: "Kazanç (gain)", default: 100, min: 25, max: 400, step: 25, unit: "%", visibleWhen: (v) => v.input !== "none",
      toCode: (x) => (x === 100 ? null : `{${Number(x) / 100}}`), toProp: (x) => Number(x) / 100 },
    { key: "height", label: "Yükseklik (height)", default: 180, min: 100, max: 320, step: 20, unit: "px", toCode: (x) => (x === 180 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "label", label: "Erişilebilir ad (label)", default: "Osiloskop", kind: "text" },
    { key: "idleText", label: "Boşta metni (idleText; boş = yok)", default: "Sinyal yok", kind: "text", visibleWhen: (v) => v.input === "none",
      toCode: (x) => (x ? JSON.stringify(x) : "{false}"), toProp: (x) => (x ? x : false) },
  ],
});

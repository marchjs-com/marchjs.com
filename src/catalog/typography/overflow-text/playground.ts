import { definePlayground } from "../../spec.ts";

interface Values { text: string; duplicate: boolean; trigger: string; mode: string; speed: number; disabled: boolean; ticker: boolean; separator: string }

// the strip options: on the showcase while its Marquee strips show; in MarchIDE (no ticker option there) while the raw
// OverflowText loops, the only mode where copies and a separator are drawn
const strip = (v: Values): boolean => (v.ticker === undefined ? v.mode === "loop" : v.ticker)

export default definePlayground<Values>({
  options: [
    // text (or children) is required: the raw component in MarchIDE gets this default, so it always has something to scroll
    { key: "text", label: "Metin (text)", default: "Haftalık etkinlik özeti: Kadıköy koşu grubu, Moda sahili buluşması ve akşam yemeği", kind: "text" },
    { key: "trigger", label: "Tetik", default: "hover", options: ["hover", "focus", "always", "visible"] },
    { key: "mode", label: "Mod", default: "bounce", options: ["bounce", "loop", "once"] },
    { key: "speed", label: "Hız", default: 40, min: 10, max: 120, step: 10, unit: "px/s" },
    { key: "disabled", label: "Kaydırma kapalı", default: false },
    // a demo option (the Marquee strips under the rows)
    { key: "ticker", label: "Marquee şeridi", default: true, prop: false },
    { key: "duplicate", label: "Kısa içeriği çoğalt (sonsuz şerit)", default: true, toCode: { false: "{false}" }, visibleWhen: strip },
    { key: "separator", label: "Şerit ayracı", default: "star", kind: "segmented", options: [{ value: "star", label: "✦" }, { value: "icon", label: "kendi ikonum" }, { value: "off", label: "yok" }], toCode: { star: '"✦"', icon: '"♥"', off: "{false}" }, visibleWhen: strip },
  ],
});

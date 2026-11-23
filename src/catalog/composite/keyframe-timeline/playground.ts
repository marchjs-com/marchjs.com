import { definePlayground } from "../../spec.ts";
import type { TimelineModel } from "march/composite";

interface Values { scene: string; snap: number; loop: boolean; stage: boolean; readonly: boolean; transport: string; inspector: boolean; curves: boolean; labels: boolean }

// the three scenes (the card draws them; in MarchIDE the scene is the raw component's value, as a JSON literal)
export const SCENES: Record<string, TimelineModel> = {
  intro: { duration: 2400, tracks: [
    { id: "l-y", target: "HADİ", prop: "y", keys: [{ at: 0, value: -60 }, { at: 700, value: 0, easing: "back" }] },
    { id: "l-o", target: "HADİ", prop: "opacity", keys: [{ at: 0, value: 0 }, { at: 500, value: 1, easing: "out" }] },
    { id: "t-x", target: "Başlık", prop: "x", keys: [{ at: 300, value: -120 }, { at: 1100, value: 0, easing: "expo" }] },
    { id: "t-o", target: "Başlık", prop: "opacity", keys: [{ at: 300, value: 0 }, { at: 900, value: 1 }] },
    { id: "b-s", target: "Başla", prop: "scale", keys: [{ at: 1100, value: 0 }, { at: 1600, value: 1.15, easing: "out" }, { at: 1900, value: 1, easing: "in-out" }] },
    { id: "b-r", target: "Başla", prop: "rotate", keys: [{ at: 1100, value: -20 }, { at: 1800, value: 0, easing: "back" }] },
  ] },
  bounce: { duration: 1600, tracks: [
    { id: "y", target: "Top", prop: "y", keys: [{ at: 0, value: -70 }, { at: 500, value: 30, easing: "in" }, { at: 900, value: -30, easing: "out" }, { at: 1250, value: 30, easing: "in" }, { at: 1600, value: 0, easing: "out" }] },
    { id: "s", target: "Top", prop: "scale", keys: [{ at: 450, value: 1 }, { at: 520, value: 0.8 }, { at: 620, value: 1, easing: "out" }, { at: 1200, value: 1 }, { at: 1270, value: 0.85 }, { at: 1360, value: 1, easing: "out" }] },
  ] },
  orbit: { duration: 3000, tracks: [
    { id: "r", target: "Uydu", prop: "rotate", keys: [{ at: 0, value: 0 }, { at: 3000, value: 360, easing: "linear" }] },
    { id: "x", target: "Uydu", prop: "x", keys: [{ at: 0, value: -90 }, { at: 1500, value: 90, easing: "in-out" }, { at: 3000, value: -90, easing: "in-out" }] },
    { id: "g", target: "Gezegen", prop: "scale", keys: [{ at: 0, value: 1 }, { at: 1500, value: 1.2, easing: "in-out" }, { at: 3000, value: 1, easing: "in-out" }] },
  ] },
}
// the card's own texts (demo.tsx)
const OWN = { hint: "Bir kareye dokun: zamanı, değeri ve eğrisi burada açılır.", time: "Ne zaman (ms)", value: "Kaç" };

export default definePlayground<Values>({
  options: [
    { key: "scene", label: "Sahne", default: "intro", kind: "segmented", options: [{ value: "intro", label: "giriş" }, { value: "bounce", label: "zıplama" }, { value: "orbit", label: "yörünge" }],
      prop: "value", toCode: (x) => `{${JSON.stringify(SCENES[String(x)] ?? SCENES["intro"])}}` },
    { key: "snap", label: "Yaslanma", default: 50, kind: "segmented", options: [{ value: 0, label: "yok" }, { value: 10, label: "10 ms" }, { value: 50, label: "50 ms" }, { value: 100, label: "100 ms" }] },
    { key: "loop", label: "Döngü", default: true },
    { key: "stage", label: "Önizleme sahnesi", default: true },
    { key: "transport", label: "Oynatma çubuğu", default: "all", kind: "segmented", options: [{ value: "all", label: "tümü" }, { value: "short", label: "oynat + süre" }, { value: "none", label: "yok" }],
      toCode: { all: null, short: `{["play","time"]}`, none: "{false}" } },
    { key: "curves", label: "İzlerde değer eğrisi", default: true },
    { key: "inspector", label: "Kare denetçisi", default: true },
    { key: "labels", label: "Kendi metinlerim (denetçi)", default: false, visibleWhen: (v) => v.inspector, toCode: { true: `{${JSON.stringify(OWN)}}`, false: null } },
    { key: "readonly", label: "Salt okunur", default: false },
  ],
});

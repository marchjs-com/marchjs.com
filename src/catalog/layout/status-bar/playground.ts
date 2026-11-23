import { definePlayground } from "../../spec.ts";
import { el } from "../../playground-el.ts";
import { gitBranch, alertTriangle } from "march/icons";

// MarchIDE: the bare StatusBar's items (required) for the chosen state
const STATES: Record<string, [string, string]> = { saved: ["Kaydedildi", "success"], busy: ["Kaydediliyor…", "busy"], error: ["Kaydedilemedi", "danger"] };
const items = (state: string) => [
  { id: "branch", icon: gitBranch, text: "main", priority: 5 },
  { id: "problems", icon: alertTriangle, text: state === "error" ? "1 hata" : "0 hata", tone: state === "error" ? "danger" : "neutral", priority: 3 },
  { id: "pos", side: "end", text: "Sa 12, Sü 8", priority: 4 },
  { id: "save", side: "end", text: STATES[state]?.[0] ?? "", tone: STATES[state]?.[1], live: true, priority: 9 },
];

interface Values { state: string; width: number; dot: string; pulse: boolean }

export default definePlayground<Values>({
  options: [
    { key: "state", label: "Durum", default: "saved", options: [{ value: "saved", label: "kaydedildi" }, { value: "busy", label: "kaydediliyor" }, { value: "error", label: "hata" }], prop: "items", toProp: (x) => items(String(x)), toCode: () => "{items}" },
    { key: "width", label: "Genişlik", default: 640, min: 220, max: 760, step: 20, unit: "px", prop: false },
    { key: "dot", label: "Durum noktası", default: "dot", options: [{ value: "dot", label: "nokta" }, { value: "own", label: "kendi işaretim" }, { value: "off", label: "yok" }], toProp: (x) => (x === "off" ? false : x === "own" ? () => el("b", "", "◆") : true), toCode: { dot: null, own: "{(tone) => <b>◆</b>}", off: "{false}" } },
    { key: "pulse", label: "Meşgulken nabız", default: true, visibleWhen: (v) => v.state === "busy" && v.dot !== "off" },
  ],
});

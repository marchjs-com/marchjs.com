import { definePlayground } from "../../spec.ts";

interface Values { duration: number; value: number; seekable: boolean; minor: boolean; major: string; head: string; color: string; format: string }

const clock = (ms: number): string => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;

export default definePlayground<Values>({
  options: [
    { key: "duration", label: "Süre", default: 4000, min: 1000, max: 20000, step: 1000, unit: "ms" },
    { key: "value", label: "Oynatma başının yeri (value)", default: 1200, min: 0, max: 20000, step: 100, unit: "ms" },
    { key: "minor", label: "Ara tikler", default: true },
    { key: "major", label: "Etiket aralığı", default: "auto", options: [{ value: "auto", label: "otomatik" }, { value: "1000", label: "1 sn" }, { value: "2000", label: "2 sn" }], toCode: { auto: null, "1000": "{1000}", "2000": "{2000}" } },
    { key: "head", label: "Oynatma başı", default: "on", options: [{ value: "on", label: "var" }, { value: "own", label: "kendi tutamacım" }, { value: "off", label: "yok" }], toCode: { on: null, own: "{<span aria-hidden=\"true\">▼</span>}", off: "{false}" } },
    { key: "color", label: "Renk", default: "primary", options: [{ value: "primary", label: "ana renk" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }], prop: "m:color", toCode: { primary: null } },
    { key: "format", label: "Etiket biçimi", default: "seconds", options: [{ value: "seconds", label: "1.5s" }, { value: "clock", label: "0:01" }],
      // the code's function is no value MarchIDE can parse: the same function, given as the prop
      toProp: (x) => (x === "clock" ? clock : undefined), toCode: { seconds: null, clock: "{(ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, \"0\")}`}" } },
    // the showcase card's own: a draggable ruler (in MarchIDE: onSeek in Events or the code)
    { key: "seekable", label: "Sürüklenebilir (onSeek)", default: true, prop: false },
  ],
});

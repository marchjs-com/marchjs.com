import { definePlayground } from "../../spec.ts";

interface Values { format: string; step: number; roll: boolean; duration: number; value: number }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    // value is required: the bare CountRoll in MarchIDE shows this number
    { key: "value", label: "Değer (value)", default: 1234, min: 0, max: 100000, step: 1, toCode: (x) => `{${String(x)}}` },
    { key: "format", label: "Biçim", default: "full", options: [{ value: "compact", label: "kısa (1,2 B)" }, { value: "full", label: "tam (1.234)" }, { value: "own", label: "kendi metnim (1234 beğeni)" }],
      toCode: { compact: { format: '"compact"', formatter: null }, full: { format: null, formatter: null }, own: { format: null, formatter: "{(n) => `${n} beğeni`}" } }, toProps: (x) => (x === "compact" ? { format: "compact" } : x === "own" ? { format: "full", formatter: (n: number) => `${n} beğeni` } : { format: "full" }) },
    { key: "step", label: "Adım", default: 1, options: [{ value: 1, label: "+1" }, { value: 9, label: "+9" }, { value: 250, label: "+250" }], prop: false },
    { key: "roll", label: "Yuvarlanma", default: true },
    { key: "duration", label: "Yuvarlanma süresi", default: 320, options: [{ value: 160, label: "hızlı" }, { value: 320, label: "normal" }, { value: 900, label: "yavaş" }], visibleWhen: (v) => v.roll },
  ],
});

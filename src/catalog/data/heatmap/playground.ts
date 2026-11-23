import { definePlayground } from "../../spec.ts";

interface Values { mode: string; weeks: number; levels: number; cell: number; animate: string; title: string }

export default definePlayground<Values>({
  options: [
    // grid (day × hour) or calendar (weeks × weekdays); the showcase card swaps its data with the mode
    { key: "mode", label: "Görünüm", default: "grid", options: [{ value: "grid", label: "gün × saat" }, { value: "calendar", label: "takvim (calendar)" }], prop: false },
    { key: "weeks", label: "Hafta sayısı (calendar)", default: 16, min: 4, max: 26, step: 1, visibleWhen: (v) => v.mode === "calendar", prop: false },
    { key: "levels", label: "Renk düzeyi (levels)", default: 5, min: 2, max: 9, step: 1, toCode: (v) => (v === 5 ? null : `{${v}}`) },
    { key: "cell", label: "Hücre boyu (cell)", default: 0, min: 0, max: 32, step: 2, unit: "px", toProp: (v) => (v ? v : undefined), toCode: (v) => (v ? `{${v}}` : null) },
    { key: "animate", label: "Veri değişince (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "off", label: "yerinde" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v), toCode: { spring: "", off: null } },
    { key: "title", label: "Başlık (title)", default: "Kafe yoğunluğu", kind: "text" },
  ],
});

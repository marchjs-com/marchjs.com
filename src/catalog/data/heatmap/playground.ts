import { definePlayground } from "../../spec.ts";

interface Values { mode: string; weeks: number; levels: number; cellSize: number; gap: number; radius: number; dayLabels: string; months: boolean; levelLegend: string; firstDay: string; animate: string; title: string }

const cal = (v: Values) => v.mode !== "grid";

export default definePlayground<Values>({
  options: [
    // grid (day × hour), calendar (the last N weeks) or a year (from / to); the showcase card swaps its data with the mode
    { key: "mode", label: "Görünüm", default: "year", options: [{ value: "grid", label: "gün × saat" }, { value: "calendar", label: "takvim (calendar)" }, { value: "year", label: "yıl (from / to)" }], prop: false },
    { key: "weeks", label: "Hafta sayısı (calendar)", default: 16, min: 4, max: 26, step: 1, visibleWhen: (v) => v.mode === "calendar", prop: false },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "çapraz dalga" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 25 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 25 }}" } },
    { key: "levels", label: "Renk düzeyi (levels)", default: 5, min: 2, max: 5, step: 1, toCode: (v) => (v === 5 ? null : `{${v}}`) },
    { key: "cellSize", label: "Hücre boyu (cellSize)", default: 0, min: 0, max: 30, step: 1, unit: "px", toProp: (v) => (v ? v : undefined), toCode: (v) => (v ? `{${v}}` : null) },
    { key: "gap", label: "Hücre arası (gap)", default: 2, min: 0, max: 6, step: 1, unit: "px", toCode: (v) => (v === 2 ? null : `{${v}}`) },
    { key: "radius", label: "Köşe (radius)", default: 2, min: 0, max: 8, step: 1, unit: "px", toCode: (v) => (v === 2 ? null : `{${v}}`) },
    { key: "dayLabels", label: "Gün adları (dayLabels)", default: "mwf", visibleWhen: cal, options: [{ value: "mwf", label: "Pzt · Çar · Cum" }, { value: "all", label: "hepsi" }, { value: "none", label: "yok" }],
      toProp: (v) => (v === "all" ? "all" : v !== "none"), toCode: { mwf: null, all: "\"all\"", none: "{false}" } },
    { key: "months", label: "Ay adları (months)", default: true, visibleWhen: cal, toCode: { true: null, false: "{false}" } },
    { key: "levelLegend", label: "Az → çok açıklaması (levelLegend)", default: "auto", options: [{ value: "auto", label: "hazır" }, { value: "own", label: "Az / Çok" }, { value: "off", label: "yok" }],
      toProp: (v) => (v === "off" ? false : v === "own" ? { less: "Az", more: "Çok" } : true), toCode: { auto: null, off: "{false}", own: "{{ less: \"Az\", more: \"Çok\" }}" } },
    { key: "firstDay", label: "Haftanın ilk günü (firstDay)", default: "locale", visibleWhen: cal, options: [{ value: "locale", label: "yerel ayar" }, { value: "1", label: "Pazartesi" }, { value: "0", label: "Pazar" }],
      toProp: (v) => (v === "locale" ? undefined : Number(v)), toCode: (v) => (v === "locale" ? null : `{${v}}`) },
    { key: "title", label: "Başlık (title)", default: "Okuma alışkanlığı", kind: "text" },
  ],
});

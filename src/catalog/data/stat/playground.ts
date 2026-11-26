import { definePlayground } from "../../spec.ts";

interface Values { label: string; format: string; delta: string; invert: boolean; hint: string; spark: boolean; icon: boolean; animate: string }

export default definePlayground<Values>({
  options: [
    { key: "label", label: "Etiket (label)", default: "Aylık gelir", kind: "text" },
    { key: "format", label: "Değer biçimi (format)", default: "money", options: [{ value: "number", label: "sayı" }, { value: "money", label: "para (TRY)" }, { value: "compact", label: "kısa (1,2 B)" }],
      toProp: (v) => (v === "money" ? ["money", "TRY"] : v), toCode: { number: null, money: "{[\"money\", \"TRY\"]}" } },
    // where the delta comes from: given as a fraction, computed from `previous`, or none
    { key: "delta", label: "Değişim", default: "previous", options: [{ value: "previous", label: "önceki değerden (previous)" }, { value: "delta", label: "doğrudan (delta)" }, { value: "none", label: "yok" }], prop: false },
    { key: "invert", label: "Azalma iyi (invert)", default: false },
    { key: "hint", label: "Değişimden sonra (hint)", default: "geçen aya göre", kind: "text", toCode: (v) => (v ? JSON.stringify(v) : null) },
    { key: "spark", label: "Eğilim çizgisi (spark)", default: true, prop: false },
    { key: "icon", label: "İkon (icon)", default: true, prop: false },
    // the number counts, the arrow turns, the sparkline morphs; "yavaş" makes the count easy to follow, "girişsiz"
    // shows the first value at once (only changes count)
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "slow", label: "yavaş" }, { value: "noenter", label: "girişsiz" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "slow" ? { easing: "out", duration: 1400 } : v === "noenter" ? { enter: false } : v),
      toCode: { spring: null, off: "{false}", slow: "{{ easing: \"out\", duration: 1400 }}", noenter: "{{ enter: false }}" } },
  ],
});

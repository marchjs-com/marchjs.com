import { definePlayground } from "../../spec.ts";

interface Values { label: string; format: string; delta: string; invert: boolean; hint: string; spark: boolean; icon: boolean }

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
  ],
});

import { definePlayground } from "../../spec.ts";

// the Intl formats of the choices, as JSON: the raw component in MarchIDE receives them as they are
const FORMATS: Record<string, Intl.NumberFormatOptions> = { currency: { style: "currency", currency: "EUR", maximumFractionDigits: 0 }, percent: { style: "percent", maximumFractionDigits: 1 }, compact: { notation: "compact", maximumFractionDigits: 1 } };

interface Values { mode: string; format: string; easing: string; value: number }

export default definePlayground<Values>({
  options: [
    { key: "mode", label: "Tür", default: "count", options: [{ value: "count", label: "sayma" }, { value: "roll", label: "sayaç (odometre)" }, { value: "none", label: "hareketsiz" }] },
    { key: "easing", label: "Sayma eğrisi", default: "expo", options: [{ value: "expo", label: "hızlı başla" }, { value: "linear", label: "düz" }, { value: "spring", label: "yay" }, { value: "bounce", label: "sekme" }], visibleWhen: (v) => v.mode === "count" },
    { key: "format", label: "Biçim", default: "number", options: [{ value: "number", label: "sayı" }, { value: "currency", label: "para" }, { value: "percent", label: "yüzde" }, { value: "compact", label: "kısa" }], toCode: (x) => (FORMATS[String(x)] ? `{${JSON.stringify(FORMATS[String(x)])}}` : null) },
    { key: "value", label: "Değer", default: 12840, min: 0, max: 99999, step: 137 },
  ],
});

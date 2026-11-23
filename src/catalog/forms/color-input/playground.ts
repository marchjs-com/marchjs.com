import { definePlayground } from "../../spec.ts";

// each option writes a real prop, so the raw ColorInput in MarchIDE follows it: start → value (the starting colour),
// swatch / text → the two parts (`false` written as {false}; the text option hides while the swatch is off, so one part
// always stays)
export default definePlayground<{ start: string; swatch: boolean; text: boolean }>({
  options: [{ key: "start", label: "Başlangıç rengi", default: "#f2801f", prop: "value", options: [{ value: "#f2801f", label: "Heyecan" }, { value: "#1d9ad6", label: "Aktivite" }, { value: "#78be3a", label: "Dostluk" }, { value: "#a3338c", label: "İletişim" }] },
    { key: "swatch", label: "Renk kutusu", default: true, toCode: { true: null, false: "{false}" } },
    { key: "text", label: "#RRGGBB metin alanı", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.swatch !== false }],
});

import { definePlayground } from "../../spec.ts";

interface Values { value: number; max: number; size: string; readonly: boolean; color: string; mark: string; animate: boolean }

// every option is a real prop, so the raw Rating in MarchIDE follows it: value (the stars filled; a fraction fills part
// of a mark), mark → icon (MarchIDE shows an icon picker for it; "" = the star, "number" is the card's own drawing),
// animate={false} written as {false}
export default definePlayground<Values>({
  options: [
    { key: "value", label: "Puan", default: 3.5, min: 0, max: 10, step: 0.5 },
    { key: "max", label: "Yıldız", default: 5, kind: "segmented", options: [3, 5, 10] },
    { key: "size", label: "Boyut", default: "lg", kind: "segmented", options: ["sm", "md", "lg"] },
    { key: "readonly", label: "Salt okunur", default: false },
    { key: "mark", label: "İşaret", default: "", prop: "icon", options: [{ value: "", label: "yıldız" }, { value: "heart", label: "kalp" }, { value: "number", label: "sayı (kendi çizimim)" }] },
    { key: "animate", label: "Hareket (büyüme, geçiş)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "color", label: "Renk", default: "primary", kind: "chips", options: [{ value: "primary", label: "tema" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }, { value: "brand-pink", label: "pembe" }] , prop: "m:color"},
  ],
});

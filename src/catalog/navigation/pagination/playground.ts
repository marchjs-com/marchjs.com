import { definePlayground } from "../../spec.ts";

// every option writes a real prop of the raw component in MarchIDE: "cursor" is the simple variant without a page
// count, the own Previous / Next texts and the gap mark are written as code, a default-on text off as {false}

interface Values { variant: string; pages: number; siblings: number; controls: boolean; prev: string; next: string; gap: string; color: string; info: boolean; status: boolean; sizes: readonly number[] | "" }

export default definePlayground<Values>({
  options: [
    { key: "variant", label: "Görünüm", default: "numbers", options: [{ value: "numbers", label: "numaralı" }, { value: "simple", label: "yalın (önceki / sonraki)" }, { value: "cursor", label: "yalın, sayfa sayısı bilinmeden" }], toCode: { cursor: '"simple"' } },
    { key: "pages", label: "Sayfa sayısı", default: 20, min: 1, max: 60, visibleWhen: (v) => v.variant !== "cursor" },
    { key: "siblings", label: "Komşu sayfa", default: 1, options: [0, 1, 2], visibleWhen: (v) => v.variant === "numbers" },
    { key: "controls", label: "Önceki / Sonraki", default: true, toCode: { false: "{false}" } },
    // the buttons' own text (empty: the arrow icon)
    { key: "prev", label: "Önceki metni", default: "", kind: "text", visibleWhen: (v) => v.controls },
    { key: "next", label: "Sonraki metni", default: "", kind: "text", visibleWhen: (v) => v.controls },
    { key: "gap", label: "Boşluk işareti", default: "dots", options: [{ value: "dots", label: "üç nokta" }, { value: "own", label: "kendi işaretim (·)" }, { value: "off", label: "yok" }], toCode: { dots: null, own: '"·"', off: "{false}" }, visibleWhen: (v) => v.variant === "numbers" },
    { key: "color", label: "Etkin sayfa rengi", default: "", options: [{ value: "", label: "nötr" }, { value: "primary", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }], visibleWhen: (v) => v.variant === "numbers", prop: "m:color" },
    { key: "info", label: "Aralık metni (21–40 / 200)", default: true, toCode: { false: "{false}" }, visibleWhen: (v) => v.variant === "simple" },
    { key: "status", label: "Sayfa metni (Sayfa 2 / 20)", default: true, toCode: { false: "{false}" }, visibleWhen: (v) => v.variant === "simple" },
    { key: "sizes", label: "Sayfa boyutu seçimi", default: [10, 20, 50], options: [{ value: "", label: "yok" }, { value: [10, 20, 50], label: "10 · 20 · 50" }, { value: [5, 25, 100], label: "5 · 25 · 100" }], visibleWhen: (v) => v.variant === "simple" },
  ],
});

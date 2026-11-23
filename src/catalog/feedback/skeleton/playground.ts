import { definePlayground } from "../../spec.ts";

interface Values { label: string; mode: string; lines: number; height: string; colors: string; shimmer: boolean; shortLast: boolean }

export default definePlayground<Values>({
  options: [
    // the card draws a whole layout per mode; the component itself (MarchIDE) is lines or one block (block)
    { key: "mode", label: "Biçim", default: "card", kind: "cards", options: [{ value: "card", label: "kart" }, { value: "lines", label: "satırlar" }, { value: "block", label: "blok" }, { value: "profile", label: "profil (daire + satırlar)" }],
      prop: "block", toCode: { block: "{true}", card: null, lines: null, profile: null } },
    { key: "lines", label: "Satır", default: 3, min: 1, max: 6, step: 1, visibleWhen: (v) => v.mode !== "block" },
    { key: "height", label: "Blok / daire boyutu", default: "md", kind: "segmented", options: ["sm", "md", "lg"], visibleWhen: (v) => v.mode !== "lines" },
    { key: "colors", label: "Parıltı", default: "theme", kind: "segmented", options: [{ value: "theme", label: "tema" }, { value: "brand", label: "marka" }, { value: "single", label: "tek renk" }], toCode: { theme: null } },
    { key: "shimmer", label: "Parıltı hareketi", default: true, toCode: { false: "{false}" } },
    { key: "shortLast", label: "Son satır kısa", default: true, toCode: { false: "{false}" }, visibleWhen: (v) => v.mode !== "block" },
    { key: "label", label: "Erişilebilir ad (label)", default: "Yükleniyor", kind: "text", visibleWhen: (v) => v.mode !== "block" },
  ],
});

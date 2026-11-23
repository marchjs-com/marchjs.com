import { definePlayground } from "../../spec.ts";

type V = { length: number; pattern: string; colors: string; font: string; size: string; variant: string; groups: boolean; mask: boolean; separator: string }

export default definePlayground<V>({
  options: [
    { key: "length", label: "Uzunluk", default: 6, min: 3, max: 12 },
    { key: "pattern", label: "Karakter", default: "numeric", options: ["numeric", "alpha", "alphanumeric"] },
    { key: "colors", label: "Renkler", default: "brand", options: ["brand", "palette", "single"] },
    // a masked code shows dots: the font has no effect then
    { key: "font", label: "Yazı tipi", default: "display", options: ["display", "mono", "body"], visibleWhen: (v) => !v.mask },
    { key: "size", label: "Boyut", default: "md", options: ["sm", "md", "lg"] },
    { key: "variant", label: "Biçim", default: "outline", options: ["outline", "filled", "underline"] },
    // two groups need at least four boxes; written as the boxes per group (half): `groups={3}` for six boxes, a
    // literal the preview takes
    { key: "groups", label: "Gruplu", default: true, visibleWhen: (v) => v.length >= 4, toCode: (on, v) => (on ? `{${Math.ceil(v.length / 2)}}` : null) },
    { key: "separator", label: "Grup ayracı", default: "dash", options: [{ value: "dash", label: "çizgi" }, { value: "dot", label: "nokta (kendi işaretim)" }, { value: "off", label: "yok" }], toCode: { dash: null, dot: '"•"', off: "{false}" }, visibleWhen: (v) => v.groups && v.length >= 4 },
    { key: "mask", label: "Gizli (PIN)", default: false },
  ],
});

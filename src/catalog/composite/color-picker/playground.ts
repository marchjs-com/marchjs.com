import { definePlayground } from "../../spec.ts";

interface Values { format: string; alpha: boolean; palettes: boolean; contrast: boolean; eyedropper: boolean; readonly: boolean; preview: boolean; formats: boolean; input: boolean }

export default definePlayground<Values>({
  options: [
    { key: "format", label: "Biçim", default: "hex", kind: "segmented", options: [{ value: "hex", label: "HEX" }, { value: "rgb", label: "RGB" }, { value: "hsl", label: "HSL" }] },
    { key: "alpha", label: "Saydamlık", default: true },
    // on: the default palettes (the prop left out); a bare true is no list of palettes
    { key: "palettes", label: "Paletler", default: true, toCode: { true: null, false: "{false}" } },
    { key: "contrast", label: "Kontrast", default: true },
    // only where the browser has the EyeDropper API (the picker draws no button elsewhere)
    { key: "eyedropper", label: "Göz damlası", default: true, visibleWhen: () => "EyeDropper" in globalThis },
    { key: "preview", label: "Eski / yeni önizleme", default: true },
    { key: "formats", label: "Biçim değiştirici", default: true },
    { key: "input", label: "Değer alanı", default: true },
    { key: "readonly", label: "Salt okunur", default: false },
  ],
});

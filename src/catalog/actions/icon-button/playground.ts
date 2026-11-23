import { definePlayground } from "../../spec.ts";

interface Values { label: string; icon: string; size: string; variant: string; shape: string; pressed: boolean; inverse: boolean; color: string }

export default definePlayground<Values>({
  options: [
    // label is required (the accessible name): the raw component in MarchIDE gets these defaults, so it never throws
    { key: "label", label: "Ad (label)", default: "IconButton", kind: "text" },
    { key: "icon", label: "İkon", default: "heart", options: ["heart", "star", "bell", "trash", "globe"], toCode: (x) => `{${String(x)}}` },
    { key: "size", label: "Boyut", default: "md", options: ["xs", "sm", "md", "lg"] },
    { key: "variant", label: "Varyant", default: "", options: [{ value: "", label: "düz" }, { value: "danger", label: "tehlike tonu" }, { value: "solid", label: "dolu" }, { value: "raised", label: "yükseltilmiş" }] },
    { key: "shape", label: "Biçim", default: "", options: [{ value: "", label: "köşeli" }, { value: "round", label: "yuvarlak" }] },
    { key: "pressed", label: "Basılı (aç/kapa)", default: false },
    { key: "inverse", label: "Koyu zemin üstünde", default: false },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
  ],
});

import { definePlayground } from "../../spec.ts";

interface Values { value: number; digits: number; decimals: number; variant: string; size: string; unit: string; frame: boolean; motion: boolean; color: string; label: string }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    // value is required: the bare Odometer in MarchIDE shows this number
    { key: "value", label: "Değer (value)", default: 48213.6, min: 0, max: 999999, step: 0.1, toCode: (x) => `{${String(x)}}` },
    { key: "digits", label: "Tam sayı çarkı (digits)", default: 6, min: 3, max: 9, step: 1, toCode: (x) => (x === 6 ? null : `{${x}}`) },
    { key: "decimals", label: "Kesir çarkı (decimals)", default: 1, options: [{ value: 0, label: "yok" }, { value: 1, label: "1" }, { value: 2, label: "2" }], toCode: (x) => (x === 0 ? null : `{${x}}`),
      // written also as 0: "yok" takes the fraction drum off an instance that has one (its code leaves the prop out)
      toProp: (x) => Number(x) },
    { key: "variant", label: "Görünüm (variant)", default: "mechanical", options: [{ value: "mechanical", label: "mekanik" }, { value: "digital", label: "dijital" }, { value: "flip", label: "yaprak saat" }], toCode: { mechanical: null } },
    { key: "size", label: "Boyut (size)", default: "md", options: [{ value: "sm", label: "küçük" }, { value: "md", label: "orta" }, { value: "lg", label: "büyük" }], toCode: { md: null } },
    { key: "unit", label: "Birim (unit)", default: "km", kind: "text", toCode: (x) => (x ? JSON.stringify(x) : null), toProp: (x) => (x || false) },
    { key: "color", label: "Renk (color)", default: "", options: [{ value: "", label: "vurgu" }, { value: "success", label: "yeşil" }, { value: "brand-blue", label: "mavi" }], visibleWhen: (v) => v.variant === "digital",
      toProp: (x) => (x || undefined), toCode: (x) => (x ? JSON.stringify(x) : null) },
    { key: "frame", label: "Çerçeve (frame)", default: true, visibleWhen: (v) => v.variant !== "flip" },
    { key: "motion", label: "Hareket (motion)", default: true },
    { key: "label", label: "Erişilebilir ad (label)", default: "Kilometre", kind: "text" },
  ],
});

import { definePlayground } from "../../spec.ts";

interface Values { value: number; charging: boolean; variant: string; segments: number; orientation: string; readout: string; color: string; size: number; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    // value is required: the bare BatteryGauge in MarchIDE shows this charge
    { key: "value", label: "Şarj (value)", default: 64, min: 0, max: 100, step: 1, unit: "%", toCode: (x) => `{${x}}` },
    { key: "charging", label: "Şarj oluyor (charging)", default: false },
    { key: "variant", label: "Görünüm (variant)", default: "fill", options: [{ value: "fill", label: "dolgu" }, { value: "segments", label: "hücreler" }], toCode: { fill: null } },
    { key: "segments", label: "Hücre sayısı (segments)", default: 5, min: 2, max: 10, step: 1, visibleWhen: (v) => v.variant === "segments", toCode: (x) => (x === 5 ? null : `{${x}}`) },
    { key: "orientation", label: "Yön (orientation)", default: "horizontal", options: [{ value: "horizontal", label: "yatay" }, { value: "vertical", label: "dikey" }], toCode: { horizontal: null } },
    { key: "readout", label: "Yüzde (readout)", default: "inside", options: [{ value: "inside", label: "içinde" }, { value: "outside", label: "yanında" }, { value: "off", label: "yok" }],
      toCode: { inside: null, outside: '"outside"', off: "{false}" }, toProp: (x) => (x === "off" ? false : x) },
    { key: "color", label: "Renk (color)", default: "", options: [{ value: "", label: "duruma göre" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }],
      toCode: (x) => (x ? JSON.stringify(x) : null), toProp: (x) => (x || undefined) },
    { key: "size", label: "Uzunluk (size)", default: 120, min: 60, max: 220, step: 10, unit: "px", toCode: (x) => (x === 96 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true },
    { key: "label", label: "Erişilebilir ad (label)", default: "Pil", kind: "text" },
  ],
});

import { definePlayground } from "../../spec.ts";

interface Values { decimals: number; subDial: boolean; laps: boolean; color: string; size: number; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    { key: "decimals", label: "Saniye kesri (decimals)", default: 2, options: [{ value: 0, label: "yok" }, { value: 1, label: "1" }, { value: 2, label: "2" }, { value: 3, label: "3" }],
      toCode: (x) => (x === 2 ? null : `{${x}}`), toProp: (x) => Number(x) },
    { key: "subDial", label: "Dakika kadranı (subDial)", default: true, toCode: { true: null, false: "{false}" } },
    // the lap list is a part: parts={{ laps: false }}
    { key: "laps", label: "Tur listesi (parts.laps)", default: true, prop: "parts",
      toCode: { true: null, false: "{{ laps: false }}" }, toProp: (x) => (x ? undefined : { laps: false }) },
    { key: "color", label: "İbre rengi (color)", default: "danger", options: [{ value: "danger", label: "kırmızı" }, { value: "brand-blue", label: "mavi" }, { value: "success", label: "yeşil" }, { value: "brand-purple", label: "mor" }],
      toCode: { danger: null } },
    { key: "size", label: "Genişlik (size)", default: 240, min: 160, max: 320, step: 10, unit: "px", toCode: (x) => (x === 240 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true },
    { key: "label", label: "Erişilebilir ad (label)", default: "Kronometre", kind: "text" },
  ],
});

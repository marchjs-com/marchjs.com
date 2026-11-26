import { definePlayground } from "../../spec.ts";

interface Values { pitch: number; roll: number; range: number; sky: string; color: string; size: number; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    // pitch and roll are required: the bare AttitudeIndicator in MarchIDE shows this attitude
    { key: "pitch", label: "Yunuslama (pitch)", default: 8, min: -30, max: 30, step: 1, unit: "°", toCode: (x) => `{${x}}` },
    { key: "roll", label: "Yatış (roll)", default: -20, min: -60, max: 60, step: 1, unit: "°", toCode: (x) => `{${x}}` },
    { key: "range", label: "Merdiven ölçeği (range)", default: 40, min: 15, max: 60, step: 5, unit: "°", toCode: (x) => (x === 40 ? null : `{${x}}`) },
    { key: "sky", label: "Gök ve yer (colors)", default: "classic", prop: "colors", options: [{ value: "classic", label: "klasik" }, { value: "night", label: "gece" }, { value: "green", label: "yeşil" }],
      toCode: { classic: null, night: '{{ sky: "brand-purple", ground: "neutral" }}', green: '{{ sky: "brand-blue", ground: "brand-green" }}' },
      toProp: (x) => (x === "night" ? { sky: "brand-purple", ground: "neutral" } : x === "green" ? { sky: "brand-blue", ground: "brand-green" } : undefined) },
    { key: "color", label: "Uçak simgesi (color)", default: "warning", options: [{ value: "warning", label: "kehribar" }, { value: "danger", label: "kırmızı" }, { value: "brand-gold", label: "altın" }],
      toCode: { warning: null } },
    { key: "size", label: "Genişlik (size)", default: 220, min: 160, max: 320, step: 10, unit: "px", toCode: (x) => (x === 220 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true },
    { key: "label", label: "Erişilebilir ad (label)", default: "Yapay ufuk", kind: "text" },
  ],
});

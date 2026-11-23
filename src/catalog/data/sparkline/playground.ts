import { definePlayground } from "../../spec.ts";

interface Values { area: boolean; dot: boolean; zero: boolean; color: number; width: number; height: number }

export default definePlayground<Values>({
  options: [
    { key: "area", label: "Altını doldur (area)", default: true, toCode: { true: "", false: null } },
    { key: "dot", label: "Son nokta (dot)", default: true, toCode: { true: null, false: "{false}" } },
    { key: "zero", label: "0'dan başla (zero)", default: false },
    { key: "color", label: "Palet rengi (color)", default: 0, options: [{ value: 0, label: "1" }, { value: 1, label: "2" }, { value: 2, label: "3" }, { value: 3, label: "4" }, { value: 4, label: "5" }], toCode: (v) => (v ? `{${v}}` : null) },
    { key: "width", label: "Genişlik (width)", default: 120, min: 60, max: 260, step: 10, unit: "px", toCode: (v) => (v === 120 ? null : `{${v}}`) },
    { key: "height", label: "Yükseklik (height)", default: 32, min: 16, max: 80, step: 4, unit: "px", toCode: (v) => (v === 32 ? null : `{${v}}`) },
  ],
});

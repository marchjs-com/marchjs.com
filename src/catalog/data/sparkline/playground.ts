import { definePlayground } from "../../spec.ts";

interface Values { variant: string; animate: string; area: boolean; dot: boolean; zero: boolean; color: number; width: number; height: number }

export default definePlayground<Values>({
  options: [
    { key: "variant", label: "Biçim (variant)", default: "line", options: [{ value: "line", label: "çizgi" }, { value: "bar", label: "sütun" }, { value: "winloss", label: "artı / eksi" }],
      toCode: { line: null } },
    { key: "animate", label: "Animasyon (animate)", default: "spring", options: [{ value: "spring", label: "yay" }, { value: "out", label: "yumuşak" }, { value: "stagger", label: "sırayla" }, { value: "off", label: "kapalı" }],
      toProp: (v) => (v === "spring" ? true : v === "off" ? false : v === "stagger" ? { stagger: 60 } : v), toCode: { spring: null, off: "{false}", stagger: "{{ stagger: 60 }}" } },
    { key: "area", label: "Altını doldur (area)", default: true, visibleWhen: (v) => v.variant === "line", toCode: { true: "", false: null } },
    { key: "dot", label: "Son nokta (dot)", default: true, visibleWhen: (v) => v.variant === "line", toCode: { true: null, false: "{false}" } },
    { key: "zero", label: "0'dan başla (zero)", default: false, visibleWhen: (v) => v.variant === "line" },
    { key: "color", label: "Palet rengi (color)", default: 0, visibleWhen: (v) => v.variant !== "winloss", options: [{ value: 0, label: "1" }, { value: 1, label: "2" }, { value: 2, label: "3" }, { value: 3, label: "4" }, { value: 4, label: "5" }], toCode: (v) => (v ? `{${v}}` : null) },
    { key: "width", label: "Genişlik (width)", default: 120, min: 60, max: 260, step: 10, unit: "px", toCode: (v) => (v === 120 ? null : `{${v}}`) },
    { key: "height", label: "Yükseklik (height)", default: 32, min: 16, max: 80, step: 4, unit: "px", toCode: (v) => (v === 32 ? null : `{${v}}`) },
  ],
});

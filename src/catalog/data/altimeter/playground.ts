import { definePlayground } from "../../spec.ts";

interface Values { value: number; unit: string; pressure: string; tenThousands: boolean; color: string; size: number; motion: boolean; label: string }

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    // value is required: the bare Altimeter in MarchIDE shows this altitude
    { key: "value", label: "İrtifa (value)", default: 12500, min: 0, max: 40000, step: 100, toCode: (x) => `{${x}}` },
    { key: "unit", label: "Birim (unit)", default: "ft", options: [{ value: "ft", label: "ft" }, { value: "m", label: "m" }], toCode: { ft: null } },
    { key: "pressure", label: "Basınç penceresi (pressure)", default: "hPa", options: [{ value: "hPa", label: "1013 hPa" }, { value: "inHg", label: "29.92 inHg" }, { value: "none", label: "yok" }],
      toCode: { hPa: "{1013}", inHg: '{29.92} pressureUnit="inHg"', none: null }, toProps: (x) => (x === "none" ? { pressure: null } : x === "inHg" ? { pressure: 29.92, pressureUnit: "inHg" } : { pressure: 1013, pressureUnit: "hPa" }) },
    // the ten-thousands pointer is a part: parts={{ tenThousands: false }}
    { key: "tenThousands", label: "On binler ibresi (parts.tenThousands)", default: true, prop: "parts",
      toCode: { true: null, false: "{{ tenThousands: false }}" }, toProp: (x) => (x ? undefined : { tenThousands: false }) },
    { key: "color", label: "On binler rengi (color)", default: "warning", options: [{ value: "warning", label: "kehribar" }, { value: "danger", label: "kırmızı" }, { value: "brand-blue", label: "mavi" }],
      visibleWhen: (v) => v.tenThousands, toCode: { warning: null } },
    { key: "size", label: "Genişlik (size)", default: 220, min: 160, max: 320, step: 10, unit: "px", toCode: (x) => (x === 220 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true },
    { key: "label", label: "Erişilebilir ad (label)", default: "İrtifa", kind: "text" },
  ],
});

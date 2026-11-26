import { definePlayground } from "../../spec.ts";

interface Values { value: number; unit: string; secondary: boolean; zones: boolean; color: string; size: number; motion: boolean; label: string }

const ZONES = [{ from: -30, to: 0, color: "info" }, { from: 15, to: 25, color: "success" }, { from: 30, to: 50, color: "danger" }];

export default definePlayground<Values>({
  stage: "center",
  code: {},
  options: [
    // value is required (°C): the bare Thermometer in MarchIDE shows this temperature
    { key: "value", label: "Sıcaklık (value, °C)", default: 22, min: -30, max: 50, step: 0.5, unit: "°C", toCode: (x) => `{${x}}` },
    { key: "unit", label: "Birim (unit)", default: "C", options: [{ value: "C", label: "°C" }, { value: "F", label: "°F" }], toCode: { C: null } },
    { key: "secondary", label: "İkinci ölçek (secondary)", default: false },
    { key: "zones", label: "Renkli bölgeler (zones)", default: true,
      toCode: { true: '{[{ from: -30, to: 0, color: "info" }, { from: 15, to: 25, color: "success" }, { from: 30, to: 50, color: "danger" }]}', false: null },
      toProp: (x) => (x ? ZONES : undefined) },
    { key: "color", label: "Sıvı rengi (color)", default: "", options: [{ value: "", label: "bölgeye göre" }, { value: "danger", label: "kırmızı" }, { value: "brand-blue", label: "mavi" }, { value: "brand-purple", label: "mor" }],
      toCode: (x) => (x ? JSON.stringify(x) : null), toProp: (x) => (x || undefined) },
    { key: "size", label: "Yükseklik (size)", default: 220, min: 140, max: 320, step: 10, unit: "px", toCode: (x) => (x === 220 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true },
    { key: "label", label: "Erişilebilir ad (label)", default: "Sıcaklık", kind: "text" },
  ],
});

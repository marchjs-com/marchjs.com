import { definePlayground } from "../../spec.ts";

interface Values {
  variant: string; value: number; source: string; zones: boolean; redline: string; peak: boolean; needle: string;
  readout: string; color: string; size: number; motion: boolean; unit: string; label: string; needles: boolean;
}

const SCALE: Record<string, [number, number]> = { speedometer: [0, 240], tachometer: [0, 8000], half: [0, 100], vu: [-20, 3] };
/** The option's 0–100 % as a value on the variant's scale (what the stage passes as `value`). In MarchIDE an
 *  instance's values hold only what was changed: no variant is the default look. */
export const onScale = (v: { variant?: string | undefined; value: number }): number => { const [lo, hi] = SCALE[v.variant ?? "speedometer"] ?? [0, 100]; return Math.round(lo + ((hi - lo) * v.value) / 100); };

export default definePlayground<Values>({
  stage: "center",
  options: [
    { key: "variant", label: "Görünüm (variant)", default: "speedometer", options: [{ value: "speedometer", label: "hız" }, { value: "tachometer", label: "devir" }, { value: "half", label: "yarım" }, { value: "vu", label: "VU" }],
      toCode: { speedometer: null } },
    { key: "value", label: "Değer (value; ölçeğin yüzdesi)", default: 45, min: 0, max: 100, step: 1, visibleWhen: (v) => !(v.variant === "vu" && v.source === "demo"),
      toCode: (x, v) => `{${onScale({ variant: v.variant, value: x as number })}}`, toProp: (x, v) => onScale({ variant: v.variant, value: x as number }) },
    { key: "source", label: "Ses kaynağı (source)", default: "none", options: [{ value: "none", label: "yok (value)" }, { value: "demo", label: "demo sesi" }], visibleWhen: (v) => v.variant === "vu",
      toCode: { none: null, demo: '{audioSource("demo")}' }, toProp: () => undefined },
    { key: "zones", label: "Renkli bölgeler (zones)", default: false, visibleWhen: (v) => v.variant !== "vu",
      toCode: { true: '{[{ from: 0, to: 60, color: "success" }, { from: 60, to: 85, color: "warning" }]}', false: null },
      toProp: (x, v) => (x ? [{ from: onScale({ variant: v.variant, value: 0 }), to: onScale({ variant: v.variant, value: 60 }), color: "success" }, { from: onScale({ variant: v.variant, value: 60 }), to: onScale({ variant: v.variant, value: 85 }), color: "warning" }] : undefined) },
    { key: "redline", label: "Kırmızı çizgi (redline)", default: "auto", options: [{ value: "auto", label: "varsayılan" }, { value: "85", label: "%85'te" }, { value: "off", label: "yok" }],
      toCode: (x, v) => (x === "auto" ? null : x === "off" ? "{false}" : `{${onScale({ variant: v.variant, value: 85 })}}`),
      toProp: (x, v) => (x === "auto" ? undefined : x === "off" ? false : onScale({ variant: v.variant, value: 85 })) },
    { key: "peak", label: "Tepe işareti (peak)", default: true },
    // a second needle (needles): an average at 70 % of the value, on its own spring, spoken with its label
    { key: "needles", label: "İkinci ibre (needles)", default: false, visibleWhen: (v) => v.variant !== "vu",
      toCode: { true: '{[{ value: $avg, label: "Ortalama", color: "info", length: 0.7 }]}', false: null },
      toProp: (x, v) => (x ? [{ value: Math.round(onScale({ variant: v.variant, value: v.value }) * 0.7), label: "Ortalama", color: "info", length: 0.7 }] : undefined) },
    { key: "needle", label: "İbre hareketi (needle)", default: "auto", options: [{ value: "auto", label: "varsayılan" }, { value: "spring", label: "yay" }, { value: "vu", label: "VU" }, { value: "none", label: "atlar" }],
      toCode: { auto: null }, toProp: (x) => (x === "auto" ? undefined : x) },
    // no "default" choice: it was the rolling number again (the default of every look but the VU meter, which has none)
    { key: "readout", label: "Gösterge (readout)", default: "true", options: [{ value: "true", label: "sayı" }, { value: "odometer", label: "çarklar" }, { value: "false", label: "yok" }],
      toCode: (x, v) => (x === "true" ? (v.variant === "vu" ? "" : null) : x === "odometer" ? '"odometer"' : "{false}"),
      toProp: (x) => (x === "odometer" ? "odometer" : x === "true") },
    { key: "unit", label: "Birim (unit)", default: "km/h", kind: "text", visibleWhen: (v) => v.variant !== "vu", toCode: (x) => (x ? JSON.stringify(x) : null) },
    { key: "color", label: "Renk (color)", default: "", options: [{ value: "", label: "vurgu" }, { value: "brand-blue", label: "mavi" }, { value: "success", label: "yeşil" }, { value: "brand-purple", label: "mor" }],
      toProp: (x) => (x || undefined), toCode: (x) => (x ? JSON.stringify(x) : null) },
    { key: "size", label: "Genişlik (size)", default: 240, min: 160, max: 340, step: 10, unit: "px", toCode: (x) => (x === 220 ? null : `{${x}}`) },
    { key: "motion", label: "Hareket (motion)", default: true },
    { key: "label", label: "Erişilebilir ad (label)", default: "Hız", kind: "text" },
  ],
});

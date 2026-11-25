import { definePlayground } from "../../spec.ts";

interface Values { input: string; value: number; channels: number; orientation: string; segments: number; scale: string; floor: number; ticks: boolean;
  peakHold: number; clip: boolean; variant: string; size: string; colors: string; labels: boolean; motion: boolean; label: string }

export default definePlayground<Values>({
  options: [
    // the demo's input: the synthesized loop through `source`, or a number through `value`
    { key: "input", label: "Giriş", default: "demo", options: [{ value: "demo", label: "demo müzik (source)" }, { value: "value", label: "sayı (value)" }],
      prop: "source", toCode: { demo: "{song}", value: null }, toProp: (x) => (x === "demo" ? "demo" : undefined) },
    { key: "value", label: "Değer (value)", default: 60, min: 0, max: 100, step: 1, unit: "%", visibleWhen: (v) => v.input === "value",
      toCode: (x) => `{${Number(x) / 100}}`, toProp: (x) => Number(x) / 100 },
    { key: "channels", label: "Kanal (channels)", default: 2, options: [{ value: 1, label: "mono" }, { value: 2, label: "stereo" }], toCode: (x) => `{${x}}` },
    { key: "orientation", label: "Yön (orientation)", default: "vertical", options: [{ value: "vertical", label: "dikey" }, { value: "horizontal", label: "yatay" }] },
    { key: "segments", label: "LED sayısı (segments)", default: 24, min: 8, max: 48, step: 1, toCode: (x) => (x === 24 ? null : `{${x}}`) },
    { key: "scale", label: "Ölçek (scale)", default: "linear", options: [{ value: "linear", label: "doğrusal" }, { value: "db", label: "desibel" }] },
    { key: "floor", label: "dB tabanı (floor)", default: -48, min: -72, max: -24, step: 6, unit: "dB", visibleWhen: (v) => v.scale === "db", toCode: (x) => (x === -48 ? null : `{${x}}`) },
    { key: "ticks", label: "Ölçek işaretleri (ticks)", default: false },
    { key: "peakHold", label: "Tepe bekleme (peakHold; 0 = yok)", default: 1500, min: 0, max: 4000, step: 250, unit: "ms",
      toCode: (x) => (x === 1500 ? null : x ? `{${x}}` : "{false}"), toProp: (x) => (x ? x : false) },
    { key: "clip", label: "Kırpılma ışığı (clip)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "variant", label: "Görünüm (variant)", default: "console", options: [{ value: "console", label: "konsol" }, { value: "flat", label: "düz" }] },
    { key: "size", label: "Kalınlık (size)", default: "md", options: ["sm", "md", "lg"] },
    { key: "colors", label: "Bölge renkleri (colors)", default: "zones", options: [{ value: "zones", label: "yeşil · amber · kırmızı" }, { value: "brand", label: "HADİ" }, { value: "cool", label: "serin" }],
      toCode: { zones: null, brand: '{["brand-blue", "brand-gold", "brand-pink"]}', cool: '{["info", "brand-purple", "danger"]}' },
      toProp: (x) => (x === "brand" ? ["brand-blue", "brand-gold", "brand-pink"] : x === "cool" ? ["info", "brand-purple", "danger"] : undefined) },
    { key: "labels", label: "Kanal harfleri (labels)", default: true, visibleWhen: (v) => v.channels === 2, toCode: (x) => (x ? null : "{false}") },
    { key: "motion", label: "Hareket (motion)", default: true, toCode: (x) => (x ? null : "{false}") },
    { key: "label", label: "Erişilebilir ad (label)", default: "Ana çıkış", kind: "text" },
  ],
});

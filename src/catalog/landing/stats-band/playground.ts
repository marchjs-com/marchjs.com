import { definePlayground } from "../../spec.ts";

// sample figures in plain JSON (strings, numbers, plain objects): the raw component in MarchIDE receives them as they are
const SAMPLE = [
  { value: 250000, label: "kişi HADİ'de", format: { notation: "compact" }, suffix: "+" },
  { value: 1200, label: "etkinlik her hafta" },
  { value: 4.8, decimals: 1, label: "uygulama puanı", note: "5 üzerinden" },
  { value: 81, label: "ilde etkinlik" },
];

interface Values { sample: number; variant: string; mode: string; color: string; reveal: string }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample figures: an array cannot come from a switch
    { key: "sample", label: "Örnek içerik", default: 4, min: 0, max: 4, prop: "items", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "variant", label: "Görünüm", default: "divided", options: [{ value: "plain", label: "sade" }, { value: "divided", label: "çizgili" }, { value: "cards", label: "kartlar" }] },
    { key: "mode", label: "Sayaç", default: "count", options: [{ value: "count", label: "sayma" }, { value: "roll", label: "odometre" }, { value: "none", label: "yok (düz sayı)" }] },
    { key: "color", label: "Sayı rengi", default: "default", options: [{ value: "default", label: "metin rengi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "brand-green", label: "yeşil" }], prop: "m:color", toCode: { default: null } },
    { key: "reveal", label: "Giriş hareketi", default: "up", options: [{ value: "up", label: "yukarı" }, { value: "scale", label: "ölçek" }, { value: "flip", label: "çevirme" }, { value: "off", label: "yok" }], toCode: (x) => (x === "off" ? "{false}" : x === "up" ? null : `{${JSON.stringify({ effect: x })}}`) },
  ],
});

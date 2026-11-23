import { definePlayground } from "../../spec.ts";

// sample logos in plain JSON (strings, numbers, plain objects): the raw component in MarchIDE receives them as they are
const SAMPLE = [
  { name: "Kitap Kulübü" }, { name: "Koşu Ekibi" }, { name: "Seramik Atölyesi" },
  { name: "Doğa Yürüyüşü" }, { name: "Film Gecesi" }, { name: "Satranç Kafe" },
];

interface Values { sample: number; title: string; variant: string; mono: boolean; speed: number; reveal: string }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample logos: an array cannot come from a switch
    { key: "sample", label: "Örnek içerik", default: 6, min: 0, max: 6, prop: "logos", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "title", label: "Başlık (title)", default: "Bu topluluklar HADİ'de buluşuyor", kind: "text" },
    { key: "variant", label: "Görünüm", default: "marquee", options: [{ value: "grid", label: "ızgara" }, { value: "marquee", label: "kayan şerit" }] },
    { key: "mono", label: "Tek ton", default: true, toCode: { true: null, false: "{false}" } },
    { key: "speed", label: "Hız", default: 40, min: 10, max: 120, step: 10, unit: "px/sn", visibleWhen: (v) => v.variant === "marquee" },
    { key: "reveal", label: "Giriş hareketi", default: "fade", options: [{ value: "fade", label: "solma" }, { value: "up", label: "aşağıdan" }, { value: "scale", label: "büyüme" }, { value: "flip", label: "dönüş" }, { value: "none", label: "yok" }], visibleWhen: (v) => v.variant === "grid" },
  ],
});

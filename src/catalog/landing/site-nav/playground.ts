import { definePlayground } from "../../spec.ts";

// sample links in plain JSON (strings, numbers, plain objects): the raw component in MarchIDE receives them as they are
const SAMPLE = [
  { label: "Etkinlikler", href: "#", active: true },
  { label: "Nasıl çalışır", href: "#" },
  { label: "Premium", href: "#" },
  { label: "SSS", href: "#" },
  { label: "Blog", href: "#" },
];

interface Values { sample: number; brand: string; mode: string; shrink: boolean; hide: boolean; pill: boolean; pillColor: string }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample links: an array cannot come from a switch
    { key: "sample", label: "Örnek içerik", default: 4, min: 0, max: 5, prop: "links", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    // brand is required: a name is enough (a Brand with that name), so the raw component always has its start
    { key: "brand", label: "Marka adı (brand)", default: "HADİ", kind: "text" },
    { key: "mode", label: "Görünüm", default: "floating", options: [{ value: "solid", label: "dolu" }, { value: "transparent", label: "saydam → cam" }, { value: "floating", label: "yüzen hap" }] },
    { key: "shrink", label: "Kaydırınca küçül", default: true, toCode: { true: null, false: "{false}" } },
    { key: "hide", label: "Aşağı kaydırırken gizlen", default: false },
    { key: "pill", label: "Bağlantı altındaki hap", default: true, toCode: { true: null, false: "{false}" } },
    { key: "pillColor", label: "Hap rengi", default: "", options: [{ value: "", label: "yumuşak nötr" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }], visibleWhen: (v) => v.pill },
  ],
});

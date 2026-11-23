import { definePlayground } from "../../spec.ts";

// sample entries in plain JSON (strings, numbers, plain objects): the raw component in MarchIDE receives them as they are
const SAMPLE = [
  { time: "1. adım", title: "Etkinlik keşfi", body: "Yakınındaki etkinlikler, haritada ve takvimde.", status: "done" },
  { time: "2. adım", title: "Sohbet ve görüntülü görüşme", body: "Birebir, grup ve etkinlik sohbetleri.", status: "done" },
  { time: "3. adım", title: "Akış ve hikâyeler", body: "Anıları paylaş, beğen, keşfet.", status: "done" },
  { time: "Şimdi", title: "Tanışma yemekleri", body: "Ortak ilgi alanı olanlarla aynı masada.", status: "now" },
  { time: "Sırada", title: "Yeni şehirler", body: "Etkinlikler her ilde, her hafta.", status: "next" },
  { time: "Sonra", title: "Topluluk ödülleri", body: "En canlı topluluklar öne çıkar.", status: "next" },
];

interface Values { sample: number; badges: boolean; scroll: boolean; rail: boolean; color: string; labels: boolean }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample entries: an array cannot come from a switch
    { key: "sample", label: "Örnek içerik", default: 5, min: 0, max: 6, prop: "items", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "scroll", label: "Kaydırdıkça dolsun", default: true, toCode: { true: null, false: "{false}" } },
    { key: "badges", label: "Durum rozetleri", default: true, toCode: { true: null, false: "{false}" } },
    { key: "labels", label: "Rozet metinleri benim (Yayında / Yapılıyor / Sırada)", default: false, toCode: (x) => (x ? `{${JSON.stringify({ done: "Yayında", now: "Yapılıyor", next: "Sırada" })}}` : null), visibleWhen: (v) => v.badges },
    { key: "rail", label: "Çizgi", default: true, toCode: { true: null, false: "{false}" } },
    { key: "color", label: "Dolgu rengi", default: "default", options: [{ value: "default", label: "marka geçişi" }, { value: "brand-purple", label: "mor" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }], prop: "m:color", toCode: { default: null } },
  ],
});

import { definePlayground } from "../../spec.ts";

interface Values { sample: number; title: string; variant: string; check: boolean; both: boolean; mark: string; me: boolean; verdict: boolean }

// sample lines for the raw component in MarchIDE (plain JSON: an items array cannot come from a switch)
const SAMPLE = [
  { text: "Hep aynı beş arkadaşla buluşuyorsun", detail: "Yeni biri gelmesin istiyorsan bir mesaj grubu sana yeter.", instead: "Yeni yüzlere açıksın: HADİ'de her hafta yeni insanlarla tanışırsın." },
  { text: "Tek bir sade sohbet istiyorsun", detail: "HADİ akış, sohbet, etkinlik, tanışma: hepsi bir arada. Sana fazla gelebilir.", instead: "Hepsi bir arada olsun istiyorsun: sohbet, akış, etkinlik ve tanışma tek uygulamada." },
  { text: "Yeni insanlarla tanışmak istemiyorsun", detail: "HADİ'nin kapısı hep yeni insanlara açık.", instead: "Tanışmak istiyorsun: tanışma yemekleri ve etkinlikler seni bekliyor." },
  { text: "Telefonu az açmak istiyorsun", detail: "Akış, hikâyeler, etkinlik bildirimleri: HADİ'de hep bir şey oluyor.", instead: "Hareketli bir hayat seviyorsun: HADİ'de her gün yeni bir şey var." },
];
const FOR_YOU = [
  { text: "Yeni insanlarla tanışmak istiyorsun", detail: "Tanışma yemekleri, ilgi alanına göre gruplar." },
  { text: "Etkinlik bulmak da kurmak da istiyorsun", detail: "Planlı etkinlikler, takvim, gerekirse bilet." },
  { text: "Sohbet, akış ve etkinlik tek yerde olsun", detail: "Ayrı ayrı uygulama yerine tek bir HADİ." },
];

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample lines
    { key: "sample", label: "Örnek satırlar", default: 4, min: 0, max: 4, prop: "items", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "title", label: "Başlık (title)", default: "Sana göre değil, eğer…", kind: "text" },
    { key: "variant", label: "Görünüm", default: "cards", options: [{ value: "cards", label: "kartlar" }, { value: "list", label: "liste" }] },
    { key: "check", label: "İşaretlenebilir", default: true },
    { key: "both", prop: "forYou", label: "Kimin için olduğu da", default: true, toCode: (x) => (x ? `{${JSON.stringify(FOR_YOU)}}` : null) },
    { key: "mark", label: "İşaretler", default: "icons", options: [{ value: "icons", label: "çarpı / tik" }, { value: "own", label: "kendi işaretlerim" }, { value: "off", label: "yok" }], toCode: { icons: null, own: `{(state) => (state === "not" ? "🙅" : state === "marked" ? "🎉" : "👍")}`, off: "{false}" } },
    { key: "me", prop: "meLabel", label: "Kart etiketi ve ipucu", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.check },
    { key: "verdict", label: "Sonuç satırı", default: true, toCode: { true: null, false: "{false}" }, visibleWhen: (v) => v.check },
  ],
});

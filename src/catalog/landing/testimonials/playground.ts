import { definePlayground } from "../../spec.ts";

// sample quotes in plain JSON (strings, numbers, plain objects): the raw component in MarchIDE receives them as they are
const SAMPLE = [
  { quote: "Yeni şehirde ilk arkadaşlarımı bir tanışma yemeğinde buldum.", name: "Deniz Arı", role: "İzmir", rating: 5 },
  { quote: "Koşu grubumuzu HADİ'de kurduk; her salı yeni biri katılıyor.", name: "Mert Kaya", role: "Etkinlik düzenleyici", rating: 5 },
  { quote: "Atölyemin biletlerini ayrı bir siteye gerek kalmadan sattım.", name: "Leyla Demir", role: "Ankara", rating: 4 },
  { quote: "Sohbet, akış, etkinlik: telefonumda artık tek uygulama var.", name: "Can Yıldız", role: "Eskişehir", rating: 4 },
  { quote: "Hafta sonu ne yapsak derdi bitti.", name: "Ece Tan", role: "Bursa", rating: 5 },
  { quote: "Etkinlik öncesi görüntülü tanıştık; kimse yabancı değildi.", name: "Arda Su", role: "Antalya", rating: 5 },
  { quote: "Filtrelerle tam ilgimi çeken etkinlikleri buluyorum.", name: "Selin Ak", role: "İstanbul", rating: 5 },
  { quote: "Kitap kulübümüzün anılarını hikâyelerde paylaşıyoruz.", name: "Bora Er", role: "Trabzon", rating: 3 },
];

interface Values { sample: number; variant: string; cols: number; rating: boolean; ratingColor: string; avatar: boolean; quotes: boolean }

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample quotes: an array cannot come from a switch
    { key: "sample", label: "Örnek içerik", default: 7, min: 0, max: 8, prop: "items", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "variant", label: "Görünüm", default: "wall", options: [{ value: "grid", label: "ızgara" }, { value: "marquee", label: "kayan" }, { value: "wall", label: "duvar" }, { value: "slider", label: "kaydırmalı" }] },
    { key: "cols", label: "Sütun", default: 3, options: [{ value: 1, label: "1" }, { value: 2, label: "2" }, { value: 3, label: "3" }], visibleWhen: (v) => v.variant === "grid" || v.variant === "slider" },
    { key: "rating", label: "Yıldızlar", default: true, toCode: { true: null, false: "{false}" } },
    { key: "ratingColor", label: "Yıldız rengi", default: "", options: [{ value: "", label: "vurgu rengi" }, { value: "brand-gold", label: "altın" }, { value: "brand-orange", label: "turuncu" }], visibleWhen: (v) => v.rating },
    { key: "avatar", label: "Avatar", default: true, toCode: { true: null, false: "{false}" } },
    { key: "quotes", label: "Tırnak işaretleri", default: true, toCode: { true: null, false: "{false}" } },
  ],
});

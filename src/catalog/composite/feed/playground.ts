import { definePlayground } from "../../spec.ts";

interface Values { variant: string; delay: number; pages: number; empty: boolean; end: string; newColor: string }

// MarchIDE: the raw Feed takes its posts as a JSON list (one photo is a 2×2 PNG data URL); "Boş akış" gives an empty list
const PHOTO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR42mOw2PuDb+lLBlm/Gz+LxQAthgZP+C/XcgAAAABJRU5ErkJggg==";
const POSTS = [
  { id: "f1", author: { name: "HADİ Koşu Kulübü", handle: "hadi.kosu", verified: true }, time: "2026-11-18T07:30:00Z", text: "Bu hafta sonu sahil temizliği var, eldivenler bizden! 🌊", media: [{ src: PHOTO, alt: "Deniz" }], likes: 412, comments: 23 },
  { id: "f2", author: { name: "Kitap Kulübü", handle: "kitap.kulubu" }, time: "2026-11-17T18:10:00Z", text: "Ayın kitabı oylamaya açıldı. Önerilerinizi yorumlara bırakın.", likes: 87, comments: 41 },
  { id: "f3", author: { name: "Masa Oyunları Ekibi", handle: "masa.oyun" }, time: "2026-11-16T20:00:00Z", text: "Oyun gecesi için ikinci salonu da açtık.", likes: 56, comments: 4, shares: 2 },
];

export default definePlayground<Values>({
  options: [
    { key: "variant", label: "Görünüm", default: "card", options: [{ value: "card", label: "kartlar" }, { value: "flat", label: "düz" }] },
    { key: "delay", label: "Ağ gecikmesi", default: 900, options: [{ value: 300, label: "hızlı" }, { value: 900, label: "orta" }, { value: 2500, label: "yavaş" }], prop: false },
    { key: "pages", label: "Sayfa sayısı", default: 3, options: [{ value: 1, label: "1" }, { value: 3, label: "3" }, { value: 50, label: "50" }], prop: "hasMore", toCode: (n) => (Number(n) > 1 ? "{true}" : "{false}") },
    { key: "empty", label: "Boş akış", default: false, prop: "posts", toCode: (on) => (on ? "{[]}" : `{${JSON.stringify(POSTS)}}`) },
    { key: "end", label: "Bitiş işareti (son sayfada)", default: "on", options: [{ value: "on", label: "hazır" }, { value: "own", label: "kendi içeriğim" }, { value: "off", label: "yok" }], toCode: { on: null, own: '"Bugünlük bu kadar 🎉 Yarın yeni etkinlikler var."', off: "{false}" } },
    { key: "newColor", label: "Yeni gönderi hapı rengi", default: "brand-blue", options: [{ value: "brand-blue", label: "mavi" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "primary", label: "tema vurgusu" }], prop: false },
  ],
});

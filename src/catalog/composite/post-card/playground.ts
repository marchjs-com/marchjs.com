import { definePlayground } from "../../spec.ts";

interface Values { photos: number; variant: string; clamp: number; menu: boolean; doubleTapLike: boolean; place: boolean; avatar: boolean; time: string; icons: boolean; likeColor: string }

// MarchIDE: the raw PostCard takes the post as a JSON object (the photos are 2×2 PNG data URLs, drawn as soft colour
// blends; an SVG data URL is not allowed in <img>); the ⋯ menu as a JSON list. The card's code writes the same literals.
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR42m";
const PHOTOS = ["P4WSz2xmMmQ43VWzlpbwAsKgV3rhVt4w", "Ow2PuDb+lLBlm/Gz+LxQAthgZP+C/Xcg", "PY/f2C0tE4BrFUE5FgXQAtngULJa1nqA", "OQk/Y21GtkeLWZg19cCwAXQQNaq9+sQQ", "P4+6xrSzAnQ4Up/7/PxwExlAbyzjJBwg", "P4+6zr9yQbhuXdvwz1GgE6ZgdD1tcTig"];
const photo = (p: string, i: number) => ({ src: `${PNG}${p}AAAAABJRU5ErkJggg==`, alt: `Fotoğraf ${i + 1}` });
const postCode = (n: unknown): string => `{${JSON.stringify({ id: "p1", author: { name: "HADİ Koşu Kulübü", handle: "hadi.kosu", verified: true }, time: "2026-11-18T07:30:00Z",
  place: "Sahil yolu", text: "Pazar sabahı sahil koşusu tamamlandı! 🧡 Tempo grubu 6:30'da, yürüyüş grubu 7:00'de buluşuyor.",
  media: PHOTOS.slice(0, Number(n)).map(photo), likes: 1284, comments: 46, shares: 12 })}}`;

export default definePlayground<Values>({
  code: { props: { onLike: "{like}" } },
  options: [
    { key: "photos", label: "Fotoğraf", default: 3, options: [0, 1, 2, 3, 4, 6], prop: "post", toCode: postCode },
    { key: "variant", label: "Görünüm", default: "card", options: [{ value: "card", label: "kart" }, { value: "flat", label: "düz" }] },
    { key: "clamp", label: "Metin satırı", default: 3, options: [{ value: 2, label: "2" }, { value: 3, label: "3" }, { value: 0, label: "hepsi" }] },
    { key: "doubleTapLike", label: "Çift dokunuşla beğen", default: true, visibleWhen: (v) => v.photos > 0 },
    { key: "menu", label: "⋯ menüsü", default: true, toCode: { true: '{[{"label":"Bağlantıyı kopyala"},{"label":"Gizle"},{"label":"Bildir","danger":true}]}', false: null } },
    { key: "place", label: "Konum", default: true, prop: false },
    { key: "avatar", label: "Avatar", default: true },
    { key: "time", label: "Zaman", default: "relative", options: [{ value: "relative", label: "göreli (18 dk önce)" }, { value: "own", label: "kendi biçimim (saat)" }, { value: "off", label: "yok" }], toCode: { relative: null, own: "{formatTime}", off: "{false}" } },
    { key: "icons", label: "Kendi ikonlarım", default: false, prop: "commentIcon", toCode: { true: { commentIcon: "{zap}", shareIcon: "{star}", menuIcon: "{settings}" }, false: { commentIcon: null, shareIcon: null, menuIcon: null } } },
    { key: "likeColor", label: "Beğeni rengi", default: "brand-pink", options: [{ value: "brand-pink", label: "pembe" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-purple", label: "mor" }, { value: "danger", label: "kırmızı" }] },
  ],
});

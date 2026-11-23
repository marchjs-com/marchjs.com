import { definePlayground } from "../../spec.ts";

interface Values { self: boolean; cover: string; story: string; photo: boolean; stats: string; wording: string }

// MarchIDE: the raw ProfileHeader takes the profile as a JSON object (the cover is a 2×2 PNG data URL: a soft blend);
// "Kapak fotoğrafı" and "Hikâye halkası" write it
const COVER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR42mOw2PuDb+lLBlm/Gz+LxQAthgZP+C/XcgAAAABJRU5ErkJggg==";
const userCode = (_: unknown, v: Values): string => `{${JSON.stringify({ name: "HADİ Koşu Kulübü", handle: "hadi.kosu", verified: true,
  story: v.story === "none" ? undefined : v.story, cover: v.photo ? COVER : undefined,
  bio: "Her pazar sabahı sahilde koşuyoruz. Tempo grupları, yeni başlayanlar için yürüyüş ve dönüşte kahve ☕", posts: 248, followers: 986, following: 186 })}}`;

export default definePlayground<Values>({
  options: [
    { key: "self", label: "Kendi profilim", default: false },
    { key: "cover", label: "Kapak", default: "md", options: [{ value: "none", label: "yok" }, { value: "sm", label: "kısa" }, { value: "md", label: "orta" }, { value: "lg", label: "uzun" }] },
    { key: "photo", label: "Kapak fotoğrafı", default: true, visibleWhen: (v) => v.cover !== "none", prop: "user", toCode: userCode },
    { key: "story", label: "Hikâye halkası", default: "new", options: [{ value: "new", label: "yeni" }, { value: "seen", label: "görüldü" }, { value: "none", label: "yok" }], prop: "user", toCode: userCode },
    { key: "stats", label: "İstatistikler", default: "all", options: [{ value: "all", label: "üçü de" }, { value: "two", label: "takipçi + takip" }, { value: "off", label: "yok" }], toCode: { all: null, two: '{["followers","following"]}', off: "{false}" } },
    { key: "wording", label: "Metinler", default: "default", options: [{ value: "default", label: "hazır metinler" }, { value: "own", label: "kendi metinlerim (Üye, Yaz…)" }], prop: "labels", toCode: { default: null, own: '{{"message":"Yaz","edit":"Kulübü düzenle","posts":"Paylaşım","followers":"Üye","following":"Dost kulüp"}}' } },
  ],
});

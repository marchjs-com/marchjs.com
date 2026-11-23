import { definePlayground } from "../../spec.ts";

interface Values { content: string; eyebrow: string; title: string; lead: string; tone: string; align: string; width: string; color: string; reveal: string }

export default definePlayground<Values>({
  options: [
    // the heading group: the raw component in MarchIDE gets these texts (empty: left out)
    { key: "eyebrow", label: "Üst satır (eyebrow)", default: "Özellikler", kind: "text" },
    { key: "title", label: "Başlık (title)", default: "İhtiyacın olan her şey, tek pakette", kind: "text" },
    { key: "lead", label: "Açıklama (lead)", default: "Bileşenler, tema, hareket ve hız: hepsi aynı dili konuşur.", kind: "text" },
    // the section's content: a text (children) in the raw component
    { key: "content", prop: "children", label: "İçerik (children)", default: "İçerik buraya gelir", kind: "text" },
    { key: "tone", label: "Ton", default: "muted", options: [{ value: "plain", label: "düz" }, { value: "muted", label: "soluk" }, { value: "brand", label: "marka" }, { value: "inverse", label: "ters" }] },
    { key: "align", label: "Başlık hizası", default: "center", options: [{ value: "center", label: "orta" }, { value: "start", label: "baş" }] },
    { key: "color", label: "Renk (üst yazı ve marka tonu)", default: "default", options: [{ value: "default", label: "vurgu rengi" }, { value: "brand-purple", label: "mor" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-green", label: "yeşil" }], prop: "m:color", toCode: { default: null } },
    { key: "reveal", label: "Başlık girişi", default: "up", options: [{ value: "up", label: "yukarı" }, { value: "blur", label: "bulanık" }, { value: "flip", label: "çevirme" }, { value: "off", label: "yok" }], toCode: (x) => (x === "up" ? null : x === "off" ? "{false}" : `{${JSON.stringify({ effect: String(x) })}}`) },
    { key: "width", label: "Genişlik", default: "default", options: [{ value: "narrow", label: "dar" }, { value: "default", label: "normal" }, { value: "wide", label: "geniş" }] },
  ],
});

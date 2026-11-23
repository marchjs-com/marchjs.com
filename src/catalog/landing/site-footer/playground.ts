import { definePlayground } from "../../spec.ts";

interface Values { sample: number; sampleLegal: boolean; brand: string; about: string; newsletter: boolean; wordmark: boolean; social: boolean; toTop: boolean; copyright: boolean }

// link columns for the raw component in MarchIDE (plain JSON: a columns array cannot come from a switch)
const SAMPLE = [
  { title: "HADİ", links: [{ label: "Etkinlikler", href: "#" }, { label: "Tanışma yemekleri", href: "#" }, { label: "Premium", href: "#" }] },
  { title: "Şirket", links: [{ label: "Hakkımızda", href: "#" }, { label: "Kariyer", href: "#" }, { label: "İletişim", href: "#" }] },
  { title: "Destek", links: [{ label: "Yardım merkezi", href: "#" }, { label: "Topluluk kuralları", href: "#" }, { label: "Güvenlik", href: "#" }] },
];
const LEGAL = [{ label: "Gizlilik", href: "#" }, { label: "Koşullar", href: "#" }];

export default definePlayground<Values>({
  options: [
    // the raw component in MarchIDE (and the card's code) gets this many sample link columns
    { key: "sample", label: "Örnek sütunlar", default: 3, min: 0, max: 3, prop: "columns", toCode: (n) => (Number(n) ? `{${JSON.stringify(SAMPLE.slice(0, Number(n)))}}` : null) },
    { key: "sampleLegal", label: "Yasal bağlantılar", default: true, prop: "legal", toCode: (x) => (x ? `{${JSON.stringify(LEGAL)}}` : null) },
    // brand is required: the raw component in MarchIDE gets this name (a string is the brand's name)
    { key: "brand", label: "Marka adı (brand)", default: "HADİ", kind: "text" },
    { key: "about", label: "Kısa satır (about)", default: "Sosyal ağ, sohbet ve etkinlikler tek yerde.", kind: "text" },
    // the form's texts as JSON (its onSubmit is the card's)
    { key: "newsletter", label: "Bülten formu", default: true, toCode: (x) => (x ? `{${JSON.stringify({ title: "Bülten", lead: "Ayda bir, yalnız yenilikler." })}}` : null) },
    // icon links: the icons are objects, drawn by the showcase card only
    { key: "social", label: "Sosyal bağlantılar", default: true, toCode: () => null },
    { key: "wordmark", label: "Büyük yazı", default: true, toCode: (x, v) => (x ? JSON.stringify(v.brand || "HADİ") : null) },
    { key: "copyright", label: "Telif satırı", default: true, toCode: { true: null, false: "{false}" } },
    { key: "toTop", label: "Başa dön düğmesi", default: true, toCode: { true: null, false: "{false}" } },
  ],
});
